import { z } from "zod";
import { emailSchema, phoneSchema } from "@/lib/schemas/common-schemas";

// Candidate position enum
export const candidatePositionSchema = z.enum([
  "Governor",
  "Senator",
  "House of Representatives",
  "State Assembly",
]);

// Create Candidate Schema
export const createCandidateSchema = z.object({
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
    {
      message: "Please select a position",
    },
  ),
  constituency: z
    .string()
    .min(2, "Constituency must be at least 2 characters")
    .max(200, "Constituency must not exceed 200 characters")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});

// Update Candidate Schema (all fields optional except id)
export const updateCandidateSchema = z.object({
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
      {
        message: "Please select a position",
      },
    )
    .optional(),
  constituency: z
    .string()
    .min(2, "Constituency must be at least 2 characters")
    .max(200, "Constituency must not exceed 200 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .or(z.literal("")),
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
