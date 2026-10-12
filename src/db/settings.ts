import type { SQLiteDatabase } from 'expo-sqlite';

export async function getLockEnabled(db: SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ lock_enabled: number }>(
    'SELECT lock_enabled FROM settings WHERE id = 1',
  );
  return row?.lock_enabled === 1;
}

export async function setLockEnabled(db: SQLiteDatabase, enabled: boolean): Promise<void> {
  await db.runAsync('UPDATE settings SET lock_enabled = ? WHERE id = 1', enabled ? 1 : 0);
}