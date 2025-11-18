import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { generateWeeklySummary } from '@/lib/openai';

export const weeklyReviewRouter = router({
  getByWeekStart: publicProcedure
    .input(z.object({
      userId: z.string(),
      weekStartDate: z.string(), // YYYY-MM-DD (Monday)
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.weeklyReview.findUnique({
        where: {
          userId_weekStartDate: {
            userId: input.userId,
            weekStartDate: new Date(input.weekStartDate),
          },
        },
      });
    }),

  generate: publicProcedure
    .input(z.object({
      userId: z.string(),
      weekStartDate: z.string(), // YYYY-MM-DD (Monday)
    }))
    .mutation(async ({ ctx, input }) => {
      const weekStart = new Date(input.weekStartDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Get daily summaries for the week
      const dailySummaries = await ctx.db.dailySummary.findMany({
        where: {
          userId: input.userId,
          date: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
        orderBy: { date: 'asc' },
      });

      // Get events for the week
      const events = await ctx.db.eventLog.findMany({
        where: {
          userId: input.userId,
          occurredAt: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
        orderBy: { occurredAt: 'asc' },
      });

      // Generate weekly summary using OpenAI
      const aiResult = await generateWeeklySummary(dailySummaries, events);

      // Save to database
      const review = await ctx.db.weeklyReview.upsert({
        where: {
          userId_weekStartDate: {
            userId: input.userId,
            weekStartDate: weekStart,
          },
        },
        create: {
          userId: input.userId,
          weekStartDate: weekStart,
          summaryMarkdown: aiResult.weekSummary,
          goalsJson: {
            achievements: aiResult.achievements,
            challenges: aiResult.challenges,
            nextWeekGoals: aiResult.nextWeekGoals,
          },
        },
        update: {
          summaryMarkdown: aiResult.weekSummary,
          goalsJson: {
            achievements: aiResult.achievements,
            challenges: aiResult.challenges,
            nextWeekGoals: aiResult.nextWeekGoals,
          },
        },
      });

      return review;
    }),

  create: publicProcedure
    .input(z.object({
      userId: z.string(),
      weekStartDate: z.string(),
      summaryMarkdown: z.string(),
      goalsJson: z.any(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dateObj = new Date(input.weekStartDate);
      return ctx.db.weeklyReview.upsert({
        where: {
          userId_weekStartDate: {
            userId: input.userId,
            weekStartDate: dateObj,
          },
        },
        create: {
          userId: input.userId,
          weekStartDate: dateObj,
          summaryMarkdown: input.summaryMarkdown,
          goalsJson: input.goalsJson,
        },
        update: {
          summaryMarkdown: input.summaryMarkdown,
          goalsJson: input.goalsJson,
        },
      });
    }),

  list: publicProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().default(12),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.weeklyReview.findMany({
        where: { userId: input.userId },
        orderBy: { weekStartDate: 'desc' },
        take: input.limit,
      });
    }),
});
