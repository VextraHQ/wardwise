import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildAuthLinkEmail } from "./auth-link";

const BASE_URL = "http://localhost:3000/reset-password/abc";
const EXPIRES = new Date("2026-05-01T12:34:00Z");
const LOGO_URL = "https://app.wardwise.ng/brand/logotype-lagoon.png";

beforeEach(() => {
  vi.stubEnv("NEXTAUTH_URL", "https://app.wardwise.ng");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("buildAuthLinkEmail invite copy", () => {
  it("uses invite subject and mentions setting up access", async () => {
    const { subject, html, text } = await buildAuthLinkEmail({
      type: "invite",
      name: "Ada",
      url: BASE_URL,
      expiresAt: EXPIRES,
    });
    expect(subject).toBe("Set up your WardWise account");
    expect(html).toContain("Set up your WardWise access");
    expect(html).toContain("set your password");
    expect(text).toMatch(/set up your wardwise access/i);
    expect(html).toContain(LOGO_URL);
  });
});

describe("buildAuthLinkEmail password reset copy", () => {
  it("uses reset subject and mentions resetting", async () => {
    const { subject, html, text } = await buildAuthLinkEmail({
      type: "password_reset",
      name: "Ada",
      url: BASE_URL,
      expiresAt: EXPIRES,
    });
    expect(subject).toBe("Reset your WardWise password");
    expect(html).toContain("Reset your password");
    expect(text).toMatch(/reset your password/i);
  });
});

describe("buildAuthLinkEmail escaping", () => {
  it("escapes HTML in the name but keeps plain text in the text body", async () => {
    const { html, text } = await buildAuthLinkEmail({
      type: "invite",
      name: "<script>alert(1)</script>",
      url: BASE_URL,
      expiresAt: EXPIRES,
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(text).toContain("<script>alert(1)</script>");
  });

  it("escapes HTML in the url", async () => {
    const { html } = await buildAuthLinkEmail({
      type: "invite",
      name: "Ada",
      url: 'http://x.test/"><script>bad()</script>',
      expiresAt: EXPIRES,
    });
    expect(html).not.toContain('"><script>');
    expect(html).toContain("&quot;&gt;&lt;script&gt;");
  });

  it("falls back to a generic greeting when name is blank", async () => {
    const { html, text } = await buildAuthLinkEmail({
      type: "invite",
      name: "   ",
      url: BASE_URL,
      expiresAt: EXPIRES,
    });
    expect(html).toContain("Hello there,");
    expect(text).toContain("Hello there,");
  });
});

describe("buildAuthLinkEmail expiry formatting", () => {
  it("formats expiresAt for Africa/Lagos", async () => {
    const { html, text } = await buildAuthLinkEmail({
      type: "password_reset",
      name: "Ada",
      url: BASE_URL,
      expiresAt: new Date("2026-05-01T12:34:00Z"),
    });
    // 12:34 UTC = 13:34 in Africa/Lagos (UTC+1); en-NG short time uses 24h.
    expect(text).toContain("13:34");
    expect(html).toContain("13:34");
    expect(text).toContain("1 May 2026");
  });
});
