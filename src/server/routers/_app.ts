import { router } from '../trpc';
import { notesRouter } from './notes';
import { eventLogsRouter } from './eventLogs';
import { dailySummaryRouter } from './dailySummary';
import { weeklyReviewRouter } from './weeklyReview';
import { usersRouter } from './users';
import { tagsRouter } from './tags';
import { goalsRouter } from './goals';
import { habitsRouter } from './habits';

export const appRouter = router({
  users: usersRouter,
  notes: notesRouter,
  eventLogs: eventLogsRouter,
  dailySummary: dailySummaryRouter,
  weeklyReview: weeklyReviewRouter,
  tags: tagsRouter,
  goals: goalsRouter,
  habits: habitsRouter,
});

export type AppRouter = typeof appRouter;
