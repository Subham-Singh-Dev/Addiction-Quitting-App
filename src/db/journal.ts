import type { SQLiteDatabase } from 'expo-sqlite';

import { parseSkillTags, serializeSkillTags } from '../features/journal/skillTags';

export type JournalEntry = {
  id: number;
  date: string;
  text: string;
  skillTags: string[];
};

type JournalRow = {
  id: number;
  date: string;
  text: string;
  skill_tags: string | null;
};

function rowToEntry(row: JournalRow): JournalEntry {
  return {
    id: row.id,
    date: row.date,
    text: row.text,
    skillTags: parseSkillTags(row.skill_tags),
  };
}

// Multiple entries per day are allowed (no UNIQUE constraint).
// The caller passes `date`, same pattern as check-ins.
export async function addEntry(
  db: SQLiteDatabase,
  input: { date: string; text: string; skillTags: string[] },
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO journal_entries (date, text, skill_tags, created_at) VALUES (?, ?, ?, ?)',
    input.date,
    input.text.trim(),
    serializeSkillTags(input.skillTags),
    new Date().toISOString(),
  );
  return result.lastInsertRowId;
}

// Newest first. Entries on the same date are ordered by id, newest first.
export async function listEntries(db: SQLiteDatabase): Promise<JournalEntry[]> {
  const rows = await db.getAllAsync<JournalRow>(
    'SELECT id, date, text, skill_tags FROM journal_entries ORDER BY date DESC, id DESC',
  );
  return rows.map(rowToEntry);
}

export async function updateEntry(
  db: SQLiteDatabase,
  id: number,
  input: { text: string; skillTags: string[] },
): Promise<void> {
  await db.runAsync(
    'UPDATE journal_entries SET text = ?, skill_tags = ? WHERE id = ?',
    input.text.trim(),
    serializeSkillTags(input.skillTags),
    id,
  );
}

export async function deleteEntry(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM journal_entries WHERE id = ?', id);
}