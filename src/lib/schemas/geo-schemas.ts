import { z } from "zod";
import { nigeriaStates } from "@/lib/data/state-lga-locations";

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
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .transform((v) => v.trim()),
  lgaId: z.number().min(1, "LGA is required"),
});

export const updateWardSchema = createWardSchema.partial();

export const createPollingUnitSchema = z.object({
  code: z
    .string()
    .min(1, "INEC Code is required")
    .transform((v) => v.trim()),
  name: z
    .string()
    .transform((v) => v.trim())
    .default(""),
  wardId: z.number().min(1, "Ward is required"),
});

export const updatePollingUnitSchema = createPollingUnitSchema.partial();

export type CreateLgaData = z.infer<typeof createLgaSchema>;
export type UpdateLgaData = z.infer<typeof updateLgaSchema>;
export type CreateWardData = z.infer<typeof createWardSchema>;
export type UpdateWardData = z.infer<typeof updateWardSchema>;
export type CreatePollingUnitData = z.infer<typeof createPollingUnitSchema>;
export type UpdatePollingUnitData = z.infer<typeof updatePollingUnitSchema>;
