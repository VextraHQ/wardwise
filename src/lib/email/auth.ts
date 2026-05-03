import {
  buildAuthLinkEmail,
  type AuthLinkEmailType,
} from "@/lib/email/templates/auth-link";
import { readTrimmedEnv, sendEmail } from "@/lib/email/send";

export type SendAuthLinkEmailInput = {
  to: string;
  type: AuthLinkEmailType;
  name: string;
  url: string;
  expiresAt: Date;
};

export type AuthLinkEmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" };

export function canSendAuthLinkEmail(): boolean {
  const apiKey = readTrimmedEnv("RESEND_API_KEY");
  const from =
    readTrimmedEnv("EMAIL_FROM") ?? readTrimmedEnv("AUTH_FROM_EMAIL");
  return Boolean(apiKey && from);
}

export async function sendAuthLinkEmail(
  input: SendAuthLinkEmailInput,
): Promise<AuthLinkEmailResult> {
  const { subject, html, text } = await buildAuthLinkEmail({
    type: input.type,
    name: input.name,
    url: input.url,
    expiresAt: input.expiresAt,
  });

  return sendEmail({
    to: input.to,
    subject,
    html,
    text,
  });
}
