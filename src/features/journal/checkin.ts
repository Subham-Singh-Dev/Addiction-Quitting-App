// Pure logic only: no React, no hooks, no database (Decision #8).

export const MOODS = [1, 2, 3, 4, 5] as const;
export type Mood = (typeof MOODS)[number];

export function isValidMood(value: number): value is Mood {
    return MOODS.some((m) => m === value);
}

// Returns the LOCAL calendar date as "YYYY-MM-DD".
// We build it from getFullYear/getMonth/getDate (local time).
// toISOString() would give the UTC date, which can be yesterday or
// tomorrow compared to the user's wall clock.
export function toLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is 0-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function hasCheckedInToday(
  checkinDates: string[],
  now: Date = new Date()
): boolean {
  return checkinDates.includes(toLocalDateKey(now));
}