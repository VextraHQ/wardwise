import { z } from "zod";

// Nigerian mobile numbers follow the pattern: 0 + 3-digit prefix + 7 digits
// Valid prefixes are generally in ranges: 7xx, 8xx, 9xx
// We'll use a more flexible approach that accepts common ranges
const PHONE_REGEX = /^\+234(7\d{2}|8\d{2}|9\d{2})\d{7}$/u;

const PHONE_ERROR_MESSAGE =
  "Enter a valid Nigerian mobile number (e.g., 08031234567 or +2348031234567)";

export const phoneSchema = z
  .string()
  .trim()
  .regex(PHONE_REGEX, PHONE_ERROR_MESSAGE);

// Helper function to validate phone numbers (for use in components)
export const isValidNigerianPhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

// Helper function to get phone validation error message
export const getPhoneValidationMessage = (): string => {
  return PHONE_ERROR_MESSAGE;
};

// Normalize any user input into +234 format
// Nigerian numbers: 0 + 3-digit prefix + 7 digits = 11 digits total
// International: +234 + 3-digit prefix + 7 digits = 10 digits after +234
export const normalizeNigerianPhoneInput = (input: string): string => {
  const digits = input.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  // Already has 234 country code
  if (digits.startsWith("234")) {
    const localPart = digits.slice(3, 13); // Take exactly 10 digits after 234
    return localPart ? `+234${localPart}` : "";
  }

  // Local format starting with 0 (e.g., 08031234567)
  if (digits.startsWith("0")) {
    const localPart = digits.slice(1, 11); // Remove 0, take next 10 digits
    return localPart ? `+234${localPart}` : "";
  }

  // Assume it's missing the 0 prefix (e.g., 8031234567)
  const localPart = digits.slice(0, 10);
  return localPart ? `+234${localPart}` : "";
};

// Convert +234 number back to local display (080...) for inputs
export const toLocalPhoneDisplay = (phone: string): string => {
  if (!phone) {
    return "";
  }

  if (!phone.startsWith("+234")) {
    return phone;
  }

  const digits = phone.slice(4);
  if (digits.length >= 10) {
    return `0${digits.slice(-10)}`;
  }

  return phone;
};

export const basicInfoSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  gender: z.enum(["male", "female", "other"]).optional(),
  age: z.number().int().min(18).max(120),
});

export const locationSchema = z.object({
  state: z.string().min(2),
  lga: z.string().min(2),
  ward: z.string().min(2),
  pollingUnit: z.string().min(2),
});

export const candidateSchema = z.object({
  candidateId: z.string().min(1),
});

export const surveySchema = z.object({
  priorities: z.array(z.string()).min(1),
  comments: z.string().max(500).optional(),
});

export const registrationSchema = z.object({
  electionYear: z.number().int(),
  phone: phoneSchema,
  basic: basicInfoSchema,
  location: locationSchema,
  candidate: candidateSchema,
  survey: surveySchema,
  registrationId: z.string().optional(),
});

export type RegistrationPayload = z.infer<typeof registrationSchema>;

// Generate a stable registration ID based on user data
export const generateRegistrationId = (
  payload: Partial<RegistrationPayload>,
): string => {
  const year = payload.electionYear || new Date().getFullYear();
  const phone = payload.phone || "";
  const firstName = payload.basic?.firstName || "";
  const lastName = payload.basic?.lastName || "";

  // Create a deterministic hash from user data
  const dataString = `${phone}-${firstName}-${lastName}-${year}`;
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to positive number and create alphanumeric string
  const positiveHash = Math.abs(hash);
  const base36 = positiveHash.toString(36).toUpperCase();

  // Pad with zeros and take first 6 characters
  const paddedHash = base36.padStart(6, "0").slice(0, 6);

  return `REG-${year}-${paddedHash}`;
};
