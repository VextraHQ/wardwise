import { z } from "zod";
import { emailSchema, phoneSchema } from "@/lib/schemas/common-schemas";

// Candidate position enum
export const candidatePositionSchema = z.enum([
  "President",
  "Governor",
  "Senator",
  "House of Representatives",
  "State Assembly",
]);

// Positions that require LGA (constituency-level only)
const CONSTITUENCY_POSITIONS = [
  "Senator",
  "House of Representatives",
  "State Assembly",
];

// Create Candidate Schema
export const createCandidateSchema = z
  .object({
    name: z
      .string()
      .min(2, "Candidate name must be at least 2 characters")
      .max(100, "Candidate name must not exceed 100 characters")
      .trim(),
    email: emailSchema,
    party: z
      .string()
      .min(2, "Political party must be at least 2 characters")
      .max(50, "Political party must not exceed 50 characters")
      .trim(),
    position: z.string().refine(
      (val) => {
        if (!val || val === "") return false;
        return candidatePositionSchema.safeParse(val).success;
      },
      { message: "Please select a position" },
    ),
    constituency: z
      .string()
      .min(2, "Constituency must be at least 2 characters")
      .max(200, "Constituency must not exceed 200 characters")
      .trim(),
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
    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
      .optional()
      .or(z.literal("")),
    phone: phoneSchema.optional().or(z.literal("")),
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
  .refine(
    (data) => {
      // LGA is required only for constituency-level positions
      if (data.position && CONSTITUENCY_POSITIONS.includes(data.position)) {
        return data.lga && data.lga.trim().length > 0;
      }
      return true;
    },
    {
      message: "LGA is required for this position",
      path: ["lga"],
    },
  );

// Update Candidate Schema (all fields optional except id)
export const updateCandidateSchema = z
  .object({
    id: z.string().min(1, "Candidate ID is required"),
    name: z
      .string()
      .min(2, "Candidate name must be at least 2 characters")
      .max(100, "Candidate name must not exceed 100 characters")
      .trim()
      .optional(),
    email: emailSchema.optional(),
    party: z
      .string()
      .min(2, "Political party must be at least 2 characters")
      .max(50, "Political party must not exceed 50 characters")
      .trim()
      .optional(),
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
    constituency: z
      .string()
      .min(2, "Constituency must be at least 2 characters")
      .max(200, "Constituency must not exceed 200 characters")
      .trim()
      .optional(),
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
    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
      .optional()
      .or(z.literal("")),
    phone: phoneSchema.optional().or(z.literal("")),
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
  .refine(
    (data) => {
      if (data.position && CONSTITUENCY_POSITIONS.includes(data.position)) {
        return data.lga && data.lga.trim().length > 0;
      }
      return true;
    },
    {
      message: "LGA is required for this position",
      path: ["lga"],
    },
  );

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
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .trim(),
  phone: phoneSchema,
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
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .trim()
    .optional(),
  phone: phoneSchema.optional(),
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

// Type exports
export type CreateCandidateFormValues = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateFormValues = z.infer<typeof updateCandidateSchema>;
export type CreateCanvasserFormValues = z.infer<typeof createCanvasserSchema>;
export type UpdateCanvasserFormValues = z.infer<typeof updateCanvasserSchema>;
