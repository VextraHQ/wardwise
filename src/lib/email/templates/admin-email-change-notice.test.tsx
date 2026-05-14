import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildAdminEmailChangeNoticeEmail } from "./admin-email-change-notice";

beforeEach(() => {
  vi.stubEnv("NEXTAUTH_URL", "https://app.wardwise.ng");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("buildAdminEmailChangeNoticeEmail", () => {
  it("describes the old-to-new email move and includes request context", async () => {
    const email = await buildAdminEmailChangeNoticeEmail({
      name: "Ada",
      currentEmail: "admin@wardwise.ng",
      targetEmail: "ada@wardwise.ng",
      requestedAt: new Date("2026-05-14T12:30:00Z"),
      requestIp: "::1",
      userAgent: "Firefox on macOS",
    });

    expect(email.subject).toBe("Security notice: admin email change requested");
    expect(email.html).toContain("admin@wardwise.ng");
    expect(email.html).toContain("ada@wardwise.ng");
    expect(email.html).toContain("Localhost (this device)");
    expect(email.html).toContain("Firefox on macOS");
    expect(email.text).toMatch(/no action is needed on this inbox/i);
  });

  it("falls back to a generic greeting when the name is blank", async () => {
    const email = await buildAdminEmailChangeNoticeEmail({
      name: "   ",
      currentEmail: "admin@wardwise.ng",
      targetEmail: "new@wardwise.ng",
      requestedAt: new Date("2026-05-14T12:30:00Z"),
    });

    expect(email.html).toContain("Hi there");
    expect(email.text).toMatch(/hi there/i);
  });
});
