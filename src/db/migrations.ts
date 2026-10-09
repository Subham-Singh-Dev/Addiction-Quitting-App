import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 2;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  if (version >= DATABASE_VERSION) return;

  if (version === 0) {
    // v1: trackers (keep your original v1 SQL here if it differs)
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS trackers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        streak_start_date TEXT NOT NULL,
        best_streak_days INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);
    version = 1;
  }

  if (version === 1) {
    // v2: relapses (additive, nothing existing is touched)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS relapses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracker_id INTEGER NOT NULL REFERENCES trackers(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        reflection TEXT,
        "trigger" TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_relapses_tracker_date
        ON relapses(tracker_id, date);
    `);
    version = 2;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}