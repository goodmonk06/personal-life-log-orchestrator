import { TRPCError } from '@trpc/server';
import { ZodError } from 'zod';

export function formatTRPCError(error: unknown): TRPCError {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Validation error',
      cause: error,
    });
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: Record<string, unknown> };

    switch (prismaError.code) {
      case 'P2002':
        return new TRPCError({
          code: 'CONFLICT',
          message: 'A record with this value already exists',
          cause: error,
        });
      case 'P2025':
        return new TRPCError({
          code: 'NOT_FOUND',
          message: 'Record not found',
          cause: error,
        });
      case 'P2003':
        return new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Foreign key constraint failed',
          cause: error,
        });
      default:
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database error occurred',
          cause: error,
        });
    }
  }

  // Handle TRPC errors
  if (error instanceof TRPCError) {
    return error;
  }

  // Handle generic errors
  if (error instanceof Error) {
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message,
      cause: error,
    });
  }

  // Unknown error
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
}
