import { describe, expect, it } from "vitest";
import {
  apcOrNinSchema,
  emailSchema,
  isValidNigerianPhone,
  nigerianPhoneSchema,
  ninSchema,
  normalizeNigerianPhoneInput,
  optionalEmailSchema,
  optionalNigerianPhoneSchema,
  optionalNullableTrimmedText,
  optionalTrimmedText,
  requiredTrimmedText,
  toLocalPhoneDisplay,
  voterIdVinSchema,
} from "./field-schemas";

describe("nigerianPhoneSchema", () => {
  it("canonicalizes accepted Nigerian mobile formats", () => {
    expect(nigerianPhoneSchema.parse("08031234567")).toBe("+2348031234567");
    expect(nigerianPhoneSchema.parse("8031234567")).toBe("+2348031234567");
    expect(nigerianPhoneSchema.parse("2348031234567")).toBe("+2348031234567");
    expect(nigerianPhoneSchema.parse("+2348031234567")).toBe("+2348031234567");
  });

  it("allows visual separators without storing them", () => {
    expect(nigerianPhoneSchema.parse("0803 123 4567")).toBe("+2348031234567");
    expect(nigerianPhoneSchema.parse("+234 803-123-4567")).toBe(
      "+2348031234567",
    );
    expect(nigerianPhoneSchema.parse("(0803) 123.4567")).toBe("+2348031234567");
  });

  it("rejects invalid inputs instead of truncating them", () => {
    expect(nigerianPhoneSchema.safeParse("080312345678").success).toBe(false);
    expect(nigerianPhoneSchema.safeParse("+234803123456789").success).toBe(
      false,
    );
    expect(nigerianPhoneSchema.safeParse("0803abc4567").success).toBe(false);
    expect(nigerianPhoneSchema.safeParse("06031234567").success).toBe(false);
  });

  it("normalizes only valid complete numbers", () => {
    expect(normalizeNigerianPhoneInput("08031234567")).toBe("+2348031234567");
    expect(normalizeNigerianPhoneInput("080312345678")).toBe("080312345678");
  });

  it("validates through the canonical parser", () => {
    expect(isValidNigerianPhone("0803 123 4567")).toBe(true);
    expect(isValidNigerianPhone("+2348031234567")).toBe(true);
    expect(isValidNigerianPhone("+234803123456789")).toBe(false);
  });

  it("supports optional canonical phone fields", () => {
    expect(optionalNigerianPhoneSchema.parse(undefined)).toBe(undefined);
    expect(optionalNigerianPhoneSchema.parse("")).toBe("");
    expect(optionalNigerianPhoneSchema.parse("08133160902")).toBe(
      "+2348133160902",
    );
    expect(optionalNigerianPhoneSchema.safeParse("081331609021").success).toBe(
      false,
    );
  });

  it("formats canonical phones for local display without guessing", () => {
    expect(toLocalPhoneDisplay("+2348031234567")).toBe("08031234567");
    expect(toLocalPhoneDisplay("08031234567")).toBe("08031234567");
    expect(toLocalPhoneDisplay("+234803123456789")).toBe("+234803123456789");
  });
});

describe("emailSchema", () => {
  it("trims, lowercases, and rejects invalid emails", () => {
    expect(emailSchema.parse("  FATIMA@MAIL.COM ")).toBe("fatima@mail.com");
    expect(emailSchema.safeParse("").success).toBe(false);
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });
});

describe("optionalEmailSchema", () => {
  it("accepts blank as empty string", () => {
    expect(optionalEmailSchema.parse("")).toBe("");
    expect(optionalEmailSchema.parse("   ")).toBe("");
  });

  it("trims and lowercases non-blank values", () => {
    expect(optionalEmailSchema.parse("  Fatima@Mail.com ")).toBe(
      "fatima@mail.com",
    );
  });

  it("rejects invalid non-blank values", () => {
    expect(optionalEmailSchema.safeParse("not-an-email").success).toBe(false);
  });
});

