import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildAccountWelcomeEmail } from "./account-welcome";

beforeEach(() => {
  vi.stubEnv("NEXTAUTH_URL", "https://app.wardwise.ng");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("buildAccountWelcomeEmail", () => {
  it("uses a fixed subject and sign-in CTA to the app login URL", async () => {
    const email = await buildAccountWelcomeEmail({ name: "Ada" });

    expect(email.subject).toBe("Welcome to WardWise");
    expect(email.html).toContain("You&#x27;re all set, ");
    expect(email.text).toMatch(/all set, Ada/i);
    expect(email.html).toContain("https://app.wardwise.ng/login");
    expect(email.html).toContain("All rights reserved");
    expect(email.text).toMatch(/sign in/i);
    expect(email.text).toContain("https://app.wardwise.ng/login");
  });

  it("falls back to a generic greeting when the name is blank", async () => {
    const email = await buildAccountWelcomeEmail({ name: "   " });

    expect(email.html).toContain("You&#x27;re all set, ");
    expect(email.text).toMatch(/all set, there/i);
  });
});
