import { z } from "zod";
import {
  emailSchema,
  nigerianPhoneSchema,
  optionalNigerianPhoneSchema,
  optionalNullableTrimmedText,
  requiredTrimmedText,
} from "@/lib/schemas/field-schemas";
import { getPositionStateValidationMessage } from "@/lib/geo/constituency";

// Candidate position enum
export const candidatePositionSchema = z.enum([
  "President",
  "Governor",
  "Senator",
  "House of Representatives",
  "State Assembly",
]);

// Create Candidate Schema
export const createCandidateSchema = z
  .object({
    name: requiredTrimmedText({ min: 2, max: 100, label: "Candidate name" }),
    email: emailSchema,
    party: requiredTrimmedText({ min: 2, max: 50, label: "Political party" }),
    position: z.string().refine(
      (val) => {
        if (!val || val === "") return false;
        return candidatePositionSchema.safeParse(val).success;
      },
      { message: "Please select a position" },
    ),
    constituency: requiredTrimmedText({
      min: 2,
      max: 200,
      label: "Constituency",
    }),
    stateCode: z
      .string()
      .max(5, "State code must not exceed 5 characters")
      .optional()
      .or(z.literal("")),
    lga: z
      .string()
      .max(100, "LGA must not exceed 100 characters")
      .optional()
      .or(z.literal("")),
    constituencyLgaIds: z.array(z.number()),
    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
      .optional()
      .or(z.literal("")),
    phone: optionalNigerianPhoneSchema,
    title: z
      .string()
      .max(50, "Title must not exceed 50 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // State is required for all positions except President
      if (data.position && data.position !== "President") {
        return data.stateCode && data.stateCode.trim().length > 0;
      }
      return true;
    },
    {
      message: "State is required for this position",
      path: ["stateCode"],
    },
  )
  .superRefine((data, ctx) => {
    const message = getPositionStateValidationMessage(
      data.position,
      data.stateCode,
    );
    if (message) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stateCode"],
        message,
      });
    }
  });
// Update Candidate Schema (all fields optional except id)
export const updateCandidateSchema = z
  .object({
    id: z.string().min(1, "Candidate ID is required"),
    name: requiredTrimmedText({
      min: 2,
      max: 100,
      label: "Candidate name",
    }).optional(),
    email: emailSchema.optional(),
    party: requiredTrimmedText({
      min: 2,
      max: 50,
      label: "Political party",
    }).optional(),
    position: z
      .string()
      .refine(
        (val) => {
          if (!val || val === "") return false;
          return candidatePositionSchema.safeParse(val).success;
        },
        { message: "Please select a position" },
      )
      .optional(),
    constituency: requiredTrimmedText({
      min: 2,
      max: 200,
      label: "Constituency",
    }).optional(),
    stateCode: z
      .string()
      .max(5, "State code must not exceed 5 characters")
      .optional()
      .or(z.literal("")),
    lga: z
      .string()
      .max(100, "LGA must not exceed 100 characters")
      .optional()
      .or(z.literal("")),
    constituencyLgaIds: z.array(z.number()).optional(),
    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
      .optional()
      .or(z.literal("")),
    phone: optionalNigerianPhoneSchema,
    title: z
      .string()
      .max(50, "Title must not exceed 50 characters")
      .optional()
      .or(z.literal("")),
    onboardingStatus: z
      .enum(["pending", "credentials_sent", "active", "suspended"])
      .optional(),
  })
  .refine(
    (data) => {
      if (data.position && data.position !== "President") {
        return data.stateCode && data.stateCode.trim().length > 0;
      }
      return true;
    },
    {
      message: "State is required for this position",
      path: ["stateCode"],
    },
  )
  .superRefine((data, ctx) => {
    if (!data.position) return;
    const message = getPositionStateValidationMessage(
      data.position,
      data.stateCode,
    );
    if (message) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stateCode"],
        message,
      });
    }
  });

export const deleteCandidateSchema = z.object({
  confirmationEmail: emailSchema,
});

// Create Canvasser Schema
export const createCanvasserSchema = z.object({
  code: z
    .string()
    .min(2, "Canvasser code must be at least 2 characters")
    .max(20, "Canvasser code must not exceed 20 characters")
    .trim()
    .regex(
      /^[A-Z0-9-]+$/,
      "Canvasser code must contain only uppercase letters, numbers, and hyphens",
    ),
  name: requiredTrimmedText({ min: 2, max: 100, label: "Full name" }),
  phone: nigerianPhoneSchema,
  candidateId: z.string().min(1, "Please select a candidate"),
  ward: z
    .string()
    .max(100, "Ward must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  lga: z
    .string()
    .max(100, "LGA must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  state: z
    .string()
    .max(100, "State must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
});

// Update Canvasser Schema (all fields optional except id)
export const updateCanvasserSchema = z.object({
  id: z.string().min(1, "Canvasser ID is required"),
  code: z
    .string()
    .min(2, "Canvasser code must be at least 2 characters")
    .max(20, "Canvasser code must not exceed 20 characters")
    .trim()
    .regex(
      /^[A-Z0-9-]+$/,
      "Canvasser code must contain only uppercase letters, numbers, and hyphens",
    )
    .optional(),
  name: requiredTrimmedText({
    min: 2,
    max: 100,
    label: "Full name",
  }).optional(),
  phone: nigerianPhoneSchema.optional(),
  candidateId: z.string().min(1, "Please select a candidate").optional(),
  ward: z
    .string()
    .max(100, "Ward must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  lga: z
    .string()
    .max(100, "LGA must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  state: z
    .string()
    .max(100, "State must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
});

// Update Submission Schema (admin moderation PATCH)
export const updateSubmissionSchema = z.object({
  isFlagged: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  adminNotes: optionalNullableTrimmedText({ max: 2000 }),
});

// Type exports
export type UpdateSubmissionValues = z.infer<typeof updateSubmissionSchema>;
export type CreateCandidateFormValues = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateFormValues = z.infer<typeof updateCandidateSchema>;
export type CreateCanvasserFormValues = z.infer<typeof createCanvasserSchema>;
export type UpdateCanvasserFormValues = z.infer<typeof updateCanvasserSchema>;
