import { z } from "zod";
import { emailSchema, requiredTrimmedText } from "@/lib/schemas/field-schemas";
import { passwordPolicySchema } from "@/features/auth/schemas/auth-schemas";

// Update Admin Profile Schema
export const updateAdminProfileSchema = z.object({
  name: requiredTrimmedText({ min: 2, max: 120, label: "Name" }),
});

// Request Admin Email Change Schema
export const requestAdminEmailChangeSchema = z.object({
  newEmail: emailSchema,
  currentPassword: z.string().min(1, "Current password is required"),
});

// Change Admin Password Schema
export const changeAdminPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordPolicySchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ["newPassword"],
    message: "New password must be different from your current password",
  });

export type UpdateAdminProfileFormValues = z.infer<
  typeof updateAdminProfileSchema
>;
export type RequestAdminEmailChangeFormValues = z.infer<
  typeof requestAdminEmailChangeSchema
>;
export type ChangeAdminPasswordFormValues = z.infer<
  typeof changeAdminPasswordSchema
>;
