import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildContactNotificationEmail } from "./contact-notification";

const LOGO_URL = "https://app.wardwise.ng/brand/logotype-lagoon.png";

beforeEach(() => {
  vi.stubEnv("NEXTAUTH_URL", "https://app.wardwise.ng");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("buildContactNotificationEmail", () => {
  it("renders the selected reason in subject and body", async () => {
    const email = await buildContactNotificationEmail({
      name: "Ada",
      email: "ada@example.com",
      reason: "demo",
      reasonDetails: "",
      message: "Hello there",
      submittedAt: new Date("2026-04-30T09:00:00.000Z"),
      sourcePath: "/contact",
    });

    expect(email.subject).toContain("Request a Demo");
    expect(email.html).toContain("Contact form");
    expect(email.text).toMatch(/request a demo/i);
    expect(email.html).toContain(LOGO_URL);
  });

  it("escapes HTML-sensitive values in the html body but keeps plain text readable", async () => {
    const email = await buildContactNotificationEmail({
      name: '<script>alert("x")</script>',
      email: 'ada@example.com"><script>',
      reason: "support",
      reasonDetails: '<script>alert("reason")</script>',
      message: "Need help <b>now</b>",
      submittedAt: new Date("2026-04-30T09:00:00.000Z"),
      sourcePath: "/contact",
    });

    expect(email.html).toContain(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
    expect(email.html).toContain(
      "&lt;script&gt;alert(&quot;reason&quot;)&lt;/script&gt;",
    );
    expect(email.html).toContain("Need help &lt;b&gt;now&lt;/b&gt;");
    expect(email.text).toContain("Need help <b>now</b>");
  });

  it("includes a Lagos-formatted submitted timestamp", async () => {
    const email = await buildContactNotificationEmail({
      name: "Ada",
      email: "ada@example.com",
      reason: "press",
      reasonDetails: "",
      message: "Hi",
      submittedAt: new Date("2026-04-30T09:00:00.000Z"),
      sourcePath: "/contact",
    });

    expect(email.text).toMatch(/Apr|30|2026/);
  });

  it("uses reason details in the subject when supplied", async () => {
    const email = await buildContactNotificationEmail({
      name: "Ada",
      email: "ada@example.com",
      reason: "other",
      reasonDetails: "Procurement review",
      message: "Hi",
      submittedAt: new Date("2026-04-30T09:00:00.000Z"),
      sourcePath: "/contact",
    });

    expect(email.subject).toContain(
      "Other / Something Else - Procurement review",
    );
  });

  it("renders a scannable metadata and message structure", async () => {
    const email = await buildContactNotificationEmail({
      name: "Ada",
      email: "ada@example.com",
      reason: "support",
      reasonDetails: "",
      message: "Need help with dashboard access",
      submittedAt: new Date("2026-04-30T09:00:00.000Z"),
      sourcePath: "/contact",
    });

    expect(email.html).toContain(">Name<");
    expect(email.html).toContain(">Ada<");
    expect(email.html).toContain(">Email<");
    expect(email.html).toContain(">ada@example.com<");
    expect(email.html).toContain(">Submitted<");
    expect(email.html).toContain(">Message<");
    expect(email.text).toMatch(/Source\s+\/contact/);
    expect(email.html).toContain("Reply To Sender");
    expect(email.html).toContain("mailto:ada@example.com");
  });

  it("points the header logo at the canonical HTTPS host when NEXTAUTH_URL is localhost", async () => {
    vi.stubEnv("NEXTAUTH_URL", "http://localhost:3000");

    try {
      const email = await buildContactNotificationEmail({
        name: "Ada",
        email: "ada@example.com",
        reason: "demo",
        reasonDetails: "",
        message: "Hello",
        submittedAt: new Date("2026-04-30T09:00:00.000Z"),
        sourcePath: "/contact",
      });

      expect(email.html).toContain(
        "https://wardwise.ng/brand/logotype-lagoon.png",
      );
    } finally {
      vi.stubEnv("NEXTAUTH_URL", "https://app.wardwise.ng");
    }
  });
});
