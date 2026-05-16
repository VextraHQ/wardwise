import { z } from "zod";
import {
  nigerianPhoneSchema,
  requiredTrimmedText,
} from "@/lib/schemas/field-schemas";

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

export type CreateCanvasserFormValues = z.infer<typeof createCanvasserSchema>;
export type UpdateCanvasserFormValues = z.infer<typeof updateCanvasserSchema>;
