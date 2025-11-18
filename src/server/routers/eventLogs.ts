import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const eventLogsRouter = router({
  create: publicProcedure
    .input(z.object({
      userId: z.string(),
      type: z.string(),
      source: z.string(),
      occurredAt: z.date(),
      payloadJson: z.any(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.eventLog.create({
        data: input,
      });
    }),

  createMany: publicProcedure
    .input(z.object({
      events: z.array(z.object({
        userId: z.string(),
        type: z.string(),
        source: z.string(),
        occurredAt: z.date(),
        payloadJson: z.any(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.eventLog.createMany({
        data: input.events,
        skipDuplicates: true,
      });
    }),

  getByDateRange: publicProcedure
    .input(z.object({
      userId: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      type: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.eventLog.findMany({
        where: {
          userId: input.userId,
          occurredAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
          ...(input.type && { type: input.type }),
        },
        orderBy: { occurredAt: 'asc' },
      });
    }),
});
