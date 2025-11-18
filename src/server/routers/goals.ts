import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { eventBus } from '@/lib/events';

const goalStatusEnum = z.enum(['active', 'completed', 'archived']);

export const goalsRouter = router({
  list: publicProcedure
    .input(z.object({
      userId: z.string(),
      status: goalStatusEnum.optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.goal.findMany({
        where: {
          userId: input.userId,
          ...(input.status && { status: input.status }),
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  getById: publicProcedure
    .input(z.object({
      goalId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.goal.findUnique({
        where: { id: input.goalId },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    }),

  create: publicProcedure
    .input(z.object({
      userId: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.string().optional(),
      targetDate: z.date().optional(),
      tagIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { tagIds, ...goalData } = input;

      const goal = await ctx.db.goal.create({
        data: {
          ...goalData,
          tags: tagIds
            ? {
                create: tagIds.map((tagId) => ({
                  tag: { connect: { id: tagId } },
                })),
              }
            : undefined,
        },
      });

      return goal;
    }),

  update: publicProcedure
    .input(z.object({
      goalId: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: goalStatusEnum.optional(),
      category: z.string().optional(),
      targetDate: z.date().optional(),
      progress: z.number().min(0).max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { goalId, ...data } = input;

      const goal = await ctx.db.goal.update({
        where: { id: goalId },
        data,
      });

      // Emit event if goal was completed
      if (data.status === 'completed') {
        await eventBus.emit({
          type: 'goal.completed',
          timestamp: new Date(),
          userId: goal.userId,
          payload: {
            goalId: goal.id,
            completedAt: new Date(),
          },
        });
      }

      return goal;
    }),

  delete: publicProcedure
    .input(z.object({
      goalId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.goal.delete({
        where: { id: input.goalId },
      });
    }),
});
