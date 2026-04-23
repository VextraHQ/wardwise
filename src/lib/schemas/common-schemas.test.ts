import { describe, expect, it } from "vitest";
import {
  isValidNigerianPhone,
  normalizeNigerianPhoneInput,
  optionalNigerianPhoneSchema,
  phoneSchema,
  toLocalPhoneDisplay,
} from "./common-schemas";

describe("phoneSchema", () => {
  it("canonicalizes accepted Nigerian mobile formats", () => {
    expect(phoneSchema.parse("08031234567")).toBe("+2348031234567");
    expect(phoneSchema.parse("8031234567")).toBe("+2348031234567");
    expect(phoneSchema.parse("2348031234567")).toBe("+2348031234567");
    expect(phoneSchema.parse("+2348031234567")).toBe("+2348031234567");
  });

  it("allows visual separators without storing them", () => {
    expect(phoneSchema.parse("0803 123 4567")).toBe("+2348031234567");
    expect(phoneSchema.parse("+234 803-123-4567")).toBe("+2348031234567");
    expect(phoneSchema.parse("(0803) 123.4567")).toBe("+2348031234567");
  });

  it("rejects invalid inputs instead of truncating them", () => {
    expect(phoneSchema.safeParse("080312345678").success).toBe(false);
    expect(phoneSchema.safeParse("+234803123456789").success).toBe(false);
    expect(phoneSchema.safeParse("0803abc4567").success).toBe(false);
    expect(phoneSchema.safeParse("06031234567").success).toBe(false);
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
