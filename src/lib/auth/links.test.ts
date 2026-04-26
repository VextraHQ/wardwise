import { describe, it, expect, vi, beforeEach } from "vitest";
const { mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    authToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    candidate: {
      update: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: unknown) => Promise<void>) => fn(mockPrisma)),
  };
  return { mockPrisma };
});

vi.mock("@/lib/core/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/auth/storage", () => ({
  readAuthUserById: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed-password") },
}));

vi.mock("@/lib/email/auth", () => ({
  sendAuthLinkEmail: vi.fn(),
  canSendAuthLinkEmail: vi.fn(),
}));

import {
  getAuthLinkContext,
  consumeAuthLink,
  generateAuthToken,
  createInviteForUser,
  createPasswordResetForUser,
} from "./links";
import { readAuthUserById } from "@/lib/auth/storage";
import { sendAuthLinkEmail } from "@/lib/email/auth";

const mockReadAuthUserById = vi.mocked(readAuthUserById);
const mockSendAuthLinkEmail = vi.mocked(sendAuthLinkEmail);

function makeTokenRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "token-1",
    type: "invite",
    expiresAt: new Date(Date.now() + 3600000),
    usedAt: null,
    user: {
      id: "user-1",
      name: "Test",
      email: "test@test.com",
      role: "candidate",
      candidateId: "cand-1",
      sessionVersion: 1,
      candidate: {
        id: "cand-1",
        name: "Test Candidate",
        onboardingStatus: "credentials_sent",
      },
    },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  delete process.env.AUTH_FROM_EMAIL;
});

describe("generateAuthToken", () => {
  it("returns a base64url string", () => {
    const token = generateAuthToken();
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("generates unique tokens", () => {
    const a = generateAuthToken();
    const b = generateAuthToken();
    expect(a).not.toBe(b);
  });
});

describe("getAuthLinkContext", () => {
  it("returns null for unknown token", async () => {
    mockPrisma.authToken.findUnique.mockResolvedValue(null);
    const result = await getAuthLinkContext("unknown-token");
    expect(result).toBeNull();
  });

  it("returns isValid: false for expired token", async () => {
    const token = generateAuthToken();
    mockPrisma.authToken.findUnique.mockResolvedValue(
      makeTokenRecord({
        expiresAt: new Date(Date.now() - 1000),
      }),
    );
    const result = await getAuthLinkContext(token);
    expect(result?.isValid).toBe(false);
    expect(result?.isExpired).toBe(true);
  });

  it("returns isValid: false for used token", async () => {
    const token = generateAuthToken();
    mockPrisma.authToken.findUnique.mockResolvedValue(
      makeTokenRecord({
        usedAt: new Date(),
      }),
    );
    const result = await getAuthLinkContext(token);
    expect(result?.isValid).toBe(false);
    expect(result?.isUsed).toBe(true);
  });

  it("returns isValid: false for suspended candidate", async () => {
    const token = generateAuthToken();
    mockPrisma.authToken.findUnique.mockResolvedValue(
      makeTokenRecord({
        user: {
          id: "user-1",
          name: "Test",
          email: "test@test.com",
          role: "candidate",
          candidateId: "cand-1",
          sessionVersion: 1,
          candidate: {
            id: "cand-1",
            name: "Test",
            onboardingStatus: "suspended",
          },
        },
      }),
    );
    const result = await getAuthLinkContext(token);
    expect(result?.isValid).toBe(false);
    expect((result as { isSuspended?: boolean })?.isSuspended).toBe(true);
  });

  it("returns isValid: true for valid unexpired token", async () => {
    const token = generateAuthToken();
    mockPrisma.authToken.findUnique.mockResolvedValue(makeTokenRecord());
    const result = await getAuthLinkContext(token);
    expect(result?.isValid).toBe(true);
    expect(result?.isExpired).toBe(false);
    expect(result?.isUsed).toBe(false);
  });
});

describe("consumeAuthLink", () => {
  it("returns invalid_link for unknown token", async () => {
    mockPrisma.authToken.findUnique.mockResolvedValue(null);
    const result = await consumeAuthLink({
      token: "bad",
      password: "newpass123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe("invalid_link");
    }
  });

  it("consumes valid token and activates candidate", async () => {
    const token = generateAuthToken();
    mockPrisma.authToken.findUnique.mockResolvedValue(makeTokenRecord());

    const result = await consumeAuthLink({
      token,
      password: "SecurePass123!",
    });

    expect(result.success).toBe(true);

    expect(mockPrisma.authToken.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "token-1" },
        data: expect.objectContaining({ usedAt: expect.any(Date) }),
      }),
    );

    expect(mockPrisma.authToken.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user-1",
          usedAt: null,
        }),
      }),
    );

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: expect.objectContaining({
          password: "hashed-password",
          sessionVersion: { increment: 1 },
        }),
      }),
    );

    expect(mockPrisma.candidate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cand-1" },
        data: { onboardingStatus: "active" },
      }),
    );
  });

  it("does not activate candidate when user has no candidateId", async () => {
    const token = generateAuthToken();
    mockPrisma.authToken.findUnique.mockResolvedValue(
      makeTokenRecord({
        user: {
          id: "user-1",
          name: "Admin",
          email: "admin@test.com",
          role: "admin",
          candidateId: null,
          sessionVersion: 1,
          candidate: null,
        },
      }),
    );

    const result = await consumeAuthLink({
      token,
      password: "SecurePass123!",
    });

    expect(result.success).toBe(true);
    expect(mockPrisma.candidate.update).not.toHaveBeenCalled();
  });
});

