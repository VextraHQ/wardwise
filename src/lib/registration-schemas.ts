import { z } from "zod";

// NIN (National Identification Number) validation
// NIN is an 11-digit number issued by NIMC
const NIN_REGEX = /^\d{11}$/;

const NIN_ERROR_MESSAGE = "Please enter a valid 11-digit NIN";

export const ninSchema = z
  .string()
  .trim()
  .regex(NIN_REGEX, NIN_ERROR_MESSAGE)
  .length(11, "NIN must be exactly 11 digits");

// Helper function to validate NIN (for use in components)
export const isValidNIN = (nin: string): boolean => {
  return NIN_REGEX.test(nin);
};

// Helper function to get NIN validation error message
export const getNINValidationMessage = (): string => {
  return NIN_ERROR_MESSAGE;
};

// Format NIN for display (add spaces for readability: 12345 67890 1)
export const formatNINForDisplay = (nin: string): string => {
  if (!nin || nin.length !== 11) {
    return nin;
  }

  return `${nin.slice(0, 5)} ${nin.slice(5, 10)} ${nin.slice(10)}`;
};

// Remove formatting from NIN input
export const normalizeNINInput = (input: string): string => {
  return input.replace(/\D/g, ""); // Remove all non-digits
};

// Nigerian mobile numbers follow the pattern: 0 + 3-digit prefix + 7 digits
// Valid prefixes are generally in ranges: 7xx, 8xx, 9xx
// We'll use a more flexible approach that accepts common ranges
const PHONE_REGEX = /^\+234(7\d{2}|8\d{2}|9\d{2})\d{7}$/u;

const PHONE_ERROR_MESSAGE =
  "Enter a valid Nigerian mobile number (e.g., 08031234567 or +2348031234567)";

export const phoneSchema = z
  .string()
  .trim()
  .regex(PHONE_REGEX, PHONE_ERROR_MESSAGE)
  .optional(); // Phone is now optional

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
  dateOfBirth: z.string().min(1, "Date of birth is required"),
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
  surveyId: z.string().min(1),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export const registrationSchema = z.object({
  electionYear: z.number().int(),
  nin: ninSchema,
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
  const nin = payload.nin || "";
  const firstName = payload.basic?.firstName || "";
  const lastName = payload.basic?.lastName || "";

  // Create a deterministic hash from user data
  const dataString = `${nin}-${firstName}-${lastName}-${year}`;
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
