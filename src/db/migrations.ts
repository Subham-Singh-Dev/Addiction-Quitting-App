import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 3;

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

    if (version === 2) {
    // v3: daily check-ins + journal (additive, nothing existing is touched)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracker_id INTEGER NOT NULL REFERENCES trackers(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
        note TEXT,
        created_at TEXT NOT NULL,
        UNIQUE (tracker_id, date)
      );
      CREATE TABLE IF NOT EXISTS journal_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        text TEXT NOT NULL,
        skill_tags TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_journal_entries_date
        ON journal_entries(date);
    `);
    version = 3;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}