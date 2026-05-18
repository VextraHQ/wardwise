import { describe, expect, it } from "vitest";
import { getDashboardWindows } from "./collect-reporting";

// Lagos is UTC+1 year-round (no DST). Midnight Lagos = 23:00 UTC the prior day.
function lagos(iso: string): Date {
  return new Date(iso);
}

describe("getDashboardWindows", () => {
  it("orders boundaries correctly", () => {
    const w = getDashboardWindows(lagos("2026-04-29T12:00:00.000Z"));
    expect(w.previous7dStart.getTime()).toBeLessThan(w.previous7dEnd.getTime());
    expect(w.previous7dEnd.getTime()).toBe(w.last7dStart.getTime());
    expect(w.last7dStart.getTime()).toBeLessThan(w.todayStart.getTime());
    expect(w.todayStart.getTime()).toBeLessThan(w.tomorrowStart.getTime());
    expect(w.yesterdayStart.getTime()).toBeLessThan(w.todayStart.getTime());
  });

  it("yields a 7-day previous7d window with no overlap with last7d", () => {
    const w = getDashboardWindows(lagos("2026-04-29T12:00:00.000Z"));
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(w.previous7dEnd.getTime() - w.previous7dStart.getTime()).toBe(
      sevenDaysMs,
    );
    expect(w.tomorrowStart.getTime() - w.last7dStart.getTime()).toBe(
      sevenDaysMs,
    );
    // previous7d ends exactly where last7d starts — no overlap, no gap.
    expect(w.previous7dEnd.getTime()).toBe(w.last7dStart.getTime());
  });

  it("treats 23:55 Lagos on a calendar day as still that day", () => {
    // 23:55 Lagos on 2026-04-29 = 22:55 UTC on 2026-04-29.
    const w = getDashboardWindows(lagos("2026-04-29T22:55:00.000Z"));
    expect(w.todayStart.toISOString()).toBe("2026-04-28T23:00:00.000Z");
    expect(w.tomorrowStart.toISOString()).toBe("2026-04-29T23:00:00.000Z");
    expect(w.yesterdayStart.toISOString()).toBe("2026-04-27T23:00:00.000Z");
  });

  it("rolls into the next day once Lagos midnight passes", () => {
    // 00:05 Lagos on 2026-04-30 = 23:05 UTC on 2026-04-29.
    const w = getDashboardWindows(lagos("2026-04-29T23:05:00.000Z"));
    expect(w.todayStart.toISOString()).toBe("2026-04-29T23:00:00.000Z");
    expect(w.tomorrowStart.toISOString()).toBe("2026-04-30T23:00:00.000Z");
    expect(w.yesterdayStart.toISOString()).toBe("2026-04-28T23:00:00.000Z");
  });

  it("places last7d as the rolling 7-day window ending at tomorrow Lagos midnight", () => {
    // For now = 2026-04-29 noon Lagos, last7d should span Apr 23 00:00 Lagos
    // through Apr 30 00:00 Lagos exclusive.
    const w = getDashboardWindows(lagos("2026-04-29T12:00:00.000Z"));
    expect(w.last7dStart.toISOString()).toBe("2026-04-22T23:00:00.000Z");
    expect(w.tomorrowStart.toISOString()).toBe("2026-04-29T23:00:00.000Z");
  });

  it("places previous7d as the 7-day window before last7d (days 7–13 ago)", () => {
    // For now = 2026-04-29 noon Lagos, previous7d should span Apr 16 00:00 Lagos
    // through Apr 23 00:00 Lagos exclusive.
    const w = getDashboardWindows(lagos("2026-04-29T12:00:00.000Z"));
    expect(w.previous7dStart.toISOString()).toBe("2026-04-15T23:00:00.000Z");
    expect(w.previous7dEnd.toISOString()).toBe("2026-04-22T23:00:00.000Z");
  });
});
