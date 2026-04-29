import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatDisplayDate,
  formatDisplayDateTime,
  formatRelativeTime,
} from "./date-format";

afterEach(() => {
  vi.useRealTimers();
});

describe("formatDisplayDate", () => {
  it("returns the fallback for invalid values", () => {
    expect(formatDisplayDate(null, undefined, "—")).toBe("—");
    expect(formatDisplayDate("not-a-date", undefined, "—")).toBe("—");
  });
});

describe("formatDisplayDateTime", () => {
  it("returns the fallback for invalid values", () => {
    expect(formatDisplayDateTime(undefined, undefined, "—")).toBe("—");
    expect(formatDisplayDateTime("not-a-date", undefined, "—")).toBe("—");
  });
});

describe("formatRelativeTime", () => {
  it("formats recent relative times", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-29T12:00:00.000Z"));

    expect(formatRelativeTime("2026-04-29T11:59:45.000Z")).toBe("Just now");
    expect(formatRelativeTime("2026-04-29T11:55:00.000Z")).toBe("5m ago");
    expect(formatRelativeTime("2026-04-29T10:00:00.000Z")).toBe("2h ago");
    expect(formatRelativeTime("2026-04-26T12:00:00.000Z")).toBe("3d ago");
  });

  it("supports yesterday and month/year style output", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-29T12:00:00.000Z"));

    expect(
      formatRelativeTime("2026-04-28T08:00:00.000Z", {
        includeYesterday: true,
      }),
    ).toBe("Yesterday");
    expect(
      formatRelativeTime("2026-02-15T12:00:00.000Z", {
        olderDateStyle: "months",
      }),
    ).toBe("2mo ago");
    expect(
      formatRelativeTime("2024-02-15T12:00:00.000Z", {
        olderDateStyle: "months",
      }),
    ).toBe("2y ago");
  });

  it("uses configured empty and invalid labels", () => {
    expect(formatRelativeTime(null, { emptyLabel: "—" })).toBe("—");
    expect(
      formatRelativeTime("not-a-date", {
        emptyLabel: "No activity yet",
        invalidLabel: "—",
      }),
    ).toBe("—");
  });
});
