import { readTrimmedEnv, sendEmail } from "@/lib/email/send";
import {
  buildRegistrationReceiptEmail,
  type RegistrationReceiptEmailInput,
} from "@/lib/email/templates/registration-receipt";

export type SendReceiptResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "no_email" };

export function canSendRegistrationReceipt(): boolean {
  const apiKey = readTrimmedEnv("RESEND_API_KEY");
  const from =
    readTrimmedEnv("EMAIL_FROM") ?? readTrimmedEnv("AUTH_FROM_EMAIL");
  return Boolean(apiKey && from);
}

export async function sendRegistrationReceipt(
  to: string,
  input: RegistrationReceiptEmailInput,
): Promise<SendReceiptResult> {
  if (!to) return { sent: false, reason: "no_email" };

  const { subject, html, text } = await buildRegistrationReceiptEmail(input);

  const result = await sendEmail({ to, subject, html, text });
  return result;
}
