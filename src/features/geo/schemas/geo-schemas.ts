import { z } from "zod";
import { nigeriaStates } from "@/features/geo/data/state-lga-locations";

const validStateCodes = nigeriaStates.map((s) => s.code);

export const createLgaSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .transform((v) => v.trim()),
  stateCode: z
    .string()
    .min(1, "State is required")
    .refine((v) => validStateCodes.includes(v), "Invalid state code"),
});

export const updateLgaSchema = createLgaSchema.partial();

export const createWardSchema = z.object({
  code: z
    .string()
    .trim()
    .transform((v) => v || undefined)
    .optional(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .transform((v) => v.trim()),
  lgaId: z.number({ message: "LGA is required" }).min(1, "LGA is required"),
});

export const updateWardSchema = z.object({
  code: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (v === null) return null;
      const trimmed = v.trim();
      return trimmed.length > 0 ? trimmed : null;
    }),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .transform((v) => v.trim())
    .optional(),
});

export const createPollingUnitSchema = z.object({
  code: z
    .string()
    .min(1, "INEC Code is required")
    .transform((v) => v.trim()),
  name: z
    .string()
    .transform((v) => v.trim())
    .default(""),
  wardId: z.number({ message: "Ward is required" }).min(1, "Ward is required"),
});

export const updatePollingUnitSchema = createPollingUnitSchema.partial();

/** @keep Not used yet. Kept for future features (knip skips @keep). */
export type CreateLgaData = z.infer<typeof createLgaSchema>;
/** @keep Not used yet. Kept for future features (knip skips @keep). */
export type UpdateLgaData = z.infer<typeof updateLgaSchema>;
/** @keep Not used yet. Kept for future features (knip skips @keep). */
export type CreateWardData = z.infer<typeof createWardSchema>;
/** @keep Not used yet. Kept for future features (knip skips @keep). */
export type UpdateWardData = z.infer<typeof updateWardSchema>;
/** @keep Not used yet. Kept for future features (knip skips @keep). */
export type CreatePollingUnitData = z.infer<typeof createPollingUnitSchema>;
/** @keep Not used yet. Kept for future features (knip skips @keep). */
export type UpdatePollingUnitData = z.infer<typeof updatePollingUnitSchema>;
