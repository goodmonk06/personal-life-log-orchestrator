/**
 * Utility functions for the application
 */

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get the Monday of the week for a given date
 */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Get date range for a week starting from Monday
 */
export function getWeekDateRange(mondayDate: Date): { start: Date; end: Date } {
  const start = new Date(mondayDate);
  const end = new Date(mondayDate);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

/**
 * Format date for display in Japanese
 */
export function formatDateJP(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
