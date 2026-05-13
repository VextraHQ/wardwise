import { describe, it, expect, vi, beforeEach } from "vitest";
const { mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    authToken: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
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
  createAdminEmailChangeToken,
  consumeAdminEmailChangeToken,
  readAdminEmailChangeTokenPreview,
  revokeAdminEmailChangeTokensForUser,
  ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
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

describe("createAdminEmailChangeToken", () => {
  beforeEach(() => {
    mockPrisma.authToken.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.authToken.create.mockResolvedValue({});
  });

  it("revokes older pending tokens before creating a new one", async () => {
    await createAdminEmailChangeToken({
      userId: "user-1",
      targetEmail: "new@example.com",
    });

    expect(mockPrisma.authToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user-1",
          type: ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
          usedAt: null,
        }),
        data: expect.objectContaining({ usedAt: expect.any(Date) }),
      }),
    );

    expect(mockPrisma.authToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          type: ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
          targetEmail: "new@example.com",
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date),
          createdById: "user-1",
        }),
      }),
    );
  });

  it("returns a confirm URL pointing at /confirm-email-change", async () => {
    const issued = await createAdminEmailChangeToken({
      userId: "user-1",
      targetEmail: "new@example.com",
    });
    expect(issued.url).toContain("/confirm-email-change/");
    expect(issued.token).toBeTruthy();
    expect(issued.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});

describe("revokeAdminEmailChangeTokensForUser", () => {
  it("marks unused admin_email_change tokens as used", async () => {
    mockPrisma.authToken.updateMany.mockResolvedValue({ count: 2 });
    await revokeAdminEmailChangeTokensForUser("user-1");
    expect(mockPrisma.authToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user-1",
          type: ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
          usedAt: null,
        }),
        data: expect.objectContaining({ usedAt: expect.any(Date) }),
      }),
    );
  });
});

describe("readAdminEmailChangeTokenPreview", () => {
  it("returns null for unknown token", async () => {
    mockPrisma.authToken.findUnique.mockResolvedValue(null);
    const preview = await readAdminEmailChangeTokenPreview("nope");
    expect(preview).toBeNull();
  });

  it("returns null when type is not admin_email_change", async () => {
    mockPrisma.authToken.findUnique.mockResolvedValue({
      type: "password_reset",
      targetEmail: null,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      createdAt: new Date(),
    });
    const preview = await readAdminEmailChangeTokenPreview("x");
    expect(preview).toBeNull();
  });

  it("marks expired tokens as invalid", async () => {
    mockPrisma.authToken.findUnique.mockResolvedValue({
      type: ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
      targetEmail: "new@example.com",
      expiresAt: new Date(Date.now() - 1000),
      usedAt: null,
      createdAt: new Date(),
    });
    const preview = await readAdminEmailChangeTokenPreview("x");
    expect(preview?.isValid).toBe(false);
    expect(preview?.isExpired).toBe(true);
  });

  it("marks used tokens as invalid", async () => {
    mockPrisma.authToken.findUnique.mockResolvedValue({
      type: ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
      targetEmail: "new@example.com",
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: new Date(),
      createdAt: new Date(),
    });
    const preview = await readAdminEmailChangeTokenPreview("x");
    expect(preview?.isValid).toBe(false);
    expect(preview?.isUsed).toBe(true);
  });

  it("returns target email and expiry for valid tokens", async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    mockPrisma.authToken.findUnique.mockResolvedValue({
      type: ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
      targetEmail: "new@example.com",
      expiresAt,
      usedAt: null,
      createdAt: new Date(),
    });
    const preview = await readAdminEmailChangeTokenPreview("x");
    expect(preview?.isValid).toBe(true);
    expect(preview?.targetEmail).toBe("new@example.com");
    expect(preview?.expiresAt).toEqual(expiresAt);
  });
});

describe("consumeAdminEmailChangeToken", () => {
  beforeEach(() => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.authToken.update.mockResolvedValue({});
    mockPrisma.authToken.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.user.update.mockResolvedValue({});
  });

  function makeAdminEmailChangeRecord(overrides: Record<string, unknown> = {}) {
    return {
      id: "tok-1",
      userId: "user-1",
      type: ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
      targetEmail: "new@example.com",
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      ...overrides,
    };
  }

  it("returns invalid for unknown tokens", async () => {
    mockPrisma.authToken.findUnique.mockResolvedValue(null);
    const result = await consumeAdminEmailChangeToken({ token: "nope" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toBe("invalid");
  });

  it("returns invalid for wrong-type tokens", async () => {
    mockPrisma.authToken.findUnique.mockResolvedValue(
      makeAdminEmailChangeRecord({ type: "password_reset" }),
    );
    const result = await consumeAdminEmailChangeToken({ token: "x" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toBe("invalid");
  });

  it("returns used for already-consumed tokens", async () => {
    mockPrisma.authToken.findUnique.mockResolvedValue(
      makeAdminEmailChangeRecord({ usedAt: new Date() }),
    );
    const result = await consumeAdminEmailChangeToken({ token: "x" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toBe("used");
  });

  it("returns expired for past-due tokens", async () => {
    mockPrisma.authToken.findUnique.mockResolvedValue(
      makeAdminEmailChangeRecord({
        expiresAt: new Date(Date.now() - 1000),
      }),
    );
    const result = await consumeAdminEmailChangeToken({ token: "x" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toBe("expired");
  });

  it("returns conflict when another user owns the target email", async () => {
    mockPrisma.authToken.findUnique.mockResolvedValue(
      makeAdminEmailChangeRecord(),
    );
    mockPrisma.user.findFirst.mockResolvedValue({ id: "other-user" });

    const result = await consumeAdminEmailChangeToken({ token: "x" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toBe("conflict");
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.authToken.update).not.toHaveBeenCalled();
  });

  it("swaps email, bumps sessionVersion, and revokes siblings on success", async () => {
    mockPrisma.authToken.findUnique.mockResolvedValue(
      makeAdminEmailChangeRecord(),
    );

    const result = await consumeAdminEmailChangeToken({ token: "x" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.userId).toBe("user-1");
      expect(result.newEmail).toBe("new@example.com");
    }

    expect(mockPrisma.authToken.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "tok-1" },
        data: expect.objectContaining({ usedAt: expect.any(Date) }),
      }),
    );

    expect(mockPrisma.authToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user-1",
          type: ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
          usedAt: null,
        }),
        data: expect.objectContaining({ usedAt: expect.any(Date) }),
      }),
    );

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: expect.objectContaining({
          email: "new@example.com",
          sessionVersion: { increment: 1 },
        }),
      }),
    );
  });
});
