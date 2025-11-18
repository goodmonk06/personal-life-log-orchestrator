# API Reference

Complete reference for all tRPC endpoints in the Personal Life Log Orchestrator.

## Overview

All API endpoints are accessed via tRPC at `/api/trpc`. The API provides end-to-end type safety and automatic client-side type inference.

### Base URL
```
http://localhost:3000/api/trpc
```

### Authentication
Currently uses a default user (`demo@lifelog.app`) for demonstration. Production will implement proper authentication.

## Routers

### Users Router

#### `users.getOrCreate`
Create or retrieve a user by email or external ID.

**Type**: `mutation`

**Input**:
```typescript
{
  email?: string;
  externalId?: string;
  name?: string;
}
```

**Output**: `LifeUser`

**Example**:
```typescript
const user = await trpc.users.getOrCreate.mutate({
  email: 'user@example.com',
  name: 'John Doe',
});
```

#### `users.getById`
Retrieve a user by ID.

**Type**: `query`

**Input**:
```typescript
{
  userId: string;
}
```

**Output**: `LifeUser | null`

---

### Notes Router

#### `notes.getByDate`
Get a note for a specific date.

**Type**: `query`

**Input**:
```typescript
{
  userId: string;
  date: string; // YYYY-MM-DD
}
```

**Output**: `Note | null`

#### `notes.upsert`
Create or update a note for a specific date.

**Type**: `mutation`

**Input**:
```typescript
{
  userId: string;
  date: string; // YYYY-MM-DD
  content: string;
  title?: string;
  templateId?: string;
}
```

**Output**: `Note`

**Example**:
```typescript
const note = await trpc.notes.upsert.mutate({
  userId: 'user-id',
  date: '2024-01-15',
  content: 'Today I learned about tRPC...',
  title: 'Daily Journal',
});
```

#### `notes.list`
List notes for a user.

**Type**: `query`

**Input**:
```typescript
{
  userId: string;
  limit?: number; // default: 30
}
```

**Output**: `Note[]`

---

### Event Logs Router

#### `eventLogs.create`
Create a single event log entry.

**Type**: `mutation`

**Input**:
```typescript
{
  userId: string;
  type: string; // calendar, email, expense, task, etc.
  source: string; // google_calendar, gmail, manual, etc.
  occurredAt: Date;
  payloadJson: any; // Event-specific data
}
```

**Output**: `EventLog`

#### `eventLogs.createMany`
Create multiple event log entries at once.

**Type**: `mutation`

**Input**:
```typescript
{
  events: Array<{
    userId: string;
    type: string;
    source: string;
    occurredAt: Date;
    payloadJson: any;
  }>;
}
```

**Output**: `{ count: number }`

#### `eventLogs.getByDateRange`
Query event logs within a date range.

**Type**: `query`

**Input**:
```typescript
{
  userId: string;
  startDate: Date;
  endDate: Date;
  type?: string; // Optional filter by event type
}
```

**Output**: `EventLog[]`

**Example**:
```typescript
const events = await trpc.eventLogs.getByDateRange.query({
  userId: 'user-id',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  type: 'calendar',
});
```

---

### Daily Summary Router

#### `dailySummary.getByDate`
Get a daily summary for a specific date.

**Type**: `query`

**Input**:
```typescript
{
  userId: string;
  date: string; // YYYY-MM-DD
}
```

**Output**: `DailySummary | null`

#### `dailySummary.generate`
Generate a new daily summary using AI.

**Type**: `mutation`

**Input**:
```typescript
{
  userId: string;
  date: string; // YYYY-MM-DD
}
```

**Output**: `DailySummary`

**Example**:
```typescript
const summary = await trpc.dailySummary.generate.mutate({
  userId: 'user-id',
  date: '2024-01-15',
});
```

#### `dailySummary.list`
List daily summaries for a user.

**Type**: `query`

**Input**:
```typescript
{
  userId: string;
  limit?: number; // default: 30
}
```

**Output**: `DailySummary[]`

---

### Weekly Review Router

#### `weeklyReview.getByWeekStart`
Get a weekly review for a specific week.

**Type**: `query`

**Input**:
```typescript
{
  userId: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
}
```

**Output**: `WeeklyReview | null`

#### `weeklyReview.generate`
Generate a new weekly review using AI.

**Type**: `mutation`

**Input**:
```typescript
{
  userId: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
}
```

**Output**: `WeeklyReview`

**Example**:
```typescript
const review = await trpc.weeklyReview.generate.mutate({
  userId: 'user-id',
  weekStartDate: '2024-01-15', // Monday
});
```

#### `weeklyReview.list`
List weekly reviews for a user.

**Type**: `query`

**Input**:
```typescript
{
  userId: string;
  limit?: number; // default: 12
}
```

