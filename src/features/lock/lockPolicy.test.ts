import { LOCK_GRACE_MS, shouldRelock } from './lockPolicy';

describe('shouldRelock', () => {
  it('does not relock if the app was never backgrounded', () => {
    expect(shouldRelock(null, 1_000_000)).toBe(false);
  });

  it('does not relock within the grace period', () => {
    expect(shouldRelock(1_000, 1_000 + LOCK_GRACE_MS - 1)).toBe(false);
  });

  it('relocks at or after the grace period', () => {
    expect(shouldRelock(1_000, 1_000 + LOCK_GRACE_MS)).toBe(true);
  });

  it('respects a custom grace period', () => {
    expect(shouldRelock(0, 5_000, 5_000)).toBe(true);
    expect(shouldRelock(0, 4_999, 5_000)).toBe(false);
  });
});