describe("ninSchema", () => {
  it("accepts a real 11-digit NIN", () => {
    expect(ninSchema.parse("12345678905")).toBe("12345678905");
  });

  it("rejects all-same-digit and sequential dummies", () => {
    expect(ninSchema.safeParse("11111111111").success).toBe(false);
    expect(ninSchema.safeParse("12345678901").success).toBe(false);
    expect(ninSchema.safeParse("01234567890").success).toBe(false);
  });

  it("rejects wrong-length and non-numeric input", () => {
    expect(ninSchema.safeParse("1234567890").success).toBe(false);
    expect(ninSchema.safeParse("123456789012").success).toBe(false);
    expect(ninSchema.safeParse("1234567890a").success).toBe(false);
  });
});

describe("apcOrNinSchema", () => {
  it("accepts a real 11-digit NIN", () => {
    expect(apcOrNinSchema.parse("12345678905")).toBe("12345678905");
  });

  it("rejects all-same-digit NIN and sequential dummies", () => {
    expect(apcOrNinSchema.safeParse("11111111111").success).toBe(false);
    expect(apcOrNinSchema.safeParse("12345678901").success).toBe(false);
    expect(apcOrNinSchema.safeParse("01234567890").success).toBe(false);
  });

  it("accepts APC-style alphanumeric codes with / and -", () => {
    expect(apcOrNinSchema.parse("APC/2023/0042")).toBe("APC/2023/0042");
    expect(apcOrNinSchema.parse("APC-2023-0042")).toBe("APC-2023-0042");
  });

  it("rejects short or garbage input", () => {
    expect(apcOrNinSchema.safeParse("ab").success).toBe(false);
    expect(apcOrNinSchema.safeParse("").success).toBe(false);
    expect(apcOrNinSchema.safeParse("has spaces").success).toBe(false);
  });
});

describe("voterIdVinSchema", () => {
  it("accepts exactly 19 alphanumeric and uppercases", () => {
    expect(voterIdVinSchema.parse("abc1234567890123456")).toBe(
      "ABC1234567890123456",
    );
  });

  it("rejects wrong-length and non-alphanumeric input", () => {
    expect(voterIdVinSchema.safeParse("abc123456789012345").success).toBe(
      false,
    );
    expect(voterIdVinSchema.safeParse("abc12345678901234567").success).toBe(
      false,
    );
    expect(voterIdVinSchema.safeParse("abc 1234567890123456").success).toBe(
      false,
    );
  });
});

describe("requiredTrimmedText", () => {
  const schema = requiredTrimmedText({ max: 10, label: "Name" });

  it("trims whitespace", () => {
    expect(schema.parse("  Hello  ")).toBe("Hello");
  });

  it("rejects blank and whitespace-only input after trim", () => {
    expect(schema.safeParse("").success).toBe(false);
    expect(schema.safeParse("   ").success).toBe(false);
    expect(schema.safeParse("\t\n").success).toBe(false);
  });

  it("enforces max length on trimmed value", () => {
    expect(schema.safeParse("12345678901").success).toBe(false);
    expect(schema.parse("  1234567890  ")).toBe("1234567890");
  });

  it("enforces min after trim when min > 1", () => {
    const minTwo = requiredTrimmedText({ min: 2, max: 10, label: "Name" });
    expect(minTwo.safeParse("a").success).toBe(false);
    expect(minTwo.safeParse("  a  ").success).toBe(false);
    expect(minTwo.parse("  ab  ")).toBe("ab");
  });
});

describe("optionalTrimmedText", () => {
  const schema = optionalTrimmedText({ max: 10 });

  it("keeps blank as empty string", () => {
    expect(schema.parse("")).toBe("");
    expect(schema.parse("   ")).toBe("");
  });

  it("trims non-blank values", () => {
    expect(schema.parse("  hi  ")).toBe("hi");
  });

  it("enforces max length on trimmed value", () => {
    expect(schema.safeParse("12345678901").success).toBe(false);
  });
});

describe("optionalNullableTrimmedText", () => {
  const schema = optionalNullableTrimmedText({ max: 10 });

  it("preserves undefined when the field is not sent", () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  it("normalizes blank, whitespace, and null to null", () => {
    expect(schema.parse("")).toBe(null);
    expect(schema.parse("   ")).toBe(null);
    expect(schema.parse(null)).toBe(null);
  });

  it("trims non-blank values", () => {
    expect(schema.parse("  hi  ")).toBe("hi");
  });

  it("enforces max length on trimmed value", () => {
    expect(schema.safeParse("12345678901").success).toBe(false);
  });
});
