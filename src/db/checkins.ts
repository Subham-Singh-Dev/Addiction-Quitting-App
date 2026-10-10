import type { SQLiteDatabase } from 'expo-sqlite';

import { isValidMood, toLocalDateKey } from '@/features/journal/checkin';

export type Checkin = {
  id: number;
  tracker_id: number;
  date: string; // local "YYYY-MM-DD"
  mood: number; // 1 to 5
  note: string | null;
  created_at: string;
};

export async function getTodayCheckin(
  db: SQLiteDatabase,
  trackerId: number,
  now: Date = new Date(),
) {
  return db.getFirstAsync<Checkin>(
    'SELECT * FROM checkins WHERE tracker_id = ? AND date = ?',
    trackerId,
    toLocalDateKey(now),
  );
}

// Newest first. Feed this into hasCheckedInToday() later.
export async function getRecentCheckinDates(
  db: SQLiteDatabase,
  trackerId: number,
  limit = 30,
): Promise<string[]> {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM checkins WHERE tracker_id = ? ORDER BY date DESC LIMIT ?',
    trackerId,
    limit,
  );
  return rows.map((r) => r.date);
}

/**
 * One check-in per tracker per day. Saving again on the same day updates
 * that day's mood/note instead of creating a second row.
 */
export async function saveCheckin(
  db: SQLiteDatabase,
  trackerId: number,
  mood: number,
  note: string | null = null,
  now: Date = new Date(),
) {
  if (!isValidMood(mood)) throw new Error(`Invalid mood: ${mood}`);

  await db.runAsync(
    `INSERT INTO checkins (tracker_id, date, mood, note, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (tracker_id, date)
     DO UPDATE SET mood = excluded.mood, note = excluded.note`,
    trackerId,
    toLocalDateKey(now),
    mood,
    note?.trim() || null,
    now.toISOString(),
  );
}