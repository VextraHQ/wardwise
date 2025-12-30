import { z } from "zod";
import {
  phoneSchema,
  vinSchema,
  emailSchema,
  ninSchema,
} from "@/lib/schemas/common-schemas";

// Profile form schema (used in profile step)
export const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: emailSchema,
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  age: z.number().int().min(1).max(120),
  gender: z.enum(["male", "female", "other"], {
    message: "Please select your gender",
  }),
  occupation: z.string().min(1, "Please select your occupation"),
  religion: z.string().min(1, "Please select your religion"),
  phoneNumber: phoneSchema,
  vin: vinSchema.or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// NIN form schema (used in NIN entry step)
export const ninFormSchema = z.object({
  nin: ninSchema,
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type NinFormValues = z.infer<typeof ninFormSchema>;
