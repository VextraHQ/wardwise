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

// Optional email: blank stays "" (not undefined). The Collect form round-trips
// empty strings from react-hook-form, and the submit route converts
// `data.email || null` at the DB boundary. Non-blank values are trimmed and
// lowercased before validation.
export const optionalEmailSchema = z
  .string()
  .optional()
  .transform((v) => (v ?? "").trim().toLowerCase())
  .pipe(
    z.union([
      z.literal(""),
      z.string().email("Please enter a valid email address"),
    ]),
  );

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

const emptyPhoneSchema = z
  .string()
  .transform((input) => input.trim())
  .pipe(z.literal(""));

export const optionalNigerianPhoneSchema = z
  .union([nigerianPhoneSchema, emptyPhoneSchema])
  .optional();

// NIN (National Identification Number): 11-digit number issued by NIMC.
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

// Voter ID / VIN per INEC spec: exactly 19 alphanumeric characters, uppercased.
export const voterIdVinSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine(
    (v) => /^[A-Z0-9]{19}$/.test(v),
    "VIN must be exactly 19 alphanumeric characters",
  );

// APC-or-NIN hybrid validator used on the Collect form.
// - Exactly 11 digits → validated as NIN (reject all-same-digit and sequential dummies)
// - Otherwise → min 5 chars, alphanumeric with optional "/" or "-" (APC format)
const APC_REGEX = /^[A-Za-z0-9/-]+$/;
export const apcOrNinSchema = z
  .string()
  .trim()
  .min(1, "APC Registration Number or NIN is required")
  .refine((val) => {
    if (NIN_REGEX.test(val)) {
      if (/^(\d)\1{10}$/.test(val)) return false;
      if (val === "12345678901" || val === "01234567890") return false;
      return true;
    }
    return val.length >= 5 && APC_REGEX.test(val);
  }, "Enter a valid NIN (11 digits) or APC number (min 5 chars, alphanumeric)");

// Trimmed text helpers — shared primitives for Collect and admin inputs.
// Trim happens BEFORE min/max so whitespace-only input cannot satisfy min.
export function requiredTrimmedText({
  min = 1,
  max,
  label,
}: {
  min?: number;
  max: number;
  label: string;
}) {
  const minMessage =
    min <= 1
      ? `${label} is required`
      : `${label} must be at least ${min} characters`;
  return z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(min, minMessage)
        .max(max, `${label} must not exceed ${max} characters`),
    );
}

// Optional trimmed text: blank stays "".
export function optionalTrimmedText({ max }: { max: number }) {
  return z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().max(max, `Must not exceed ${max} characters`))
    .optional();
}

// Optional trimmed text that normalizes blank/whitespace to null, so the DB
// column doesn't accumulate "" vs null drift. Missing field stays undefined so
// PATCH routes can distinguish "not sent" from "sent blank".
export function optionalNullableTrimmedText({ max }: { max: number }) {
  return z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (v === null) return null;
      const trimmed = v.trim();
      return trimmed === "" ? null : trimmed;
    })
    .pipe(
      z
        .union([
          z.string().max(max, `Must not exceed ${max} characters`),
          z.null(),
        ])
        .optional(),
    );
}

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
