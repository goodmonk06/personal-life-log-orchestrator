# Domain Guide: Personal Life Log Orchestrator

## Overview

This document provides an in-depth guide to the domain model, business logic, and key concepts in the Personal Life Log Orchestrator system.

## Core Concepts

### Event-Driven Architecture

The system is built around a central `EventLog` entity that stores all life events in a unified format. This approach provides:

- **Flexibility**: Any type of event can be stored with custom payload
- **Queryability**: All events are indexed by user, time, and type
- **Extensibility**: New event types can be added without schema changes
- **Analytics**: Historical analysis across all life activities

### AI-Powered Insights

The system uses AI to transform raw data into actionable insights:

- **Daily Summaries**: Synthesize events and notes into reflections
- **Weekly Reviews**: Provide broader perspective and goal alignment
- **Custom Prompts**: Users can customize AI generation behavior

### Tag-Based Organization

Tags provide flexible categorization across all entities:

- **User-defined**: Each user creates their own tag taxonomy
- **Multi-entity**: Tags can be applied to notes, events, goals
- **Color-coded**: Visual organization with customizable colors

## Domain Model Deep Dive

### LifeUser

**Purpose**: Represents a user of the system.

**Key Fields**:
- `timezone`: User's timezone for proper date handling
- `preferences`: JSON object for user settings
- `metadata`: Extensible field for future attributes

**Relationships**:
- One-to-many with all core entities

**Business Rules**:
- Email must be unique if provided
- External ID for OAuth integration must be unique

### EventLog

**Purpose**: Universal storage for all life events.

**Event Types**:
- `calendar`: Calendar appointments and meetings
- `email`: Email messages (headers and snippets)
- `task`: Task completions and updates
- `expense`: Financial transactions
- `note`: Quick notes and thoughts
- `custom`: User-defined event types

**Payload Structure**:
```json
{
  "title": "Event title",
  "description": "Event description",
  "url": "https://...",
  "participants": ["user1", "user2"],
  "amount": 100.00,
  "currency": "USD",
  // ... any other event-specific fields
}
```

**Indexing Strategy**:
- `(userId, occurredAt)`: Time-based queries
- `(userId, type)`: Type-based filtering
- `(userId, source)`: Source-based filtering

### Note

**Purpose**: Date-based journaling and note-taking.

**Features**:
- One note per user per day
- Optional title for easier identification
- Template support for structured notes
- Tag support for categorization
- Markdown-compatible content

**Template Integration**:
Notes can be created from templates, enabling:
- Consistent note structure
- Guided reflection prompts
- Quick daily standup formats

### DailySummary

**Purpose**: AI-generated daily reflection and planning.

**Generation Process**:
1. Collect all events for the day
2. Retrieve user's note for the day
3. Apply AI prompt (default or custom)
4. Extract structured highlights
5. Store summary with mood tag

**Highlight Structure**:
```json
{
  "goodThings": [
    "Completed project milestone",
    "Great team collaboration",
    "Learned new skill"
  ],
  "todoTomorrow": [
    "Follow up with client",
    "Review code PR",
    "Exercise for 30 minutes"
  ]
}
```

**Mood Tags**:
- `productive`: High accomplishment
- `happy`: Positive emotional state
- `neutral`: Balanced day
- `challenging`: Difficulties encountered
- `reflective`: Introspective day

### WeeklyReview

**Purpose**: Weekly retrospective and goal setting.

**Generation Process**:
1. Collect all daily summaries for the week
2. Aggregate events and patterns
3. Apply AI analysis
4. Generate achievements and goals

**Goals Structure**:
```json
{
  "achievements": [
    "Shipped v2.0 of the product",
    "Maintained exercise streak",
    "Read 2 books"
  ],
  "challenges": [
    "Time management issues",
    "Need better work-life balance"
  ],
  "nextWeekGoals": [
    "Start new learning project",
    "Improve morning routine",
    "Connect with 3 industry peers"
  ]
}
```

### Tag

**Purpose**: Flexible categorization system.

**Features**:
- User-scoped (each user has own tags)
- Color-coded for visual organization
- Reusable across multiple entity types
- Optional description for clarity

**Common Tag Categories**:
- Projects: `work`, `side-project`, `learning`
- Areas: `health`, `career`, `relationships`, `finance`
- Context: `home`, `office`, `travel`
- Priority: `urgent`, `important`, `someday`

### Goal

**Purpose**: Track personal and professional goals.

**Lifecycle**:
```
active → completed
active → archived (not achieved)
```

