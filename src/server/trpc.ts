import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { db } from '@/lib/db';
import { formatTRPCError } from './middleware/errorHandler';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === 'ZodError'
            ? error.cause
            : null,
      },
    };
  },
});

// Error handling middleware
const errorHandlerMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    throw formatTRPCError(error);
  }
});

export const router = t.router;
export const publicProcedure = t.procedure.use(errorHandlerMiddleware);
