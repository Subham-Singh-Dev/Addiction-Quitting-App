import { normalizeSkillTags, parseSkillTags, serializeSkillTags } from './skillTags';

describe('normalizeSkillTags', () => {
  it('trims, removes empties and duplicates, keeps order', () => {
    expect(normalizeSkillTags([' Focus ', '', 'Discipline', 'Focus'])).toEqual([
      'Focus',
      'Discipline',
    ]);
  });
});

describe('serializeSkillTags', () => {
  it('returns a JSON array string', () => {
    expect(serializeSkillTags(['Focus', 'Patience'])).toBe('["Focus","Patience"]');
  });

  it('returns "[]" for no tags', () => {
    expect(serializeSkillTags([])).toBe('[]');
  });
});

describe('parseSkillTags', () => {
  it('round-trips with serializeSkillTags', () => {
    const tags = ['Focus', 'Patience'];
    expect(parseSkillTags(serializeSkillTags(tags))).toEqual(tags);
  });

  it('returns [] for null, undefined and empty string', () => {
    expect(parseSkillTags(null)).toEqual([]);
    expect(parseSkillTags(undefined)).toEqual([]);
    expect(parseSkillTags('')).toEqual([]);
  });

  it('returns [] for invalid JSON', () => {
    expect(parseSkillTags('not json')).toEqual([]);
  });

  it('returns [] when JSON is not an array', () => {
    expect(parseSkillTags('{"a":1}')).toEqual([]);
  });

  it('drops non-string items', () => {
    expect(parseSkillTags('["Focus", 3, null, "Patience"]')).toEqual(['Focus', 'Patience']);
  });
});