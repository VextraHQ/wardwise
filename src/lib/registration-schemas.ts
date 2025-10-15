import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+234\d{10}$/u, "Use Nigerian format e.g. +2348012345678");

export const basicInfoSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
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
  priorities: z.array(z.string()).min(1),
  comments: z.string().max(500).optional(),
});

export const registrationSchema = z.object({
  electionYear: z.number().int(),
  phone: phoneSchema,
  basic: basicInfoSchema,
  location: locationSchema,
  candidate: candidateSchema,
  survey: surveySchema,
});

export type RegistrationPayload = z.infer<typeof registrationSchema>;
