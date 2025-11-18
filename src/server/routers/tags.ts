import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const tagsRouter = router({
  list: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.tag.findMany({
        where: { userId: input.userId },
        orderBy: { name: 'asc' },
      });
    }),

  create: publicProcedure
    .input(z.object({
      userId: z.string(),
      name: z.string().min(1).max(50),
      color: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tag.create({
        data: {
          userId: input.userId,
          name: input.name,
          color: input.color,
          description: input.description,
        },
      });
    }),

  update: publicProcedure
    .input(z.object({
      tagId: z.string(),
      name: z.string().min(1).max(50).optional(),
      color: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { tagId, ...data } = input;
      return ctx.db.tag.update({
        where: { id: tagId },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({
      tagId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tag.delete({
        where: { id: input.tagId },
      });
    }),
});
