// XP rules. Pure logic only: no React, no hooks, no database.

export const XP_PER_STREAK_DAY = 10;

// Bonus XP awarded on top of the daily XP when a streak reaches this day.
export const MILESTONES = [
  { day: 7, bonus: 50 },
  { day: 30, bonus: 200 },
  { day: 100, bonus: 500 },
] as const;

export type XpAward = {
  type: 'streak_day' | 'milestone';
  day: number;
  amount: number;
};

export function getMilestoneBonus(day: number): number {
  return MILESTONES.find((m) => m.day === day)?.bonus ?? 0;
}

// Every award a streak of `streakDays` full days has earned so far.
// Day N counts only after N full 24h periods (Decision #2).
export function getAwardsForStreak(streakDays: number): XpAward[] {
  if (!Number.isFinite(streakDays) || streakDays < 1) return [];

  const awards: XpAward[] = [];
  const lastDay = Math.floor(streakDays);

  for (let day = 1; day <= lastDay; day++) {
    awards.push({ type: 'streak_day', day, amount: XP_PER_STREAK_DAY });
    const bonus = getMilestoneBonus(day);
    if (bonus > 0) awards.push({ type: 'milestone', day, amount: bonus });
  }
  return awards;
}

// Keys make awards idempotent: same streak + same award = same key.
// A relapse changes streakStartDate, so the new streak gets fresh keys.
export function getStreakKeyPrefix(trackerId: number, streakStartDate: string): string {
  return `${trackerId}|${streakStartDate}|`;
}

export function getAwardKey(prefix: string, award: XpAward): string {
  return `${prefix}${award.type}|${award.day}`;
}

// Level 1 starts at 0 XP, level 2 at 100, level 3 at 300, level 4 at 600...
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export type LevelInfo = {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number; // size of the current level, in XP
  progress: number; // 0 to 1
};

export function getLevelInfo(totalXp: number): LevelInfo {
  // Number.isFinite guards NaN/Infinity (Infinity would loop forever below).
  const xp = Number.isFinite(totalXp) ? Math.max(0, Math.floor(totalXp)) : 0;

  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;

  const start = xpForLevel(level);
  const size = xpForLevel(level + 1) - start;
  return {
    level,
    xpIntoLevel: xp - start,
    xpForNextLevel: size,
    progress: (xp - start) / size,
  };
}