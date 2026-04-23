import { z } from "zod";

export function normalizeEmailInput(input: string) {
  return input.trim().toLowerCase();
}

// Email validation schema
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

// Nigerian phone number validation and canonicalization.
// Accepts: +2348031234567, 2348031234567, 08031234567, 8031234567
// Also accepts spaces, hyphens, dots, and parentheses as visual separators.
const NIGERIAN_PHONE_ERROR =
  "Enter a valid Nigerian mobile number (e.g., 08031234567 or +2348031234567)";
const CANONICAL_NIGERIAN_PHONE_RE = /^\+234[789]\d{9}$/;
const LOCAL_NIGERIAN_MOBILE_RE = /^[789]\d{9}$/;
const PHONE_INPUT_CHARS_RE = /^\+?[\d\s().-]+$/;

function canonicalizeNigerianPhoneInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || !PHONE_INPUT_CHARS_RE.test(trimmed)) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, "");
  let localPart: string | null = null;

  if (digits.length === 13 && digits.startsWith("234")) {
    localPart = digits.slice(3);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    localPart = digits.slice(1);
  } else if (digits.length === 10) {
    localPart = digits;
  }

  if (!localPart || !LOCAL_NIGERIAN_MOBILE_RE.test(localPart)) {
    return null;
  }

  return `+234${localPart}`;
}

export const nigerianPhoneSchema = z.string().transform((input, ctx) => {
  const canonical = canonicalizeNigerianPhoneInput(input);
  if (!canonical) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: input.trim() ? NIGERIAN_PHONE_ERROR : "Phone number is required",
    });
    return "";
  }
  return canonical;
});

// Backward-compatible name used across the app. Successful parses return +234...
export const phoneSchema = nigerianPhoneSchema;

const emptyPhoneSchema = z
  .string()
  .transform((input) => input.trim())
  .pipe(z.literal(""));

export const optionalNigerianPhoneSchema = z
  .union([nigerianPhoneSchema, emptyPhoneSchema])
  .optional();

// NIN (National Identification Number) validation
// NIN is an 11-digit number issued by NIMC
const NIN_REGEX = /^\d{11}$/;
export const ninSchema = z
  .string()
  .trim()
  .regex(NIN_REGEX, "NIN must contain only numbers (11 digits)")
  .length(11, "NIN must be exactly 11 digits")
  .refine((nin) => !/^(\d)\1{10}$/.test(nin), {
    message: "NIN cannot be all the same digit",
  })
  .refine((nin) => nin !== "12345678901" && nin !== "01234567890", {
    message: "Please enter a valid NIN (sequential patterns not allowed)",
  });

// VIN (Voter Identification Number) validation - 19-20 digits
const VIN_REGEX = /^\d{19,20}$/;
export const vinSchema = z
  .string()
  .trim()
  .regex(VIN_REGEX, "Please enter a valid VIN/PVC number (19-20 digits)")
  .optional();

// Helper functions for NIN
export const isValidNIN = (nin: string): boolean => {
  return NIN_REGEX.test(nin);
};

export const formatNINForDisplay = (nin: string): string => {
  if (!nin || nin.length !== 11) {
    return nin;
  }
  return `${nin.slice(0, 5)} ${nin.slice(5, 10)} ${nin.slice(10)}`;
};

export const normalizeNINInput = (input: string): string => {
  return input.replace(/\D/g, ""); // Remove all non-digits
};

// Helper functions for phone
export const isValidNigerianPhone = (phone: string): boolean => {
  return canonicalizeNigerianPhoneInput(phone) !== null;
};

export const normalizeNigerianPhoneInput = (input: string): string => {
  return canonicalizeNigerianPhoneInput(input) ?? input.trim();
};

export const toLocalPhoneDisplay = (phone: string): string => {
  if (!phone) {
    return "";
  }

  if (!CANONICAL_NIGERIAN_PHONE_RE.test(phone)) {
    return phone;
  }

  return `0${phone.slice(4)}`;
};
