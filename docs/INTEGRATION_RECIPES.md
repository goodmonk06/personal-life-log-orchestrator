# Integration Recipes

This guide provides practical recipes for integrating the Personal Life Log Orchestrator with other services and systems.

## Table of Contents

1. [Authentication Integration](#authentication-integration)
2. [Notification Systems](#notification-systems)
3. [External Data Sources](#external-data-sources)
4. [Analytics & Visualization](#analytics--visualization)
5. [Mobile App Integration](#mobile-app-integration)
6. [Automation & Webhooks](#automation--webhooks)

---

## Authentication Integration

### NextAuth.js Integration

Add user authentication with NextAuth.js:

```typescript
// src/server/trpc.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerSession(authOptions);

  return {
    db,
    session,
    userId: session?.user?.id,
    ...opts,
  };
};

// Protected procedure
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.userId,
    },
  });
});
```

### Clerk Integration

```typescript
import { getAuth } from '@clerk/nextjs/server';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const auth = getAuth(opts.req);

  return {
    db,
    userId: auth.userId,
    ...opts,
  };
};
```

---

## Notification Systems

### Email Notifications via SendGrid

```typescript
// src/lib/adapters/implementations/sendgrid-notification.ts
import sgMail from '@sendgrid/mail';
import { INotificationAdapter } from '../index';

export class SendGridNotificationAdapter implements INotificationAdapter {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      html: body,
    });
  }

  async sendSMS(to: string, message: string): Promise<void> {
    // Implement via Twilio or similar
    throw new Error('SMS not implemented');
  }

  async sendPush(userId: string, title: string, body: string): Promise<void> {
    // Implement via Firebase Cloud Messaging
    throw new Error('Push not implemented');
  }
}

// Register in registry.ts
import { SendGridNotificationAdapter } from './implementations/sendgrid-notification';

registry.register<INotificationAdapter>(
  'notification',
  new SendGridNotificationAdapter()
);
```

### Daily Summary Email

```typescript
// src/services/daily-email.ts
import { getNotificationAdapter } from '@/lib/adapters/registry';
import { db } from '@/lib/db';

export async function sendDailySummaryEmail(userId: string, date: string) {
  const user = await db.lifeUser.findUnique({ where: { id: userId } });
  const summary = await db.dailySummary.findUnique({
    where: { userId_date: { userId, date: new Date(date) } },
  });

  if (!user?.email || !summary) return;

  const notification = getNotificationAdapter();

  await notification.sendEmail(
    user.email,
    `Daily Summary - ${date}`,
    `
      <h2>Your Day at a Glance</h2>
      <p>${summary.summaryMarkdown}</p>

      <h3>Highlights</h3>
      <ul>
        ${summary.highlightsJson.goodThings.map(t => `<li>${t}</li>`).join('')}
      </ul>

      <h3>Tomorrow's Focus</h3>
      <ul>
        ${summary.highlightsJson.todoTomorrow.map(t => `<li>${t}</li>`).join('')}
      </ul>
    `
  );
}

// Schedule with cron
// 0 20 * * * - Every day at 8 PM
```

---

## External Data Sources

### Notion Integration

```typescript
// src/lib/integrations/notion.ts
import { Client } from '@notionhq/client';
import { IExternalIntegrationAdapter, ImportResult } from '@/lib/adapters';

export class NotionIntegration implements IExternalIntegrationAdapter {
  private client: Client;

  constructor(private apiKey: string) {
    this.client = new Client({ auth: apiKey });
  }

  async authenticate(credentials): Promise<boolean> {
    try {
      await this.client.users.me({});
      return true;
    } catch {
      return false;
    }
  }

  async import(userId: string): Promise<ImportResult> {
    // Query Notion database
    const response = await this.client.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
    });

    const events = response.results.map(page => ({
      userId,
      type: 'note',
      source: 'notion',
      occurredAt: new Date(page.created_time),
      payloadJson: {
        title: page.properties.Title?.title[0]?.plain_text,
        // ... other properties
      },
    }));

    await db.eventLog.createMany({ data: events });

    return {
      itemsImported: events.length,
      itemsFailed: 0,
    };
  }

  async export(userId: string, data: unknown[]): Promise<void> {
    // Export notes to Notion
    for (const note of data as Note[]) {
      await this.client.pages.create({
        parent: { database_id: process.env.NOTION_DATABASE_ID! },
        properties: {
          Title: {
            title: [{ text: { content: note.title || note.date } }],
          },
          Content: {
            rich_text: [{ text: { content: note.content } }],
          },
        },
      });
    }
  }
}
```

### Todoist Integration

```typescript
// src/lib/integrations/todoist.ts
import { TodoistApi } from '@doist/todoist-api-typescript';

export class TodoistIntegration implements IExternalIntegrationAdapter {
  private api: TodoistApi;

  constructor(apiToken: string) {
    this.api = new TodoistApi(apiToken);
  }

  async import(userId: string): Promise<ImportResult> {
    const tasks = await this.api.getTasks();

    const events = tasks.map(task => ({
      userId,
      type: 'task',
      source: 'todoist',
      occurredAt: new Date(task.createdAt),
      payloadJson: {
        title: task.content,
        completed: task.isCompleted,
        priority: task.priority,
        projectId: task.projectId,
      },
    }));

    await db.eventLog.createMany({ data: events });

    return {
      itemsImported: events.length,
      itemsFailed: 0,
    };
  }
}
```

---

## Analytics & Visualization

### Chart.js Integration

```typescript
// src/components/HabitChart.tsx
'use client';

import { Line } from 'react-chartjs-2';
import { trpc } from '@/lib/trpc-client';

export function HabitChart({ habitId }: { habitId: string }) {
  const { data: entries } = trpc.habits.getEntries.useQuery({
    habitId,
    startDate: thirtyDaysAgo,
    endDate: today,
  });

  const chartData = {
    labels: entries?.map(e => e.date) || [],
    datasets: [
      {
        label: 'Completions',
        data: entries?.map(e => e.value) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return <Line data={chartData} />;
}
```

### Prometheus & Grafana

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'lifelog'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s
```

**Grafana Dashboard**:
- Import metrics from `/api/metrics`
- Create panels for:
  - Daily note count
  - Event logs by type
  - Goal completion rate
  - Habit streak tracking

---

## Mobile App Integration

### React Native App

```typescript
// mobile/src/lib/api.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../src/server/routers/_app';
import superjson from 'superjson';

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: 'https://your-api.com/api/trpc',
      headers: async () => {
        const token = await getAuthToken();
        return {
          authorization: `Bearer ${token}`,
        };
      },
    }),
  ],
});

// Usage in components
const notes = await trpc.notes.list.query({ userId });
```

### Expo/React Native Example

```typescript
// mobile/src/screens/NotesScreen.tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '../lib/api';

export function NotesScreen() {
  const { data: notes } = useQuery({
    queryKey: ['notes'],
    queryFn: () => trpc.notes.list.query({ userId: currentUserId }),
  });

  const createNote = useMutation({
    mutationFn: (data) => trpc.notes.upsert.mutate(data),
  });

  return (
    <View>
      {notes?.map(note => (
        <NoteCard key={note.id} note={note} />
      ))}
    </View>
  );
}
```

---

## Automation & Webhooks

### Zapier Integration

```typescript
// src/app/api/webhooks/zapier/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const apiKey = req.headers.get('x-api-key');

  // Validate API key
  if (apiKey !== process.env.ZAPIER_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Create event from Zapier
  await db.eventLog.create({
    data: {
      userId: data.userId,
      type: data.type,
      source: 'zapier',
      occurredAt: new Date(),
      payloadJson: data.payload,
    },
  });

  return NextResponse.json({ success: true });
}
```

### GitHub Actions

```yaml
# .github/workflows/daily-summary.yml
name: Generate Daily Summary

on:
  schedule:
    - cron: '0 20 * * *' # 8 PM daily

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Summary Generation
        run: |
          curl -X POST https://your-api.com/api/generate-daily-summary \
            -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"userId": "default-user"}'
