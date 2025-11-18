#!/usr/bin/env tsx

import { google } from 'googleapis';
import { getGoogleAuth } from '../lib/google-auth';
import { db } from '../lib/db';

const DEFAULT_DAYS = 7;

async function importGoogleCalendar(auth: any, userId: string, days: number) {
  const calendar = google.calendar({ version: 'v3', auth });

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  console.log(`Importing calendar events from ${startDate.toISOString()} to ${now.toISOString()}`);

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startDate.toISOString(),
    timeMax: now.toISOString(),
    maxResults: 1000,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = response.data.items || [];
  console.log(`Found ${events.length} calendar events`);

  for (const event of events) {
    const occurredAt = new Date(event.start?.dateTime || event.start?.date || now);

    await db.eventLog.create({
      data: {
        userId,
        type: 'calendar',
        source: 'google_calendar',
        occurredAt,
        payloadJson: {
          summary: event.summary,
          description: event.description,
          location: event.location,
          attendees: event.attendees?.map(a => a.email),
          htmlLink: event.htmlLink,
        },
      },
    });
  }

  console.log(`Imported ${events.length} calendar events`);
}

async function importGmail(auth: any, userId: string, days: number) {
  const gmail = google.gmail({ version: 'v1', auth });

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const query = `after:${Math.floor(startDate.getTime() / 1000)}`;
  console.log(`Importing Gmail messages with query: ${query}`);

  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 500,
  });

  const messages = response.data.messages || [];
  console.log(`Found ${messages.length} email messages`);

  for (const message of messages.slice(0, 100)) { // Limit to 100 for performance
    const fullMessage = await gmail.users.messages.get({
      userId: 'me',
      id: message.id!,
      format: 'metadata',
      metadataHeaders: ['From', 'To', 'Subject', 'Date'],
    });

    const headers = fullMessage.data.payload?.headers || [];
    const getHeader = (name: string) => headers.find(h => h.name === name)?.value;

    const dateStr = getHeader('Date');
    const occurredAt = dateStr ? new Date(dateStr) : new Date();

    await db.eventLog.create({
      data: {
        userId,
        type: 'email',
        source: 'gmail',
        occurredAt,
        payloadJson: {
          from: getHeader('From'),
          to: getHeader('To'),
          subject: getHeader('Subject'),
          snippet: fullMessage.data.snippet,
          messageId: message.id,
        },
      },
    });
  }

  console.log(`Imported ${Math.min(messages.length, 100)} email messages`);
}

async function main() {
  const args = process.argv.slice(2);
  const daysArg = args.find(arg => arg.startsWith('--days='));
  const days = daysArg ? parseInt(daysArg.split('=')[1], 10) : DEFAULT_DAYS;

  console.log(`Starting Google import for the last ${days} days...`);

  try {
    const auth = await getGoogleAuth();

    // Get or create default user
    let user = await db.lifeUser.findFirst();
    if (!user) {
      user = await db.lifeUser.create({
        data: {
          email: 'default@example.com',
          name: 'Default User',
        },
      });
      console.log('Created default user:', user.id);
    } else {
      console.log('Using existing user:', user.id);
    }

    // Import calendar events
    await importGoogleCalendar(auth, user.id, days);

    // Import Gmail messages
    await importGmail(auth, user.id, days);

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
