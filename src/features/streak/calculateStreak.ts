const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

export function getStreakDays(startDate: string, now: Date = new Date()): number {
  const start = new Date(startDate).getTime();
  if (Number.isNaN(start)) return 0;

  const elapsed = now.getTime() - start;
  return Math.max(0, Math.floor(elapsed / MS_PER_DAY));
}

export function getStreakBreakdown(
  startDate: string,
  now: Date = new Date()
): { days: number; hours: number; minutes: number; seconds: number } {
  const start = new Date(startDate).getTime();
  if (Number.isNaN(start)) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const elapsed = Math.max(0, now.getTime() - start);
  const days = Math.floor(elapsed / MS_PER_DAY);
  const hours = Math.floor((elapsed % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((elapsed % MS_PER_HOUR) / MS_PER_MINUTE);
  const seconds = Math.floor((elapsed % MS_PER_MINUTE) / MS_PER_SECOND);
  return { days, hours, minutes, seconds };
}
