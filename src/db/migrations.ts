import { type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

// Runs once when the database opens. Uses SQLite's built-in
// `user_version` number to remember which migrations already ran.
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  let currentVersion = row?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE trackers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        streak_start_date TEXT NOT NULL,
        best_streak_days INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);
    currentVersion = 1;
  }

  // Future changes go here as new blocks:
  // if (currentVersion === 1) { ...; currentVersion = 2; }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}