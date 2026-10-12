import type { SQLiteDatabase } from 'expo-sqlite';

import {
    getAwardKey,
    getAwardsForStreak,
    getStreakKeyPrefix,
} from '@/features/xp/xp';

export async function getTotalXp(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ total: number | null }>(
    'SELECT COALESCE(SUM(amount), 0) AS total FROM xp_events',
  );
  return row?.total ?? 0;
}

/**
 * Makes sure every XP award the current streak has earned is in the ledger.
 * Safe to call as often as you like: already-recorded awards are skipped.
 * Returns how much NEW XP was added (0 if nothing was missing).
 */
export async function awardStreakXp(
  db: SQLiteDatabase,
  trackerId: number,
  streakStartDate: string,
  streakDays: number,
  now: Date = new Date(),
): Promise<number> {
  const awards = getAwardsForStreak(streakDays);
  if (awards.length === 0) return 0;

  const prefix = getStreakKeyPrefix(trackerId, streakStartDate);
  let gained = 0;

  await db.withExclusiveTransactionAsync(async (txn) => {
    const rows = await txn.getAllAsync<{ ref_key: string }>(
      'SELECT ref_key FROM xp_events WHERE ref_key LIKE ?',
      `${prefix}%`,
    );
    const existing = new Set(rows.map((r) => r.ref_key));

    for (const award of awards) {
      const key = getAwardKey(prefix, award);
      if (existing.has(key)) continue;
      await txn.runAsync(
        'INSERT OR IGNORE INTO xp_events (type, amount, ref_key, created_at) VALUES (?, ?, ?, ?)',
        award.type,
        award.amount,
        key,
        now.toISOString(),
      );
      gained += award.amount;
    }
  });

  return gained;
}