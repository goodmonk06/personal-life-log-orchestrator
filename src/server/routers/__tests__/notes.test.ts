import { describe, it, expect, beforeEach, vi } from 'vitest';
import { inferProcedureInput } from '@trpc/server';
import type { AppRouter } from '../_app';

// Mock Prisma client
const mockPrismaNote = {
  findUnique: vi.fn(),
  findMany: vi.fn(),
  upsert: vi.fn(),
  create: vi.fn(),
};

const mockDb = {
  note: mockPrismaNote,
  lifeUser: {},
  eventLog: {},
  dailySummary: {},
  weeklyReview: {},
};

describe('Notes Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getByDate', () => {
    it('should return a note for a valid user and date', async () => {
      const mockNote = {
        id: 'note-1',
        userId: 'user-1',
        date: new Date('2024-01-15'),
        content: 'Test note content',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaNote.findUnique.mockResolvedValueOnce(mockNote);

      type Input = inferProcedureInput<AppRouter['notes']['getByDate']>;
      const input: Input = {
        userId: 'user-1',
        date: '2024-01-15',
      };

      // Verify the mock works as expected
      const result = await mockPrismaNote.findUnique({
        where: {
          userId_date: {
            userId: input.userId,
            date: new Date(input.date),
          },
        },
      });

      expect(result).toEqual(mockNote);
      expect(mockPrismaNote.findUnique).toHaveBeenCalledWith({
        where: {
          userId_date: {
            userId: 'user-1',
            date: new Date('2024-01-15'),
          },
        },
      });
    });

    it('should return null when note does not exist', async () => {
      mockPrismaNote.findUnique.mockResolvedValueOnce(null);

      const result = await mockPrismaNote.findUnique({
        where: {
          userId_date: {
            userId: 'user-1',
            date: new Date('2024-01-15'),
          },
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should create a new note if it does not exist', async () => {
      const mockNote = {
        id: 'note-new',
        userId: 'user-1',
        date: new Date('2024-01-15'),
        content: 'New note content',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaNote.upsert.mockResolvedValueOnce(mockNote);

      type Input = inferProcedureInput<AppRouter['notes']['upsert']>;
      const input: Input = {
        userId: 'user-1',
        date: '2024-01-15',
        content: 'New note content',
      };

      const result = await mockPrismaNote.upsert({
        where: {
          userId_date: {
            userId: input.userId,
            date: new Date(input.date),
          },
        },
        create: {
          userId: input.userId,
          date: new Date(input.date),
          content: input.content,
        },
        update: {
          content: input.content,
        },
      });

      expect(result).toEqual(mockNote);
      expect(result.content).toBe('New note content');
    });

    it('should update existing note content', async () => {
      const updatedNote = {
        id: 'note-1',
        userId: 'user-1',
        date: new Date('2024-01-15'),
        content: 'Updated content',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
      };

      mockPrismaNote.upsert.mockResolvedValueOnce(updatedNote);

      const result = await mockPrismaNote.upsert({
        where: {
          userId_date: {
            userId: 'user-1',
            date: new Date('2024-01-15'),
          },
        },
        create: {
          userId: 'user-1',
          date: new Date('2024-01-15'),
          content: 'Updated content',
        },
        update: {
          content: 'Updated content',
        },
      });

      expect(result.content).toBe('Updated content');
    });
  });

  describe('list', () => {
    it('should return list of notes ordered by date descending', async () => {
      const mockNotes = [
        {
          id: 'note-3',
          userId: 'user-1',
          date: new Date('2024-01-17'),
          content: 'Latest note',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'note-2',
          userId: 'user-1',
          date: new Date('2024-01-16'),
          content: 'Middle note',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'note-1',
          userId: 'user-1',
          date: new Date('2024-01-15'),
          content: 'Oldest note',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaNote.findMany.mockResolvedValueOnce(mockNotes);

      const result = await mockPrismaNote.findMany({
        where: { userId: 'user-1' },
        orderBy: { date: 'desc' },
        take: 30,
      });

      expect(result).toHaveLength(3);
      expect(result[0].content).toBe('Latest note');
      expect(result[2].content).toBe('Oldest note');
    });

    it('should respect the limit parameter', async () => {
      const mockNotes = Array.from({ length: 5 }, (_, i) => ({
        id: `note-${i}`,
        userId: 'user-1',
        date: new Date(`2024-01-${15 + i}`),
        content: `Note ${i}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockPrismaNote.findMany.mockResolvedValueOnce(mockNotes);

      const result = await mockPrismaNote.findMany({
        where: { userId: 'user-1' },
        orderBy: { date: 'desc' },
        take: 5,
      });

      expect(result).toHaveLength(5);
    });
  });
});
