import {
    getAwardKey,
    getAwardsForStreak,
    getLevelInfo,
    getMilestoneBonus,
    getStreakKeyPrefix,
    xpForLevel,
} from './xp';

const sum = (awards: { amount: number }[]) => awards.reduce((t, a) => t + a.amount, 0);

describe('getMilestoneBonus', () => {
  it('returns the bonus on milestone days only', () => {
    expect(getMilestoneBonus(7)).toBe(50);
    expect(getMilestoneBonus(30)).toBe(200);
    expect(getMilestoneBonus(100)).toBe(500);
    expect(getMilestoneBonus(8)).toBe(0);
  });
});

describe('getAwardsForStreak', () => {
  it('returns nothing for 0 days, negatives and invalid input', () => {
    expect(getAwardsForStreak(0)).toEqual([]);
    expect(getAwardsForStreak(-3)).toEqual([]);
    expect(getAwardsForStreak(NaN)).toEqual([]);
  });

  it('gives 10 XP for day 1', () => {
    expect(getAwardsForStreak(1)).toEqual([{ type: 'streak_day', day: 1, amount: 10 }]);
  });

  it('adds the day-7 bonus', () => {
    const awards = getAwardsForStreak(7);
    expect(awards).toHaveLength(8); // 7 daily + 1 milestone
    expect(sum(awards)).toBe(7 * 10 + 50);
  });

  it('does not award the day-7 bonus at day 6', () => {
    expect(sum(getAwardsForStreak(6))).toBe(60);
  });

  it('adds up days and milestones at day 30', () => {
    expect(sum(getAwardsForStreak(30))).toBe(30 * 10 + 50 + 200);
  });

  it('ignores a fractional day', () => {
    expect(getAwardsForStreak(2.9)).toHaveLength(2);
  });
});

describe('award keys', () => {
  it('are stable for the same streak and differ across streaks and types', () => {
    const p1 = getStreakKeyPrefix(1, '2026-10-05T08:00:00.000Z');
    const p2 = getStreakKeyPrefix(1, '2026-10-12T08:00:00.000Z');
    const daily = { type: 'streak_day', day: 7, amount: 10 } as const;
    const bonus = { type: 'milestone', day: 7, amount: 50 } as const;

    expect(getAwardKey(p1, daily)).toBe(getAwardKey(p1, daily));
    expect(getAwardKey(p1, daily)).not.toBe(getAwardKey(p2, daily));
    expect(getAwardKey(p1, daily)).not.toBe(getAwardKey(p1, bonus));
  });
});

describe('xpForLevel / getLevelInfo', () => {
  it('has the expected thresholds', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
    expect(xpForLevel(4)).toBe(600);
  });

  it('is level 1 at 0 XP and still level 1 at 99', () => {
    expect(getLevelInfo(0).level).toBe(1);
    expect(getLevelInfo(99).level).toBe(1);
  });

  it('levels up exactly at the threshold', () => {
    expect(getLevelInfo(100).level).toBe(2);
    expect(getLevelInfo(299).level).toBe(2);
    expect(getLevelInfo(300).level).toBe(3);
  });

  it('reports progress inside a level', () => {
    const info = getLevelInfo(200); // level 2 spans 100 to 300
    expect(info.level).toBe(2);
    expect(info.xpIntoLevel).toBe(100);
    expect(info.xpForNextLevel).toBe(200);
    expect(info.progress).toBe(0.5);
  });

  it('handles negative, NaN and Infinity as 0 XP', () => {
    expect(getLevelInfo(-50).level).toBe(1);
    expect(getLevelInfo(NaN).level).toBe(1);
    expect(getLevelInfo(Infinity).level).toBe(1);
  });
});