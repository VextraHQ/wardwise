import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type * as SendModule from "./send";

vi.mock("./send", async () => {
  const actual = await vi.importActual<typeof SendModule>("./send");
  return {
    ...actual,
    sendEmail: vi.fn(),
  };
});

import { canSendAuthLinkEmail, sendAuthLinkEmail } from "./auth";
import { sendEmail } from "./send";

const mockSendEmail = vi.mocked(sendEmail);

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  delete process.env.AUTH_FROM_EMAIL;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("canSendAuthLinkEmail", () => {
  it("returns false when RESEND_API_KEY is missing", () => {
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    expect(canSendAuthLinkEmail()).toBe(false);
  });

  it("returns false when RESEND_API_KEY is whitespace-only", () => {
    process.env.RESEND_API_KEY = "   ";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    expect(canSendAuthLinkEmail()).toBe(false);
  });

  it("returns false when both EMAIL_FROM and AUTH_FROM_EMAIL are missing", () => {
    process.env.RESEND_API_KEY = "re_test";
    expect(canSendAuthLinkEmail()).toBe(false);
  });

  it("returns false when both sender vars are whitespace-only", () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "   ";
    process.env.AUTH_FROM_EMAIL = "\t";
    expect(canSendAuthLinkEmail()).toBe(false);
  });

  it("returns true when RESEND_API_KEY and EMAIL_FROM are set", () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    expect(canSendAuthLinkEmail()).toBe(true);
  });

  it("returns true when RESEND_API_KEY and only AUTH_FROM_EMAIL are set", () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.AUTH_FROM_EMAIL = "WardWise <auth@wardwise.ng>";
    expect(canSendAuthLinkEmail()).toBe(true);
  });
});

describe("sendAuthLinkEmail", () => {
  it("delegates to sendEmail with built subject/html/text and bubbles success", async () => {
    mockSendEmail.mockResolvedValue({ sent: true });

    const result = await sendAuthLinkEmail({
      to: "ada@test.com",
      type: "invite",
      name: "Ada",
      url: "http://localhost:3000/reset-password/abc",
      expiresAt: new Date("2026-05-01T12:34:00Z"),
    });

    expect(result).toEqual({ sent: true });
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    const call = mockSendEmail.mock.calls[0][0];
    expect(call.to).toBe("ada@test.com");
    expect(call.subject).toBe("Set up your WardWise account");
    expect(call.html).toContain("Set up your WardWise access");
    expect(call.text).toMatch(/set up your wardwise access/i);
  });

  it("bubbles not_configured from sendEmail", async () => {
    mockSendEmail.mockResolvedValue({ sent: false, reason: "not_configured" });

    const result = await sendAuthLinkEmail({
      to: "ada@test.com",
      type: "password_reset",
      name: "Ada",
      url: "http://localhost:3000/reset-password/abc",
      expiresAt: new Date(),
    });

    expect(result).toEqual({ sent: false, reason: "not_configured" });
  });
});
