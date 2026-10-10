import { formatEntryDate } from './formatEntryDate';

describe('formatEntryDate', () => {
  it('formats a date key without shifting the day', () => {
    const label = formatEntryDate('2026-10-10');
    expect(label).toContain('10');
    expect(label).toContain('2026');
  });

  it('returns the raw string for an invalid key', () => {
    expect(formatEntryDate('nope')).toBe('nope');
  });
});