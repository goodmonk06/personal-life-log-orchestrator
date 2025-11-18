import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { eventBus } from '@/lib/events';

const frequencyEnum = z.enum(['daily', 'weekly', 'monthly']);

export const habitsRouter = router({
  list: publicProcedure
    .input(z.object({
      userId: z.string(),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.habit.findMany({
        where: {
          userId: input.userId,
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  getById: publicProcedure
    .input(z.object({
      habitId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.habit.findUnique({
        where: { id: input.habitId },
        include: {
          entries: {
            orderBy: { date: 'desc' },
            take: 30,
          },
        },
      });
    }),

  create: publicProcedure
    .input(z.object({
      userId: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
      frequency: frequencyEnum.optional(),
      target: z.number().positive().optional(),
      unit: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.habit.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(z.object({
      habitId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      frequency: frequencyEnum.optional(),
      target: z.number().positive().optional(),
      unit: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { habitId, ...data } = input;
      return ctx.db.habit.update({
        where: { id: habitId },
        data,
      });
    }),

  track: publicProcedure
    .input(z.object({
      habitId: z.string(),
      userId: z.string(),
      date: z.string(),
      value: z.number().positive().optional(),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dateObj = new Date(input.date);

      const entry = await ctx.db.habitEntry.upsert({
        where: {
          habitId_date: {
            habitId: input.habitId,
            date: dateObj,
          },
        },
        create: {
          habitId: input.habitId,
          userId: input.userId,
          date: dateObj,
          value: input.value || 1,
          note: input.note,
        },
        update: {
          value: input.value || 1,
          note: input.note,
        },
      });

      // Emit event
      await eventBus.emit({
        type: 'habit.tracked',
        timestamp: new Date(),
        userId: input.userId,
        payload: {
          habitId: input.habitId,
          date: input.date,
          value: entry.value,
        },
      });

      return entry;
    }),

  getEntries: publicProcedure
    .input(z.object({
      habitId: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.habitEntry.findMany({
        where: {
          habitId: input.habitId,
          ...(input.startDate && input.endDate && {
            date: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          }),
        },
        orderBy: { date: 'desc' },
      });
    }),
});
