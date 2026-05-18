import { z } from "zod";
import {
  nigerianPhoneSchema,
  ninSchema,
  optionalEmailSchema,
  optionalNigerianPhoneSchema,
  optionalNullableTrimmedText,
  optionalTrimmedText,
  partyMembershipNumberSchema,
  requiredTrimmedText,
  voterIdVinSchema,
} from "@/lib/schemas/field-schemas";
import {
  campaignBrandingTypes,
  normalizeCampaignDisplayName,
} from "@/features/collect/lib/branding";

export const collectIdentityTypes = ["membership", "nin"] as const;
export type CollectIdentityType = (typeof collectIdentityTypes)[number];

function addSchemaIssue(
  ctx: z.RefinementCtx,
  path: (string | number)[],
  message: string,
) {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path,
    message,
  });
}

function validateIdentityValue(value: string, identityType: CollectIdentityType) {
  if (identityType === "nin") {
    return ninSchema.safeParse(value);
  }
  return partyMembershipNumberSchema.safeParse(value);
}

function normalizeIdentityValue(
  value: string,
  identityType: CollectIdentityType,
) {
  if (identityType === "nin") {
    return ninSchema.parse(value);
  }
  return partyMembershipNumberSchema.parse(value);
}

const clientIdentityTypeSchema = z.enum(collectIdentityTypes, {
  message: "Choose a verification method",
});

const baseIdentityFieldSchema = z
  .string()
  .transform((v) => v.trim())
  .pipe(z.string().min(1, "Enter your membership number or NIN"));

// Screen 1: Personal details
export const screen1Schema = z.object({
  firstName: requiredTrimmedText({ min: 2, max: 100, label: "First name" }),
  middleName: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => v?.trim() || ""),
  lastName: requiredTrimmedText({ min: 2, max: 100, label: "Last name" }),
  phone: nigerianPhoneSchema,
  email: optionalEmailSchema,
  sex: z.enum(["male", "female"], { message: "Please select your sex" }),
  age: z
    .number({
      message: "Please enter your age",
    })
    .min(18, "Must be at least 18 years old")
    .max(120, "Invalid age"),
  occupation: requiredTrimmedText({ max: 100, label: "Occupation" }),
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

// Screen 3: Identity & verification — choose either party membership number
// or NIN, plus VIN for deduplication.
export const screen3Schema = z.object({
  identityType: clientIdentityTypeSchema,
  identityValue: baseIdentityFieldSchema,
  voterIdNumber: voterIdVinSchema,
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
  canvasserPhone: optionalNigerianPhoneSchema,
});

// Custom questions
export const customQuestionsSchema = z.object({
  customAnswer1: optionalTrimmedText({ max: 500 }),
  customAnswer2: optionalTrimmedText({ max: 500 }),
});

// Full submission schema (merge of all screens)
export const submitRegistrationSchema = screen1Schema
  .merge(screen2Schema)
  .merge(screen3Schema)
  .merge(screen4Schema)
  .merge(screen5Schema)
  .merge(customQuestionsSchema)
  .superRefine((data, ctx) => {
    const result = validateIdentityValue(data.identityValue, data.identityType);
    if (!result.success) {
      addSchemaIssue(
        ctx,
        ["identityValue"],
        result.error.issues[0]?.message ||
          "Enter a valid identification number",
      );
    }
  });

export type RegistrationFormData = z.input<typeof submitRegistrationSchema>;

// ── Admin: Campaign schemas (single source of truth) ──

export const createCampaignSchema = z
  .object({
    candidateId: z.string().min(1, "Select a candidate"),
    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .max(60, "Slug too long")
      .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
    brandingType: z.enum(campaignBrandingTypes),
    displayName: z
      .string()
      .max(120, "Public campaign name must not exceed 120 characters")
      .nullish()
      .or(z.literal("")),
    enabledLgaIds: z.array(z.number()),
    customQuestion1: optionalNullableTrimmedText({ max: 200 }),
    customQuestion2: optionalNullableTrimmedText({ max: 200 }),
  })
  .superRefine((data, ctx) => {
    if (
      data.brandingType !== "candidate" &&
      !normalizeCampaignDisplayName(data.displayName)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["displayName"],
        message: "Enter a public campaign name for movement or team branding",
      });
    }
  });

export type CreateCampaignData = z.infer<typeof createCampaignSchema>;

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  status: z.enum(["draft", "active", "paused", "closed"]).optional(),
  clientReportEnabled: z.boolean().optional(),
});

export type UpdateCampaignData = z.infer<typeof updateCampaignSchema>;

// ── Admin: Add canvasser to campaign (mirrors server-side schema) ──

export const addCampaignCanvasserSchema = z.object({
  name: requiredTrimmedText({ max: 100, label: "Name" }),
  phone: nigerianPhoneSchema,
  zone: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => v?.trim() || ""),
});

export type AddCampaignCanvasserData = z.infer<
  typeof addCampaignCanvasserSchema
>;

// ── Public: Offline geo-pack request ──
// Cap of 50 LGAs covers any single Nigerian state (Kano = 44) and keeps the
// response near 1–1.5 MB gzipped.
export const offlinePackRequestSchema = z.object({
  campaignSlug: z.string().min(1, "campaignSlug is required"),
  lgaIds: z
    .array(z.number().int().positive())
    .min(1, "Select at least one LGA")
    .max(50, "Cannot prepare more than 50 LGAs at once"),
});

export type OfflinePackRequest = z.infer<typeof offlinePackRequestSchema>;

// ── Server submit schema (extends client schema with campaignSlug, drops client-only name fields) ──

const serverIdentitySchema = z.object({
  identityType: clientIdentityTypeSchema,
  identityValue: baseIdentityFieldSchema,
  voterIdNumber: voterIdVinSchema,
});

export const serverSubmitSchema = screen1Schema
  .merge(
    screen2Schema.omit({
      lgaName: true,
      wardName: true,
      pollingUnitName: true,
    }),
  )
  .merge(serverIdentitySchema)
  .merge(screen4Schema)
  .merge(screen5Schema)
  .merge(customQuestionsSchema)
  .extend({
    campaignSlug: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    const result = validateIdentityValue(data.identityValue, data.identityType);
    if (!result.success) {
      addSchemaIssue(
        ctx,
        ["identityValue"],
        result.error.issues[0]?.message ||
          "Enter a valid identification number",
      );
    }
  })
  .transform((data) => ({
    ...data,
    identityValue: normalizeIdentityValue(data.identityValue, data.identityType),
  }));

// ── Admin submission moderation (PATCH) ──
// Used by admin Collect submission detail + bulk routes.
export const updateSubmissionSchema = z.object({
  isFlagged: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  adminNotes: optionalNullableTrimmedText({ max: 2000 }),
});

export type UpdateSubmissionValues = z.infer<typeof updateSubmissionSchema>;
