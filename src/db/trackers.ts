import { type SQLiteDatabase } from 'expo-sqlite';

export type Tracker = {
  id: number;
  name: string;
  streak_start_date: string; // ISO string, e.g. 2026-10-08T10:30:00.000Z
  best_streak_days: number;
  created_at: string;
};

export async function getDefaultTracker(
  db: SQLiteDatabase
): Promise<Tracker | null> {
  return db.getFirstAsync<Tracker>(
    'SELECT * FROM trackers ORDER BY id LIMIT 1'
  );
}

export async function createTracker(
  db: SQLiteDatabase,
  name: string,
  startDate: string = new Date().toISOString()
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO trackers (name, streak_start_date, best_streak_days, created_at) VALUES (?, ?, 0, ?)',
    name,
    startDate,
    new Date().toISOString()
  );
  return result.lastInsertRowId;
}

// Returns the first tracker, creating one if the table is empty.
export async function getOrCreateDefaultTracker(
  db: SQLiteDatabase
): Promise<Tracker> {
  const existing = await getDefaultTracker(db);
  if (existing) return existing;
  await createTracker(db, 'My streak');
  return (await getDefaultTracker(db)) as Tracker;
}

// Restarts the streak from now, keeping the best streak seen so far.
export async function resetTracker(
  db: SQLiteDatabase,
  id: number,
  currentStreakDays: number
): Promise<void> {
  await db.runAsync(
    'UPDATE trackers SET streak_start_date = ?, best_streak_days = MAX(best_streak_days, ?) WHERE id = ?',
    new Date().toISOString(),
    currentStreakDays,
    id
  );
}