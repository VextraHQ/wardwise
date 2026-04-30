import { describe, expect, it } from "vitest";
import { buildContactNotificationEmail } from "./contact-notification";

describe("buildContactNotificationEmail", () => {
  it("renders the selected reason in subject and body", () => {
    const email = buildContactNotificationEmail({
      name: "Ada",
      email: "ada@example.com",
      reason: "demo",
      reasonDetails: "",
      message: "Hello there",
      submittedAt: new Date("2026-04-30T09:00:00.000Z"),
      sourcePath: "/contact",
    });

    expect(email.subject).toContain("Request a Demo");
    expect(email.html).toContain("WardWise Contact Intake");
    expect(email.text).toContain("Request a Demo");
  });

  it("escapes HTML-sensitive values in the html body but keeps plain text readable", () => {
    const email = buildContactNotificationEmail({
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

  it("includes a Lagos-formatted submitted timestamp", () => {
    const email = buildContactNotificationEmail({
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

  it("uses reason details in the subject when supplied", () => {
    const email = buildContactNotificationEmail({
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
});
