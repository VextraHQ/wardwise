import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSendEmail, mockBuildContactNotificationEmail } = vi.hoisted(() => ({
  mockSendEmail: vi.fn(),
  mockBuildContactNotificationEmail: vi.fn(),
}));

vi.mock("@/lib/email/send", () => ({
  readTrimmedEnv: (name: string) => {
    const raw = process.env[name];
    if (!raw) return undefined;
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  sendEmail: mockSendEmail,
}));

vi.mock("@/lib/email/templates/contact-notification", () => ({
  buildContactNotificationEmail: mockBuildContactNotificationEmail,
}));

import { sendContactNotificationEmail } from "@/lib/email/contact";

beforeEach(() => {
  delete process.env.CONTACT_TO_EMAIL;
  vi.clearAllMocks();
  mockBuildContactNotificationEmail.mockReturnValue({
    subject: "subject",
    html: "<p>html</p>",
    text: "text",
  });
});

describe("sendContactNotificationEmail", () => {
  it("returns not_configured when CONTACT_TO_EMAIL is missing", async () => {
    const result = await sendContactNotificationEmail({
      name: "Ada",
      email: "ada@example.com",
      reason: "demo",
      reasonDetails: "",
      message: "Hello there",
      submittedAt: new Date("2026-04-30T09:00:00.000Z"),
      sourcePath: "/contact",
    });

    expect(result).toEqual({ sent: false, reason: "not_configured" });
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("delegates template building and sendEmail on success", async () => {
    process.env.CONTACT_TO_EMAIL = "support@wardwise.ng";
    mockSendEmail.mockResolvedValue({ sent: true });
    const submittedAt = new Date("2026-04-30T09:00:00.000Z");

    const result = await sendContactNotificationEmail({
      name: "Ada",
      email: "ada@example.com",
      reason: "demo",
      reasonDetails: "Procurement",
      message: "Hello there",
      submittedAt,
      sourcePath: "/contact",
    });

    expect(result).toEqual({ sent: true });
    expect(mockBuildContactNotificationEmail).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
      reason: "demo",
      reasonDetails: "Procurement",
      message: "Hello there",
      submittedAt,
      sourcePath: "/contact",
    });
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: "support@wardwise.ng",
      subject: "subject",
      html: "<p>html</p>",
      text: "text",
      replyTo: "ada@example.com",
    });
  });

  it("bubbles not_configured from sendEmail", async () => {
    process.env.CONTACT_TO_EMAIL = "support@wardwise.ng";
    mockSendEmail.mockResolvedValue({
      sent: false,
      reason: "not_configured",
    });

    const result = await sendContactNotificationEmail({
      name: "Ada",
      email: "ada@example.com",
      reason: "support",
      reasonDetails: "",
      message: "Need help",
      submittedAt: new Date("2026-04-30T09:00:00.000Z"),
      sourcePath: "/contact",
    });

    expect(result).toEqual({ sent: false, reason: "not_configured" });
  });
});