**Progress Tracking**:
- Percentage-based (0-100)
- Optional target date
- Category for grouping
- Tag support for cross-cutting concerns

**Events**:
- `goal.created`: When goal is first set
- `goal.completed`: When goal is achieved
- `goal.updated`: When progress changes

### Habit

**Purpose**: Daily, weekly, or monthly habit tracking.

**Features**:
- Frequency-based tracking
- Target setting (e.g., "3 times per week")
- Unit specification (steps, minutes, pages)
- Historical entries for trend analysis

**Tracking**:
Each habit has multiple `HabitEntry` records:
- One entry per tracking period
- Value indicates completion count
- Optional notes for context

**Use Cases**:
- Exercise tracking (minutes, reps)
- Reading habits (pages, books)
- Meditation practice (sessions)
- Hydration (glasses of water)
- Social connections (calls made)

### Template

**Purpose**: Reusable content templates.

**Types**:
- `note`: Daily note templates
- `daily_summary`: Custom summary formats
- `weekly_review`: Custom review formats

**Variables**:
Templates support variables for dynamic content:
```markdown
# Daily Standup - {{date}}

## What I did today
{{events}}

## Blockers
-

## Tomorrow's focus
-
```

### Integration

**Purpose**: External service connections.

**Supported Providers**:
- `google`: Calendar and Gmail
- `notion`: Note sync
- `todoist`: Task management
- `github`: Activity tracking
- `fitbit`: Health data

**Security**:
- Credentials stored encrypted
- Refresh tokens supported
- Scoped permissions

**Sync Status**:
- `success`: Last sync completed
- `error`: Last sync failed
- `partial`: Some items failed

### AIPrompt

**Purpose**: Customizable AI generation prompts.

**Features**:
- User-specific prompts
- Type-specific (daily, weekly, custom)
- Model selection
- Temperature control
- Default vs. custom

**Example Prompt**:
```
Analyze the following day's activities and create a reflection:

Events: {{events}}
Note: {{note}}

Please provide:
1. A 2-3 sentence summary
2. Three positive highlights
3. Three priorities for tomorrow
4. An overall mood assessment

Format as JSON.
```

## Business Logic Patterns

### Aggregation

Events are aggregated for AI processing:
```typescript
// Get all events for a day
const events = await getEventsByDateRange(userId, startOfDay, endOfDay);

// Group by type
const groupedEvents = groupBy(events, 'type');

// Format for AI prompt
const eventSummary = formatEventsForPrompt(groupedEvents);
```

### Tagging

Tags are applied via junction tables:
```typescript
// Tag a note
await createNoteTag({ noteId, tagId });

// Query notes by tag
const notes = await getNotesWithTag(userId, tagId);
```

### Progress Tracking

Goals track progress over time:
```typescript
// Update goal progress
await updateGoal(goalId, { progress: 75 });

// Check if target date is approaching
if (isTargetDateSoon(goal)) {
  sendReminder(userId, goal);
}
```

### Habit Streaks

Calculate habit streaks:
```typescript
const entries = await getHabitEntries(habitId);
const currentStreak = calculateStreak(entries);
const longestStreak = calculateLongestStreak(entries);
```

## Extension Points

### Custom Event Types

Add new event types by:
1. Creating an importer
2. Storing in EventLog with custom payload
3. Updating AI prompts to recognize new type

### Custom AI Providers

Implement `IAIAdapter` interface:
```typescript
class CustomAIProvider implements IAIAdapter {
  async generateText(prompt: string): Promise<string> {
    // Custom implementation
  }
}
```

### Custom Integrations

Implement `IExternalIntegrationAdapter`:
```typescript
class NotionIntegration implements IExternalIntegrationAdapter {
  async import(userId: string): Promise<ImportResult> {
    // Import from Notion
  }
}
```

## Future Enhancements

### Planned Features

1. **Search**: Full-text search across all entities
2. **Analytics**: Trend analysis and visualizations
3. **Collaboration**: Share insights with others
4. **Mobile**: Native iOS/Android apps
5. **Automation**: Trigger actions based on patterns
6. **Export**: Multiple export formats
7. **Encryption**: End-to-end encryption option
8. **Multi-language**: International support

### Integration Roadmap

- Slack notifications
- Telegram bot
- Apple Health sync
- Google Fit sync
- Strava integration
- Twitter/X activity
- LinkedIn updates
- Spotify listening history

---

*This domain guide is a living document. As the system evolves, this guide will be updated to reflect new concepts and patterns.*