function setupUserForWrapper() {
  mockReadAuthUserById.mockResolvedValue({
    user: {
      id: "user-1",
      name: "Ada",
      email: "ada@test.com",
      role: "candidate",
      candidateId: "cand-1",
      candidate: {
        id: "cand-1",
        name: "Ada Campaign",
        onboardingStatus: "credentials_sent",
      },
    },
  } as unknown as Awaited<ReturnType<typeof readAuthUserById>>);
  mockPrisma.authToken.deleteMany.mockResolvedValue({ count: 0 });
  mockPrisma.authToken.create.mockResolvedValue({});
}

describe("createInviteForUser delivery fallback", () => {
  beforeEach(setupUserForWrapper);

  it("reports email when sendAuthLinkEmail resolves sent: true", async () => {
    mockSendAuthLinkEmail.mockResolvedValue({ sent: true });
    const result = await createInviteForUser({ userId: "user-1" });
    expect(result.deliveryMethod).toBe("email");
  });

  it("reports manual when sendAuthLinkEmail resolves not_configured", async () => {
    mockSendAuthLinkEmail.mockResolvedValue({
      sent: false,
      reason: "not_configured",
    });
    const result = await createInviteForUser({ userId: "user-1" });
    expect(result.deliveryMethod).toBe("manual");
  });

  it("reports manual when sendAuthLinkEmail throws", async () => {
    mockSendAuthLinkEmail.mockRejectedValue(new Error("boom"));
    const result = await createInviteForUser({ userId: "user-1" });
    expect(result.deliveryMethod).toBe("manual");
  });
});

describe("createPasswordResetForUser delivery fallback", () => {
  beforeEach(setupUserForWrapper);

  it("reports email when sendAuthLinkEmail resolves sent: true", async () => {
    mockSendAuthLinkEmail.mockResolvedValue({ sent: true });
    const result = await createPasswordResetForUser({ userId: "user-1" });
    expect(result.deliveryMethod).toBe("email");
  });

  it("reports manual when sendAuthLinkEmail resolves not_configured", async () => {
    mockSendAuthLinkEmail.mockResolvedValue({
      sent: false,
      reason: "not_configured",
    });
    const result = await createPasswordResetForUser({ userId: "user-1" });
    expect(result.deliveryMethod).toBe("manual");
  });

  it("reports manual when sendAuthLinkEmail throws", async () => {
    mockSendAuthLinkEmail.mockRejectedValue(new Error("boom"));
    const result = await createPasswordResetForUser({ userId: "user-1" });
    expect(result.deliveryMethod).toBe("manual");
  });
});
