// Converts skill tags between string[] (app) and a JSON string (SQLite column).
// Pure logic only: no React, no hooks, no DB.

export function normalizeSkillTags(tags: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of tags) {
    const clean = tag.trim();
    if (clean.length === 0 || seen.has(clean)) continue;
    seen.add(clean);
    result.push(clean);
  }
  return result;
}

export function serializeSkillTags(tags: readonly string[]): string {
  return JSON.stringify(normalizeSkillTags(tags));
}

export function parseSkillTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return normalizeSkillTags(
      parsed.filter((item): item is string => typeof item === 'string'),
    );
  } catch {
    return [];
  }
}