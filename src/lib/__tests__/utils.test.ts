import { describe, it, expect } from 'vitest';
import { formatDate, getMondayOfWeek, getWeekDateRange, formatDateJP } from '../utils';

describe('utils', () => {
  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('2024-01-15');
    });

    it('should handle different dates correctly', () => {
      const date = new Date('2023-12-31T23:59:59Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('2023-12-31');
    });
  });

  describe('getMondayOfWeek', () => {
    it('should return Monday for a Wednesday', () => {
      const wednesday = new Date('2024-01-17T00:00:00Z'); // Wednesday
      const monday = getMondayOfWeek(wednesday);
      expect(monday.getDay()).toBe(1); // Monday is 1
      expect(formatDate(monday)).toBe('2024-01-15');
    });

    it('should return the same date if already Monday', () => {
      const monday = new Date('2024-01-15T00:00:00Z'); // Monday
      const result = getMondayOfWeek(monday);
      expect(result.getDay()).toBe(1);
      expect(formatDate(result)).toBe('2024-01-15');
    });

    it('should return previous Monday for Sunday', () => {
      const sunday = new Date('2024-01-21T00:00:00Z'); // Sunday
      const monday = getMondayOfWeek(sunday);
      expect(monday.getDay()).toBe(1);
      expect(formatDate(monday)).toBe('2024-01-15');
    });
  });

  describe('getWeekDateRange', () => {
    it('should return correct week range from Monday', () => {
      const monday = new Date('2024-01-15T00:00:00Z');
      const { start, end } = getWeekDateRange(monday);

      expect(formatDate(start)).toBe('2024-01-15');
      expect(formatDate(end)).toBe('2024-01-21');
    });

    it('should span exactly 7 days', () => {
      const monday = new Date('2024-01-15T00:00:00Z');
      const { start, end } = getWeekDateRange(monday);

      const diff = end.getTime() - start.getTime();
      const daysDiff = diff / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBe(6);
    });
  });

  describe('formatDateJP', () => {
    it('should format date in Japanese locale', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const formatted = formatDateJP(date);
      expect(formatted).toMatch(/2024/);
      expect(formatted).toMatch(/1/);
      expect(formatted).toMatch(/15/);
    });
  });
});
