import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { MockResend, mockEmailSend } = vi.hoisted(() => {
  const mockEmailSend = vi.fn();
  const MockResend = vi.fn(function MockResend() {
    return {
      emails: {
        send: mockEmailSend,
      },
    };
  });

  return { MockResend, mockEmailSend };
});

vi.mock("resend", () => ({
  Resend: MockResend,
}));

import { sendEmail } from "./send";

beforeEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  delete process.env.AUTH_FROM_EMAIL;
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockSendOk() {
  mockEmailSend.mockResolvedValue({
    data: { id: "email_123" },
    error: null,
    headers: null,
  });
}

describe("sendEmail configuration", () => {
  it("returns not_configured when RESEND_API_KEY is missing", async () => {
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    const result = await sendEmail({
      to: "a@b.com",
      subject: "s",
      html: "<p>h</p>",
    });
    expect(result).toEqual({ sent: false, reason: "not_configured" });
    expect(MockResend).not.toHaveBeenCalled();
  });

  it("returns not_configured when RESEND_API_KEY is whitespace-only", async () => {
    process.env.RESEND_API_KEY = "   ";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    const result = await sendEmail({
      to: "a@b.com",
      subject: "s",
      html: "<p>h</p>",
    });
    expect(result).toEqual({ sent: false, reason: "not_configured" });
    expect(MockResend).not.toHaveBeenCalled();
  });

  it("returns not_configured when neither EMAIL_FROM nor AUTH_FROM_EMAIL is set", async () => {
    process.env.RESEND_API_KEY = "re_test";
    const result = await sendEmail({
      to: "a@b.com",
      subject: "s",
      html: "<p>h</p>",
    });
    expect(result).toEqual({ sent: false, reason: "not_configured" });
    expect(MockResend).not.toHaveBeenCalled();
  });

  it("returns not_configured when both sender env vars are whitespace-only", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "   ";
    process.env.AUTH_FROM_EMAIL = "\t";
    const result = await sendEmail({
      to: "a@b.com",
      subject: "s",
      html: "<p>h</p>",
    });
    expect(result).toEqual({ sent: false, reason: "not_configured" });
    expect(MockResend).not.toHaveBeenCalled();
  });
});

describe("sendEmail from resolution", () => {
  it("prefers EMAIL_FROM over AUTH_FROM_EMAIL", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    process.env.AUTH_FROM_EMAIL = "WardWise <auth@wardwise.ng>";
    mockSendOk();

    await sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" });

    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "WardWise <hello@wardwise.ng>",
      }),
    );
  });

  it("falls through to AUTH_FROM_EMAIL when EMAIL_FROM is whitespace-only", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "   ";
    process.env.AUTH_FROM_EMAIL = "WardWise <auth@wardwise.ng>";
    mockSendOk();

    await sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" });

    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "WardWise <auth@wardwise.ng>",
      }),
    );
  });

  it("uses input.from when provided, overriding both env vars", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    process.env.AUTH_FROM_EMAIL = "WardWise <auth@wardwise.ng>";
    mockSendOk();

    await sendEmail({
      to: "a@b.com",
      subject: "s",
      html: "<p>h</p>",
      from: "Custom <custom@wardwise.ng>",
    });

    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Custom <custom@wardwise.ng>",
      }),
    );
  });
});

describe("sendEmail request payload", () => {
  it("uses the Resend SDK with the configured key and minimal payload", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    mockSendOk();

    const result = await sendEmail({
      to: "a@b.com",
      subject: "Hello",
      html: "<p>h</p>",
    });

    expect(result).toEqual({ sent: true });
    expect(MockResend).toHaveBeenCalledWith("re_test");
    expect(mockEmailSend).toHaveBeenCalledWith({
      from: "WardWise <hello@wardwise.ng>",
      to: ["a@b.com"],
      subject: "Hello",
      html: "<p>h</p>",
    });
  });

  it("includes replyTo when provided", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    mockSendOk();

    await sendEmail({
      to: "a@b.com",
      subject: "Hello",
      html: "<p>h</p>",
      replyTo: "support@wardwise.ng",
    });

    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: "support@wardwise.ng",
      }),
    );
  });

  it("includes text when provided", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    mockSendOk();

    await sendEmail({
      to: "a@b.com",
      subject: "Hello",
      html: "<p>h</p>",
      text: "plain body",
    });

    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "plain body",
      }),
    );
  });

  it("throws Error that includes both status and body snippet on provider errors", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    mockEmailSend.mockResolvedValue({
      data: null,
      error: {
        message: "resend quota exceeded",
        name: "rate_limit_exceeded",
        statusCode: 429,
      },
      headers: null,
    });

    await expect(
      sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" }),
    ).rejects.toThrow(/status 429.*resend quota exceeded/);
  });

  it("throws with status and no-body marker when provider error message is empty", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    mockEmailSend.mockResolvedValue({
      data: null,
      error: {
        message: " ",
        name: "internal_server_error",
        statusCode: 500,
      },
      headers: null,
    });

    await expect(
      sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" }),
    ).rejects.toThrow(/status 500.*<no response body>/);
  });

  it("truncates very long provider error bodies with an ellipsis", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    const longBody = "x".repeat(1200);
    mockEmailSend.mockResolvedValue({
      data: null,
      error: {
        message: longBody,
        name: "application_error",
        statusCode: 502,
      },
      headers: null,
    });

    await expect(
      sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" }),
    ).rejects.toThrow(/status 502.*x{500}…/);
  });
});
