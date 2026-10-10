import { hasCheckedInToday, isValidMood, toLocalDateKey } from "./checkin";

describe("toLocalDateKey", () => {
  it("formats as YYYY-MM-DD", () => {
    // new Date(year, monthIndex, day, ...) is LOCAL time; month 9 = October
    expect(toLocalDateKey(new Date(2026, 9, 10, 15, 30))).toBe("2026-10-10");
  });

  it("pads single-digit months and days", () => {
    expect(toLocalDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("stays on the same day until local midnight", () => {
    expect(toLocalDateKey(new Date(2026, 9, 10, 23, 59, 59))).toBe("2026-10-10");
    expect(toLocalDateKey(new Date(2026, 9, 11, 0, 0, 1))).toBe("2026-10-11");
  });
});

describe("hasCheckedInToday", () => {
  const now = new Date(2026, 9, 10, 12, 0);

  it("is false when there are no check-ins", () => {
    expect(hasCheckedInToday([], now)).toBe(false);
  });

  it("is false when the last check-in was yesterday", () => {
    expect(hasCheckedInToday(["2026-10-09"], now)).toBe(false);
  });

  it("is true when today's date is in the list", () => {
    expect(hasCheckedInToday(["2026-10-08", "2026-10-10"], now)).toBe(true);
  });
});

describe("isValidMood", () => {
  it("accepts 1 to 5", () => {
    [1, 2, 3, 4, 5].forEach((m) => expect(isValidMood(m)).toBe(true));
  });

  it("rejects out-of-range and non-integer values", () => {
    [0, 6, -1, 3.5, NaN].forEach((m) => expect(isValidMood(m)).toBe(false));
  });
});