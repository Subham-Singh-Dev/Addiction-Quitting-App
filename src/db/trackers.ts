import type { SQLiteDatabase } from 'expo-sqlite';

export type Tracker = {
  id: number;
  name: string;
  streak_start_date: string; // ISO text
  best_streak_days: number;
  created_at: string;
};

export type RelapseInput = {
  reflection: string | null;
  trigger: string | null;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export async function getDefaultTracker(db: SQLiteDatabase) {
  return db.getFirstAsync<Tracker>('SELECT * FROM trackers ORDER BY id LIMIT 1');
}

export async function createTracker(db: SQLiteDatabase, name = 'Streak') {
  const nowIso = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO trackers (name, streak_start_date, best_streak_days, created_at) VALUES (?, ?, 0, ?)',
    name,
    nowIso,
    nowIso,
  );
}

export async function getOrCreateDefaultTracker(db: SQLiteDatabase): Promise<Tracker> {
  const existing = await getDefaultTracker(db);
  if (existing) return existing;
  await createTracker(db);
  const created = await getDefaultTracker(db);
  if (!created) throw new Error('Failed to create default tracker');
  return created;
}

/**
 * Reset the streak AND record the relapse in ONE transaction.
 * Either both happen or neither does. Skip = pass nulls (still logs the relapse).
 */
export async function resetTracker(
  db: SQLiteDatabase,
  trackerId: number,
  relapse: RelapseInput = { reflection: null, trigger: null },
  now: Date = new Date(),
) {
  const nowIso = now.toISOString();
  const reflection = relapse.reflection?.trim() || null;
  const trigger = relapse.trigger?.trim() || null;

  await db.withExclusiveTransactionAsync(async (txn) => {
    const tracker = await txn.getFirstAsync<Tracker>(
      'SELECT * FROM trackers WHERE id = ?',
      trackerId,
    );
    if (!tracker) throw new Error(`Tracker ${trackerId} not found`);

    // Elapsed full 24h periods (Decision #2). Swap in getStreakDays() if you prefer one source of truth.
    const elapsedDays = Math.max(
      0,
      Math.floor((now.getTime() - new Date(tracker.streak_start_date).getTime()) / MS_PER_DAY),
    );
    const best = Math.max(tracker.best_streak_days, elapsedDays);

    await txn.runAsync(
      'INSERT INTO relapses (tracker_id, date, reflection, "trigger") VALUES (?, ?, ?, ?)',
      trackerId,
      nowIso,
      reflection,
      trigger,
    );
    await txn.runAsync(
      'UPDATE trackers SET streak_start_date = ?, best_streak_days = ? WHERE id = ?',
      nowIso,
      best,
      trackerId,
    );
  });
}