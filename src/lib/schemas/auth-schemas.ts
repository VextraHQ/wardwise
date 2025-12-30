import { z } from "zod";
import { emailSchema } from "@/lib/schemas/common-schemas";

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