**Output**: `WeeklyReview[]`

---

### Tags Router

#### `tags.list`
List all tags for a user.

**Type**: `query`

**Input**:
```typescript
{
  userId: string;
}
```

**Output**: `Tag[]`

#### `tags.create`
Create a new tag.

**Type**: `mutation`

**Input**:
```typescript
{
  userId: string;
  name: string; // 1-50 characters
  color?: string; // Hex color code
  description?: string;
}
```

**Output**: `Tag`

**Example**:
```typescript
const tag = await trpc.tags.create.mutate({
  userId: 'user-id',
  name: 'work',
  color: '#3B82F6',
  description: 'Work-related activities',
});
```

#### `tags.update`
Update an existing tag.

**Type**: `mutation`

**Input**:
```typescript
{
  tagId: string;
  name?: string;
  color?: string;
  description?: string;
}
```

**Output**: `Tag`

#### `tags.delete`
Delete a tag.

**Type**: `mutation`

**Input**:
```typescript
{
  tagId: string;
}
```

**Output**: `Tag`

---

### Goals Router

#### `goals.list`
List all goals for a user.

**Type**: `query`

**Input**:
```typescript
{
  userId: string;
  status?: 'active' | 'completed' | 'archived';
}
```

**Output**: `Goal[]` (with tags)

#### `goals.getById`
Get a specific goal by ID.

**Type**: `query`

**Input**:
```typescript
{
  goalId: string;
}
```

**Output**: `Goal` (with tags)

#### `goals.create`
Create a new goal.

**Type**: `mutation`

**Input**:
```typescript
{
  userId: string;
  title: string;
  description?: string;
  category?: string;
  targetDate?: Date;
  tagIds?: string[];
}
```

**Output**: `Goal`

**Example**:
```typescript
const goal = await trpc.goals.create.mutate({
  userId: 'user-id',
  title: 'Learn TypeScript',
  description: 'Complete advanced TypeScript course',
  category: 'learning',
  targetDate: new Date('2024-06-30'),
  tagIds: ['tag-1', 'tag-2'],
});
```

#### `goals.update`
Update a goal.

**Type**: `mutation`

**Input**:
```typescript
{
  goalId: string;
  title?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
  category?: string;
  targetDate?: Date;
  progress?: number; // 0-100
}
```

**Output**: `Goal`

#### `goals.delete`
Delete a goal.

**Type**: `mutation`

**Input**:
```typescript
{
  goalId: string;
}
```

**Output**: `Goal`

---

### Habits Router

#### `habits.list`
List all habits for a user.

**Type**: `query`

**Input**:
```typescript
{
  userId: string;
  isActive?: boolean;
}
```

**Output**: `Habit[]`

#### `habits.getById`
Get a specific habit with recent entries.

**Type**: `query`

**Input**:
```typescript
{
  habitId: string;
}
```

**Output**: `Habit` (with last 30 entries)

#### `habits.create`
Create a new habit.

**Type**: `mutation`

**Input**:
```typescript
{
  userId: string;
  name: string;
  description?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  target?: number; // Times per frequency
  unit?: string; // e.g., 'minutes', 'pages', 'reps'
}
```

**Output**: `Habit`

**Example**:
```typescript
const habit = await trpc.habits.create.mutate({
  userId: 'user-id',
  name: 'Morning Exercise',
  description: '30 minutes of cardio',
  frequency: 'daily',
  target: 1,
  unit: 'session',
});
```

#### `habits.update`
Update a habit.

**Type**: `mutation`

**Input**:
```typescript
{
  habitId: string;
  name?: string;
  description?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  target?: number;
  unit?: string;
  isActive?: boolean;
}
```

**Output**: `Habit`

#### `habits.track`
Track a habit for a specific date.

**Type**: `mutation`

**Input**:
```typescript
{
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  value?: number; // Default: 1
  note?: string;
}
```

**Output**: `HabitEntry`

**Example**:
```typescript
const entry = await trpc.habits.track.mutate({
  habitId: 'habit-id',
  userId: 'user-id',
  date: '2024-01-15',
  value: 1,
  note: 'Completed 30 min run',
});
```

#### `habits.getEntries`
Get habit tracking entries.

**Type**: `query`

**Input**:
```typescript
{
  habitId: string;
  startDate?: string;
  endDate?: string;
}
```

**Output**: `HabitEntry[]`

---

## Error Handling

All endpoints return consistent error responses:

```typescript
{
  error: {
    code: string; // BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR, etc.
    message: string;
    data?: {
      zodError?: ZodError; // For validation errors
    };
  };
}
```

## Rate Limiting

*To be implemented in future versions*

## Webhooks

*To be implemented in future versions*

---

*This API reference is auto-generated from the tRPC schema. For the latest types, refer to the TypeScript definitions.*
