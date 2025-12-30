import { z } from "zod";
import {
  emailSchema,
  phoneSchema,
  ninSchema,
  vinSchema,
} from "@/lib/schemas/common-schemas";

// Re-export common schemas for backward compatibility
export {
  ninSchema,
  phoneSchema,
  vinSchema,
  emailSchema,
  formatNINForDisplay,
  normalizeNINInput,
  isValidNIN,
  isValidNigerianPhone,
  normalizeNigerianPhoneInput,
  toLocalPhoneDisplay,
} from "@/lib/schemas/common-schemas";

// Role schema
export const roleSchema = z.enum(["voter", "supporter"]);

// Basic info schema
export const basicInfoSchema = z.object({
  role: roleSchema,
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  email: emailSchema,
  gender: z.enum(["male", "female", "other"]).optional(),
  occupation: z.string().optional(),
  religion: z.string().optional(),
  age: z.number().int().min(1).max(120),
  vin: vinSchema,
});

// Location schema
export const locationSchema = z.object({
  state: z.string().min(2, "State is required"),
  lga: z.string().min(2, "LGA is required"),
  ward: z.string().min(2, "Ward is required"),
  pollingUnit: z.string().min(2, "Polling unit is required"),
});

// Candidate selection schema
export const candidateSelectionSchema = z.object({
  position: z.enum([
    "President",
    "Governor",
    "Senator",
    "House of Representatives",
    "State Assembly",
  ]),
  candidateId: z.string().min(1, "Please select a candidate"),
  candidateName: z.string().optional(),
  candidateParty: z.string().optional(),
});

// Candidate selections schema
export const candidateSelectionsSchema = z.object({
  selections: z
    .array(candidateSelectionSchema)
    .length(5, "You must select exactly 5 candidates (one for each position)"),
});

// Canvasser schema
export const canvasserSchema = z.object({
  canvasserCode: z.string().optional(),
});

// Registration schema
export const registrationSchema = z.object({
  electionYear: z.number().int(),
  nin: ninSchema,
  phone: phoneSchema,
  basic: basicInfoSchema,
  location: locationSchema,
  candidates: candidateSelectionsSchema,
  canvasser: canvasserSchema.optional(),
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
