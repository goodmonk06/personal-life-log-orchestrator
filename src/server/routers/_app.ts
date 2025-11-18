import { router } from '../trpc';
import { notesRouter } from './notes';
import { eventLogsRouter } from './eventLogs';
import { dailySummaryRouter } from './dailySummary';
import { weeklyReviewRouter } from './weeklyReview';
import { usersRouter } from './users';

export const appRouter = router({
  users: usersRouter,
  notes: notesRouter,
  eventLogs: eventLogsRouter,
  dailySummary: dailySummaryRouter,
  weeklyReview: weeklyReviewRouter,
});

export type AppRouter = typeof appRouter;
