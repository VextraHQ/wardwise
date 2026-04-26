import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    user: {
      findFirst: vi.fn(),
    },
  };
  return { mockPrisma };
});

vi.mock("@/lib/core/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/core/rate-limit", () => ({
  recoveryRateLimit: null,
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

vi.mock("@/lib/auth/links", () => ({
  createPasswordResetForUser: vi.fn().mockResolvedValue({
    token: "test-token",
    url: "http://localhost:3000/reset-password/test-token",
    expiresAt: new Date(),
    deliveryMethod: "email",
  }),
  revokeOutstandingAuthLinks: vi.fn(),
}));

vi.mock("@/lib/email/auth", () => ({
  canSendAuthLinkEmail: vi.fn().mockReturnValue(true),
}));

import { POST } from "./route";
import { canSendAuthLinkEmail } from "@/lib/email/auth";

const mockCanSend = vi.mocked(canSendAuthLinkEmail);

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCanSend.mockReturnValue(true);
});

describe("forgot-password non-enumeration", () => {
  it("returns success for valid email with existing user", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: "user-1",
      role: "candidate",
      candidate: { onboardingStatus: "active" },
    });
    const res = await POST(makeRequest({ email: "exists@test.com" }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns same success for non-existent email", async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    const res = await POST(makeRequest({ email: "nobody@test.com" }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns same success for suspended candidate", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: "user-1",
      role: "candidate",
      candidate: { onboardingStatus: "suspended" },
    });
    const res = await POST(makeRequest({ email: "suspended@test.com" }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns success without issuing link when email delivery is unavailable", async () => {
    mockCanSend.mockReturnValue(false);
    const res = await POST(makeRequest({ email: "anyone@test.com" }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid email format", async () => {
    const res = await POST(makeRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty body", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });
});
