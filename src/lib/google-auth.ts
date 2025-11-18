import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

export async function getGoogleAuth() {
  let credentials;

  // Load credentials from environment or file
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    credentials = {
      installed: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uris: [process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000'],
      },
    };
  } else if (fs.existsSync(CREDENTIALS_PATH)) {
    const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
    credentials = JSON.parse(content);
  } else {
    throw new Error('Google credentials not found. Please set environment variables or create credentials.json');
  }

  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Load token from file
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH, 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(token));
  } else {
    console.warn('Token file not found. You may need to authenticate first.');
  }

  return oAuth2Client;
}

export function generateAuthUrl() {
  const { client_id, client_secret, redirect_uris } = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, 'utf-8')
  ).installed;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
}

export async function getTokenFromCode(code: string) {
  const { client_id, client_secret, redirect_uris } = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, 'utf-8')
  ).installed;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  const { tokens } = await oAuth2Client.getToken(code);

  // Save token to file
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

  return tokens;
}
