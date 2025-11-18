import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { generateDailySummary } from '@/lib/openai';

export const dailySummaryRouter = router({
  getByDate: publicProcedure
    .input(z.object({
      userId: z.string(),
      date: z.string(), // YYYY-MM-DD
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.dailySummary.findUnique({
        where: {
          userId_date: {
            userId: input.userId,
            date: new Date(input.date),
          },
        },
      });
    }),

  generate: publicProcedure
    .input(z.object({
      userId: z.string(),
      date: z.string(), // YYYY-MM-DD
    }))
    .mutation(async ({ ctx, input }) => {
      const dateObj = new Date(input.date);
      const startOfDay = new Date(dateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateObj);
      endOfDay.setHours(23, 59, 59, 999);

      // Get events for the day
      const events = await ctx.db.eventLog.findMany({
        where: {
          userId: input.userId,
          occurredAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { occurredAt: 'asc' },
      });

      // Get note for the day
      const note = await ctx.db.note.findUnique({
        where: {
          userId_date: {
            userId: input.userId,
            date: dateObj,
          },
        },
      });

      // Generate summary using OpenAI
      const aiResult = await generateDailySummary(events, note?.content);

      // Save to database
      const summary = await ctx.db.dailySummary.upsert({
        where: {
          userId_date: {
            userId: input.userId,
            date: dateObj,
          },
        },
        create: {
          userId: input.userId,
          date: dateObj,
          summaryMarkdown: aiResult.summary,
          moodTag: aiResult.moodTag,
          highlightsJson: {
            goodThings: aiResult.goodThings,
            todoTomorrow: aiResult.todoTomorrow,
          },
        },
        update: {
          summaryMarkdown: aiResult.summary,
          moodTag: aiResult.moodTag,
          highlightsJson: {
            goodThings: aiResult.goodThings,
            todoTomorrow: aiResult.todoTomorrow,
          },
        },
      });

      return summary;
    }),

  create: publicProcedure
    .input(z.object({
      userId: z.string(),
      date: z.string(),
      summaryMarkdown: z.string(),
      moodTag: z.string().optional(),
      highlightsJson: z.any(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dateObj = new Date(input.date);
      return ctx.db.dailySummary.upsert({
        where: {
          userId_date: {
            userId: input.userId,
            date: dateObj,
          },
        },
        create: {
          userId: input.userId,
          date: dateObj,
          summaryMarkdown: input.summaryMarkdown,
          moodTag: input.moodTag,
          highlightsJson: input.highlightsJson,
        },
        update: {
          summaryMarkdown: input.summaryMarkdown,
          moodTag: input.moodTag,
          highlightsJson: input.highlightsJson,
        },
      });
    }),

  list: publicProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().default(30),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.dailySummary.findMany({
        where: { userId: input.userId },
        orderBy: { date: 'desc' },
        take: input.limit,
      });
    }),
});
