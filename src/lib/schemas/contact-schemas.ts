import { z } from "zod";
import { contactReasonValues } from "@/lib/contact/reasons";
import { emailSchema, requiredTrimmedText } from "@/lib/schemas/field-schemas";

const honeypotSchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().max(200, "Invalid value"));

const turnstileTokenSchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().max(2048, "Invalid verification token"));

const reasonDetailsSchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().max(120, "Please keep reason details under 120 characters"));

export const contactFormSchema = z
  .object({
    name: requiredTrimmedText({ min: 2, max: 100, label: "Name" }),
    email: emailSchema,
    reason: z.enum(contactReasonValues, {
      message: "Please select a reason",
    }),
    reasonDetails: reasonDetailsSchema,
    message: requiredTrimmedText({
      min: 10,
      max: 4000,
      label: "Message",
    }),
    website: honeypotSchema,
    turnstileToken: turnstileTokenSchema,
  })
  .superRefine((data, ctx) => {
    if (data.reason === "other" && data.reasonDetails.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reasonDetails"],
        message: "Tell us what this request is about",
      });
    }
  });

export type ContactFormValues = z.infer<typeof contactFormSchema>;
