/**
 * Domain events system
 * Provides type-safe event publishing and subscription
 */

import { logger } from './logger';

export interface DomainEvent {
  type: string;
  timestamp: Date;
  userId?: string;
  payload: unknown;
  metadata?: Record<string, unknown>;
}

// Event type definitions
export type NoteCreatedEvent = DomainEvent & {
  type: 'note.created';
  payload: {
    noteId: string;
    date: string;
  };
};

export type DailySummaryGeneratedEvent = DomainEvent & {
  type: 'daily_summary.generated';
  payload: {
    summaryId: string;
    date: string;
  };
};

export type WeeklyReviewGeneratedEvent = DomainEvent & {
  type: 'weekly_review.generated';
  payload: {
    reviewId: string;
    weekStartDate: string;
  };
};

export type GoalCompletedEvent = DomainEvent & {
  type: 'goal.completed';
  payload: {
    goalId: string;
    completedAt: Date;
  };
};

export type HabitTrackedEvent = DomainEvent & {
  type: 'habit.tracked';
  payload: {
    habitId: string;
    date: string;
    value: number;
  };
};

export type IntegrationSyncedEvent = DomainEvent & {
  type: 'integration.synced';
  payload: {
    integrationId: string;
    provider: string;
    itemsImported: number;
  };
};

export type AllDomainEvents =
  | NoteCreatedEvent
  | DailySummaryGeneratedEvent
  | WeeklyReviewGeneratedEvent
  | GoalCompletedEvent
  | HabitTrackedEvent
  | IntegrationSyncedEvent;

type EventHandler<T extends DomainEvent> = (event: T) => void | Promise<void>;

class EventBus {
  private handlers: Map<string, EventHandler<DomainEvent>[]> = new Map();

  /**
   * Subscribe to an event type
   */
  on<T extends AllDomainEvents>(
    eventType: T['type'],
    handler: EventHandler<T>
  ): () => void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler as EventHandler<DomainEvent>);
    this.handlers.set(eventType, handlers);

    // Return unsubscribe function
    return () => {
      const currentHandlers = this.handlers.get(eventType) || [];
      const index = currentHandlers.indexOf(handler as EventHandler<DomainEvent>);
      if (index > -1) {
        currentHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Publish an event
   */
  async emit<T extends AllDomainEvents>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];

    logger.debug('Event emitted', {
      eventType: event.type,
      handlerCount: handlers.length,
    });

    // Execute all handlers
    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          logger.error(
            `Error handling event ${event.type}`,
            error as Error,
            { eventType: event.type }
          );
        }
      })
    );
  }

  /**
   * Remove all handlers for an event type
   */
  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.handlers.delete(eventType);
    } else {
      this.handlers.clear();
    }
  }

  /**
   * Get count of handlers for an event type
   */
  listenerCount(eventType: string): number {
    return (this.handlers.get(eventType) || []).length;
  }
}

export const eventBus = new EventBus();

// Example event handlers (can be extended by other modules)
eventBus.on('note.created', async (event) => {
  logger.info('Note created', {
    noteId: event.payload.noteId,
    date: event.payload.date,
  });
});

eventBus.on('daily_summary.generated', async (event) => {
  logger.info('Daily summary generated', {
    summaryId: event.payload.summaryId,
    date: event.payload.date,
  });
});
