import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/auth/config", () => ({
  authOptions: {},
}));

vi.mock("@/lib/auth/storage", () => ({
  readAuthUserById: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { getAuthContext, requireRole, getDefaultHomePath } from "./guards";
import { readAuthUserById } from "./storage";

const mockGetServerSession = vi.mocked(getServerSession);
const mockReadAuthUserById = vi.mocked(readAuthUserById);

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    user: {
      id: "user-1",
      role: "admin",
      sessionVersion: 1,
      loginAt: Date.now(),
      rememberMe: false,
      ...overrides,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}

function makeDbUser(overrides: Record<string, unknown> = {}) {
  return {
    user: {
      id: "user-1",
      name: "Test",
      email: "test@test.com",
      password: "hashed",
      role: "admin",
      candidateId: null,
      sessionVersion: 1,
      candidate: null,
      ...overrides,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getDefaultHomePath", () => {
  it("returns /admin for admin role", () => {
    expect(getDefaultHomePath("admin")).toBe("/admin");
  });

  it("returns /dashboard for candidate role", () => {
    expect(getDefaultHomePath("candidate")).toBe("/dashboard");
  });

  it("returns /login for unknown or missing role", () => {
    expect(getDefaultHomePath(null)).toBe("/login");
    expect(getDefaultHomePath(undefined)).toBe("/login");
    expect(getDefaultHomePath("unknown")).toBe("/login");
  });
});

describe("getAuthContext", () => {
  it("returns unauthenticated when no session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const ctx = await getAuthContext();
    expect(ctx.reason).toBe("unauthenticated");
    expect(ctx.user).toBeNull();
  });

  it("returns session_expired for expired standard session", async () => {
    const expired = Date.now() - 13 * 60 * 60 * 1000;
    mockGetServerSession.mockResolvedValue(
      makeSession({ loginAt: expired }) as never,
    );
    const ctx = await getAuthContext();
    expect(ctx.reason).toBe("session_expired");
  });

  it("returns account_missing when user not in DB", async () => {
    mockGetServerSession.mockResolvedValue(makeSession() as never);
    mockReadAuthUserById.mockResolvedValue({ user: null });
    const ctx = await getAuthContext();
    expect(ctx.reason).toBe("account_missing");
  });

  it("returns session_stale when sessionVersion mismatches", async () => {
    mockGetServerSession.mockResolvedValue(
      makeSession({ sessionVersion: 1 }) as never,
    );
    mockReadAuthUserById.mockResolvedValue(
      makeDbUser({ sessionVersion: 2 }) as never,
    );
    const ctx = await getAuthContext();
    expect(ctx.reason).toBe("session_stale");
  });

  it("returns candidate_inactive for non-active candidate", async () => {
    mockGetServerSession.mockResolvedValue(
      makeSession({ role: "candidate", sessionVersion: 1 }) as never,
    );
    mockReadAuthUserById.mockResolvedValue(
      makeDbUser({
        role: "candidate",
        candidateId: "cand-1",
        sessionVersion: 1,
        candidate: { onboardingStatus: "suspended" },
      }) as never,
    );
    const ctx = await getAuthContext();
    expect(ctx.reason).toBe("candidate_inactive");
  });

  it("returns ok for valid admin session", async () => {
    mockGetServerSession.mockResolvedValue(makeSession() as never);
    mockReadAuthUserById.mockResolvedValue(makeDbUser() as never);
    const ctx = await getAuthContext();
    expect(ctx.reason).toBe("ok");
    expect(ctx.user).toBeTruthy();
  });

  it("returns ok for valid active candidate session", async () => {
    mockGetServerSession.mockResolvedValue(
      makeSession({ role: "candidate", sessionVersion: 1 }) as never,
    );
    mockReadAuthUserById.mockResolvedValue(
      makeDbUser({
        role: "candidate",
        candidateId: "cand-1",
        sessionVersion: 1,
        candidate: { onboardingStatus: "active" },
      }) as never,
    );
    const ctx = await getAuthContext();
    expect(ctx.reason).toBe("ok");
  });
});

describe("requireRole", () => {
  it("returns error for unauthenticated request", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const result = await requireRole("admin");
    expect(result.error).toBeTruthy();
    expect(result.session).toBeNull();
  });

  it("returns error when role doesn't match", async () => {
    mockGetServerSession.mockResolvedValue(makeSession() as never);
    mockReadAuthUserById.mockResolvedValue(makeDbUser() as never);
    const result = await requireRole("candidate");
    expect(result.error).toBeTruthy();
  });

  it("returns session and user when role matches", async () => {
    mockGetServerSession.mockResolvedValue(makeSession() as never);
    mockReadAuthUserById.mockResolvedValue(makeDbUser() as never);
    const result = await requireRole("admin");
    expect(result.error).toBeNull();
    expect(result.session).toBeTruthy();
    expect(result.user?.role).toBe("admin");
  });
});
