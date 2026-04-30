import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockLogAudit,
  mockSendContactNotificationEmail,
  mockVerifyTurnstileToken,
  mockContactRateLimit,
} = vi.hoisted(() => ({
  mockLogAudit: vi.fn(),
  mockSendContactNotificationEmail: vi.fn(),
  mockVerifyTurnstileToken: vi.fn(),
  mockContactRateLimit: {
    limit: vi.fn(),
  },
}));

vi.mock("@/lib/core/rate-limit", () => ({
  contactRateLimit: mockContactRateLimit,
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

vi.mock("@/lib/core/audit", () => ({
  logAudit: mockLogAudit,
}));

vi.mock("@/lib/contact/turnstile", () => ({
  verifyTurnstileToken: mockVerifyTurnstileToken,
}));

vi.mock("@/lib/email/contact", () => ({
  sendContactNotificationEmail: mockSendContactNotificationEmail,
}));

import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  reason: "demo",
  reasonDetails: "",
  message: "I would like a product walkthrough for the team.",
  website: "",
  turnstileToken: "turnstile-token",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockContactRateLimit.limit.mockResolvedValue({ success: true });
  mockVerifyTurnstileToken.mockResolvedValue({
    success: true,
    bypassed: false,
  });
  mockSendContactNotificationEmail.mockResolvedValue({ sent: true });
});

describe("POST /api/contact", () => {
  it("sends the contact notification for a valid submission", async () => {
    const response = await POST(makeRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSendContactNotificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Ada Lovelace",
        email: "ada@example.com",
        reason: "demo",
        reasonDetails: "",
        message: "I would like a product walkthrough for the team.",
        sourcePath: "/contact",
      }),
    );
  });

  it("silently accepts honeypot hits without sending email", async () => {
    const response = await POST(
      makeRequest({ ...validBody, website: "bot-value" }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockVerifyTurnstileToken).not.toHaveBeenCalled();
    expect(mockSendContactNotificationEmail).not.toHaveBeenCalled();
  });

  it("returns 400 when Turnstile rejects the token", async () => {
    mockVerifyTurnstileToken.mockResolvedValue({
      success: false,
      reason: "invalid",
    });

    const response = await POST(makeRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Verification failed/);
    expect(mockSendContactNotificationEmail).not.toHaveBeenCalled();
  });

  it("returns 429 when the contact rate limit is exceeded", async () => {
    mockContactRateLimit.limit.mockResolvedValue({ success: false });

    const response = await POST(makeRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toMatch(/Too many messages/);
    expect(mockVerifyTurnstileToken).not.toHaveBeenCalled();
  });

  it("returns 503 when Turnstile is not configured in production", async () => {
    mockVerifyTurnstileToken.mockResolvedValue({
      success: false,
      reason: "not_configured",
    });

    const response = await POST(makeRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toMatch(/temporarily unavailable/);
  });

  it("returns 503 when contact email delivery is not configured", async () => {
    mockSendContactNotificationEmail.mockResolvedValue({
      sent: false,
      reason: "not_configured",
    });

    const response = await POST(makeRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toMatch(/temporarily unavailable/);
  });

  it("returns 500 when contact email delivery throws unexpectedly", async () => {
    mockSendContactNotificationEmail.mockRejectedValue(new Error("boom"));

    const response = await POST(makeRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toMatch(/couldn't send/i);
  });
});
