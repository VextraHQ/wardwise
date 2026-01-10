import { z } from "zod";
import {
  phoneSchema,
  vinSchema,
  emailSchema,
  ninSchema,
} from "@/lib/schemas/common-schemas";

// Profile form schema (used in profile step during registration)
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

// Profile edit schema (less strict - allows optional fields for partial updates)
export const profileEditSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(
      /^(\+234|0)?[789]\d{9}$/,
      "Please enter a valid Nigerian phone number",
    )
    .optional()
    .or(z.literal("")),
  occupation: z.string().optional(),
});

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

// NIN form schema (used in NIN entry step)
export const ninFormSchema = z.object({
  nin: ninSchema,
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type NinFormValues = z.infer<typeof ninFormSchema>;

// Support request schema (used in edit profile support form)
export const supportRequestSchema = z.object({
  reason: z
    .string()
    .min(10, "Please provide more detail about your request")
    .max(500, "Please keep your request under 500 characters"),
  type: z
    .enum(["contact_change", "name_correction", "location_change", "other"])
    .optional(),
});

export type SupportRequestFormValues = z.infer<typeof supportRequestSchema>;
