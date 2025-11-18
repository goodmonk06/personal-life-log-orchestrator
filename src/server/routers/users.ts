import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const usersRouter = router({
  getOrCreate: publicProcedure
    .input(z.object({
      email: z.string().email().optional(),
      externalId: z.string().optional(),
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { email, externalId, name } = input;

      // Try to find existing user
      let user = null;
      if (email) {
        user = await ctx.db.lifeUser.findUnique({ where: { email } });
      } else if (externalId) {
        user = await ctx.db.lifeUser.findUnique({ where: { externalId } });
      }

      // Create if not exists
      if (!user) {
        user = await ctx.db.lifeUser.create({
          data: {
            email,
            externalId,
            name,
          },
        });
      }

      return user;
    }),

  getById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.lifeUser.findUnique({
        where: { id: input.userId },
      });
    }),
});
