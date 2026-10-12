export const LOCK_GRACE_MS = 30_000;

export function shouldRelock(
  backgroundedAt: number | null,
  now: number,
  graceMs: number = LOCK_GRACE_MS,
): boolean {
  if (backgroundedAt === null) return false;
  return now - backgroundedAt >= graceMs;
}