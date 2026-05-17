import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isSessionWithinLifetime,
  isSessionDueForRefresh,
  getSessionLifetimeMs,
  STANDARD_SESSION_MAX_AGE_MS,
  REMEMBERED_SESSION_MAX_AGE_MS,
  SESSION_REVALIDATION_WINDOW_MS,
} from "./session";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getSessionLifetimeMs", () => {
  it("returns standard lifetime by default", () => {
    expect(getSessionLifetimeMs()).toBe(STANDARD_SESSION_MAX_AGE_MS);
    expect(getSessionLifetimeMs(false)).toBe(STANDARD_SESSION_MAX_AGE_MS);
    expect(getSessionLifetimeMs(null)).toBe(STANDARD_SESSION_MAX_AGE_MS);
  });

  it("returns remembered lifetime when rememberMe is true", () => {
    expect(getSessionLifetimeMs(true)).toBe(REMEMBERED_SESSION_MAX_AGE_MS);
    expect(getSessionLifetimeMs("true")).toBe(REMEMBERED_SESSION_MAX_AGE_MS);
  });
});

describe("isSessionWithinLifetime", () => {
  it("returns true for a fresh standard session", () => {
    expect(isSessionWithinLifetime({ loginAt: Date.now() - 1000 })).toBe(true);
  });

  it("returns false for an expired standard session", () => {
    const expired = Date.now() - STANDARD_SESSION_MAX_AGE_MS - 1000;
    expect(isSessionWithinLifetime({ loginAt: expired })).toBe(false);
  });

  it("returns true for a remembered session within 30 days", () => {
    const withinWindow = Date.now() - 15 * 24 * 60 * 60 * 1000;
    expect(
      isSessionWithinLifetime({ loginAt: withinWindow, rememberMe: true }),
    ).toBe(true);
  });

  it("returns false for an expired remembered session", () => {
    const expired = Date.now() - REMEMBERED_SESSION_MAX_AGE_MS - 1000;
    expect(
      isSessionWithinLifetime({ loginAt: expired, rememberMe: true }),
    ).toBe(false);
  });

  it("returns false when loginAt is missing (fail-closed)", () => {
    expect(isSessionWithinLifetime({})).toBe(false);
    expect(isSessionWithinLifetime({ loginAt: null })).toBe(false);
    expect(isSessionWithinLifetime({ loginAt: undefined })).toBe(false);
  });

  it("handles string loginAt values", () => {
    expect(
      isSessionWithinLifetime({ loginAt: String(Date.now() - 1000) }),
    ).toBe(true);
  });

  it("returns false for non-numeric string loginAt", () => {
    expect(isSessionWithinLifetime({ loginAt: "not-a-number" })).toBe(false);
  });
});

describe("isSessionDueForRefresh", () => {
  it("returns true when lastValidatedAt is missing", () => {
    expect(isSessionDueForRefresh()).toBe(true);
    expect(isSessionDueForRefresh(null)).toBe(true);
  });

  it("returns false when recently validated", () => {
    expect(isSessionDueForRefresh(Date.now() - 1000)).toBe(false);
  });

  it("returns true when validation window has passed", () => {
    const stale = Date.now() - SESSION_REVALIDATION_WINDOW_MS - 1000;
    expect(isSessionDueForRefresh(stale)).toBe(true);
  });
});