```

### n8n Workflow

```json
{
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300],
      "parameters": {
        "rule": {
          "interval": [{"field": "hours", "hoursInterval": 24}]
        }
      }
    },
    {
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "url": "https://your-api.com/api/trpc/dailySummary.generate",
        "method": "POST",
        "body": {
          "userId": "={{$env.USER_ID}}",
          "date": "={{new Date().toISOString().split('T')[0]}}"
        }
      }
    }
  ]
}
```

---

## Advanced Patterns

### Event Sourcing

```typescript
// src/lib/event-sourcing.ts
import { eventBus } from './events';
import { db } from './db';

// Listen to all domain events and store them
eventBus.on('*', async (event) => {
  await db.domainEventLog.create({
    data: {
      type: event.type,
      userId: event.userId,
      payload: event.payload,
      timestamp: event.timestamp,
    },
  });
});

// Replay events for analytics
export async function replayEvents(userId: string, from: Date, to: Date) {
  const events = await db.domainEventLog.findMany({
    where: {
      userId,
      timestamp: { gte: from, lte: to },
    },
    orderBy: { timestamp: 'asc' },
  });

  for (const event of events) {
    await eventBus.emit(event as any);
  }
}
```

### CQRS Pattern

```typescript
// Separate read and write models
export const queryService = {
  async getNoteWithTags(userId: string, date: string) {
    return db.note.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
      include: {
        tags: { include: { tag: true } },
      },
    });
  },
};

export const commandService = {
  async createNote(data: CreateNoteInput) {
    const note = await db.note.create({ data });
    await eventBus.emit({
      type: 'note.created',
      userId: data.userId,
      payload: { noteId: note.id, date: note.date },
      timestamp: new Date(),
    });
    return note;
  },
};
```

---

## Testing Integrations

```typescript
// tests/integrations/notion.test.ts
import { describe, it, expect, vi } from 'vitest';
import { NotionIntegration } from '@/lib/integrations/notion';

describe('Notion Integration', () => {
  it('should import notes from Notion', async () => {
    const integration = new NotionIntegration(process.env.NOTION_API_KEY!);

    const result = await integration.import('test-user');

    expect(result.itemsImported).toBeGreaterThan(0);
    expect(result.itemsFailed).toBe(0);
  });
});
```

---

*For more integration examples, see the [examples](../examples/) directory.*
