import { getStreakBreakdown, getStreakDays } from "./calculateStreak";

const START = "2026-10-05T08:00:00.000Z";

describe("getStreakDays", () => {
  it("is 0 at the exact start moment", () => {
    expect(getStreakDays(START, new Date(START))).toBe(0);
  });

  it("is still 0 one millisecond before 24 hours pass", () => {
    const now = new Date("2026-10-06T07:59:59.999Z");
    expect(getStreakDays(START, now)).toBe(0);
  });

  it("becomes 1 at exactly 24 hours", () => {
    const now = new Date("2026-10-06T08:00:00.000Z");
    expect(getStreakDays(START, now)).toBe(1);
  });

  it("counts several full days", () => {
    const now = new Date("2026-10-08T08:00:00.000Z");
    expect(getStreakDays(START, now)).toBe(3);
  });

  it("does not count a partial day", () => {
    const now = new Date("2026-10-08T07:59:59.000Z");
    expect(getStreakDays(START, now)).toBe(2);
  });

  it("returns 0 when the start date is in the future", () => {
    const now = new Date("2026-10-01T08:00:00.000Z");
    expect(getStreakDays(START, now)).toBe(0);
  });

  it("returns 0 for invalid input", () => {
    const now = new Date("2026-10-08T08:00:00.000Z");
    expect(getStreakDays("not a date", now)).toBe(0);
    expect(getStreakDays("", now)).toBe(0);
  });
});

describe("getStreakBreakdown", () => {
  it("is all zeros at the exact start moment", () => {
    expect(getStreakBreakdown(START, new Date(START))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("splits 2 days 3 hours 4 minutes 5 seconds correctly", () => {
    const now = new Date("2026-10-07T11:04:05.000Z");
    expect(getStreakBreakdown(START, now)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    });
  });

  it("shows 0 days 23:59:59 just before the first day completes", () => {
    const now = new Date("2026-10-06T07:59:59.000Z");
    expect(getStreakBreakdown(START, now)).toEqual({
      days: 0,
      hours: 23,
      minutes: 59,
      seconds: 59,
    });
  });

  it("rolls over to 1 day 00:00:00 at exactly 24 hours", () => {
    const now = new Date("2026-10-06T08:00:00.000Z");
    expect(getStreakBreakdown(START, now)).toEqual({
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("drops sub-second remainders", () => {
    const now = new Date("2026-10-05T08:00:00.999Z");
    expect(getStreakBreakdown(START, now).seconds).toBe(0);
  });

  it("returns all zeros for a future start date", () => {
    const now = new Date("2026-10-01T08:00:00.000Z");
    expect(getStreakBreakdown(START, now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("returns all zeros for invalid input", () => {
    const now = new Date("2026-10-08T08:00:00.000Z");
    expect(getStreakBreakdown("garbage", now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("always agrees with getStreakDays", () => {
    const now = new Date("2026-10-12T15:30:45.000Z");
    expect(getStreakBreakdown(START, now).days).toBe(getStreakDays(START, now));
  });
});

describe("default `now` parameter", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("uses the current time when `now` is omitted", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-08T08:00:00.000Z"));
    expect(getStreakDays(START)).toBe(3);
  });
});