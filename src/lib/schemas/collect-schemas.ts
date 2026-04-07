import { z } from "zod";
import {
  phoneSchema,
  normalizeNigerianPhoneInput,
} from "@/lib/schemas/common-schemas";

// ── VIN regex (INEC standard: 19 alphanumeric characters) ──
const vinRegex = /^[A-Za-z0-9]{19}$/;

// Screen 1: Personal details
export const screen1Schema = z.object({
  firstName: z
    .string()
    .min(2, "First name is required")
    .transform((v) => v.trim()),
  middleName: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => v?.trim() || ""),
  lastName: z
    .string()
    .min(2, "Last name is required")
    .transform((v) => v.trim()),
  phone: phoneSchema.transform(normalizeNigerianPhoneInput),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  sex: z.enum(["male", "female"], { message: "Please select your sex" }),
  age: z
    .number({
      message: "Please enter your age",
    })
    .min(18, "Must be at least 18 years old")
    .max(120, "Invalid age"),
  occupation: z
    .string()
    .min(1, "Occupation is required")
    .transform((v) => v.trim()),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"], {
    message: "Select marital status",
  }),
});

// Screen 2: Location
export const screen2Schema = z.object({
  lgaId: z.number({ message: "Select your LGA" }).min(1, "Select your LGA"),
  lgaName: z.string().min(1),
  wardId: z.number({ message: "Select your ward" }).min(1, "Select your ward"),
  wardName: z.string().min(1),
  pollingUnitId: z
    .number({ message: "Select your polling unit" })
    .min(1, "Select your polling unit"),
  pollingUnitName: z.string().min(1),
});

// NIN: exactly 11 digits
const ninRegex = /^\d{11}$/;
// APC membership numbers are alphanumeric
const apcRegex = /^[A-Za-z0-9/\-]+$/;

// Stricter APC/NIN validation:
// - If exactly 11 digits → validate as NIN (reject all-same-digit, reject sequential)
// - Otherwise → validate as APC number (min 5 chars, alphanumeric with optional / and -)
function validateApcOrNin(val: string): boolean {
  if (ninRegex.test(val)) {
    // It's 11 digits — validate as NIN
    if (/^(\d)\1{10}$/.test(val)) return false; // all same digit
    if (val === "12345678901" || val === "01234567890") return false; // sequential
    return true;
  }
  // Validate as APC number
  return val.length >= 5 && apcRegex.test(val);
}

// Screen 3: Party info — APC/NIN and VIN are both required
export const screen3Schema = z.object({
  apcRegNumber: z
    .string()
    .min(1, "APC Registration Number or NIN is required")
    .refine(
      validateApcOrNin,
      "Enter a valid NIN (11 digits) or APC number (min 5 chars, alphanumeric)",
    ),
  voterIdNumber: z
    .string()
    .min(1, "Voter ID (VIN) is required")
    .transform((val) => val.toUpperCase())
    .refine(
      (val) => vinRegex.test(val),
      "VIN must be exactly 19 alphanumeric characters",
    ),
});

// Screen 4: Role
export const screen4Schema = z.object({
  role: z.enum(["volunteer", "member", "canvasser"], {
    message: "Please select a role",
  }),
});

// Screen 5: Canvasser attribution
export const screen5Schema = z.object({
  canvasserName: z
    .string()
    .transform((v) => v?.trim() || "")
    .optional()
    .or(z.literal("")),
  canvasserPhone: z
    .string()
    .transform((v) => v?.trim() || "")
    .optional()
    .or(z.literal("")),
});

// Custom questions
export const customQuestionsSchema = z.object({
  customAnswer1: z.string().optional().or(z.literal("")),
  customAnswer2: z.string().optional().or(z.literal("")),
});

// Full submission schema (merge of all screens)
export const submitRegistrationSchema = screen1Schema
  .merge(screen2Schema)
  .merge(screen3Schema)
  .merge(screen4Schema)
  .merge(screen5Schema)
  .merge(customQuestionsSchema);

export type RegistrationFormData = {
  firstName: string;
  middleName?: string | undefined;
  lastName: string;
  phone: string;
  email?: string | undefined;
  sex: "male" | "female";
  age: number;
  occupation: string;
  maritalStatus: "single" | "married" | "divorced" | "widowed";
  lgaId: number;
  lgaName: string;
  wardId: number;
  wardName: string;
  pollingUnitId: number;
  pollingUnitName: string;
  apcRegNumber: string;
  voterIdNumber: string;
  role: "volunteer" | "member" | "canvasser";
  canvasserName?: string | undefined;
  canvasserPhone?: string | undefined;
  customAnswer1?: string | undefined;
  customAnswer2?: string | undefined;
};

// ── Admin: Campaign schemas (single source of truth) ──

export const createCampaignSchema = z.object({
  candidateId: z.string().min(1, "Select a candidate"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(60, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  enabledLgaIds: z.array(z.number()),
  customQuestion1: z.string().nullish().or(z.literal("")),
  customQuestion2: z.string().nullish().or(z.literal("")),
});

export type CreateCampaignData = z.infer<typeof createCampaignSchema>;

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  status: z.enum(["draft", "active", "paused", "closed"]).optional(),
});

export type UpdateCampaignData = z.infer<typeof updateCampaignSchema>;

// ── Admin: Add canvasser to campaign (mirrors server-side schema) ──

export const addCampaignCanvasserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .transform((v) => v.trim()),
  phone: phoneSchema.transform(normalizeNigerianPhoneInput),
  zone: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => v?.trim() || ""),
});

export type AddCampaignCanvasserData = z.infer<
  typeof addCampaignCanvasserSchema
>;

// ── Server submit schema (extends client schema with campaignSlug, drops client-only name fields) ──

export const serverSubmitSchema = submitRegistrationSchema
  .omit({ lgaName: true, wardName: true, pollingUnitName: true })
  .extend({
    campaignSlug: z.string().min(1),
  });
