import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const notesRouter = router({
  getByDate: publicProcedure
    .input(z.object({
      userId: z.string(),
      date: z.string(), // YYYY-MM-DD
    }))
    .query(async ({ ctx, input }) => {
      const note = await ctx.db.note.findUnique({
        where: {
          userId_date: {
            userId: input.userId,
            date: new Date(input.date),
          },
        },
      });
      return note;
    }),

  upsert: publicProcedure
    .input(z.object({
      userId: z.string(),
      date: z.string(), // YYYY-MM-DD
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dateObj = new Date(input.date);
      return ctx.db.note.upsert({
        where: {
          userId_date: {
            userId: input.userId,
            date: dateObj,
          },
        },
        create: {
          userId: input.userId,
          date: dateObj,
          content: input.content,
        },
        update: {
          content: input.content,
        },
      });
    }),

  list: publicProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().default(30),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.note.findMany({
        where: { userId: input.userId },
        orderBy: { date: 'desc' },
        take: input.limit,
      });
    }),
});
