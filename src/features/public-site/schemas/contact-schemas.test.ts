import { describe, expect, it } from "vitest";
import { contactFormSchema } from "./contact-schemas";

describe("contactFormSchema", () => {
  it("parses and normalizes a valid payload", () => {
    const parsed = contactFormSchema.parse({
      name: "  Ada Lovelace  ",
      email: " ADA@EXAMPLE.COM ",
      reason: "demo",
      reasonDetails: "  procurement review  ",
      message: "  I would like a product walkthrough.  ",
      website: "   ",
      turnstileToken: " token-123 ",
    });

    expect(parsed).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      reason: "demo",
      reasonDetails: "procurement review",
      message: "I would like a product walkthrough.",
      website: "",
      turnstileToken: "token-123",
    });
  });

  it("rejects invalid email addresses", () => {
    const parsed = contactFormSchema.safeParse({
      name: "Ada",
      email: "not-an-email",
      reason: "demo",
      message: "I would like a product walkthrough.",
      website: "",
      turnstileToken: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects unsupported reasons", () => {
    const parsed = contactFormSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      reason: "unknown",
      message: "I would like a product walkthrough.",
      reasonDetails: "",
      website: "",
      turnstileToken: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects messages that are too short", () => {
    const parsed = contactFormSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      reason: "demo",
      reasonDetails: "",
      message: "short",
      website: "",
      turnstileToken: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("requires reason details when other is selected", () => {
    const parsed = contactFormSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      reason: "other",
      reasonDetails: "   ",
      message: "I need help with something outside the listed options.",
      website: "",
      turnstileToken: "",
    });

    expect(parsed.success).toBe(false);
  });
});
