import {
  buildAuthLinkEmail,
  type AuthLinkEmailType,
} from "@/lib/email/templates/auth-link";
import { buildAdminEmailChangeEmail } from "@/lib/email/templates/admin-email-change";
import { buildAdminEmailChangeNoticeEmail } from "@/lib/email/templates/admin-email-change-notice";
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

export type SendAdminEmailChangeEmailInput = {
  to: string;
  name: string;
  url: string;
  targetEmail: string;
  expiresAt: Date;
  requestedAt: Date;
  requestIp?: string | null;
  userAgent?: string | null;
};

export async function sendAdminEmailChangeEmail(
  input: SendAdminEmailChangeEmailInput,
): Promise<AuthLinkEmailResult> {
  const { subject, html, text } = await buildAdminEmailChangeEmail({
    name: input.name,
    url: input.url,
    targetEmail: input.targetEmail,
    expiresAt: input.expiresAt,
    requestedAt: input.requestedAt,
    requestIp: input.requestIp,
    userAgent: input.userAgent,
  });

  return sendEmail({
    to: input.to,
    subject,
    html,
    text,
  });
}

export type SendAdminEmailChangeNoticeEmailInput = {
  to: string;
  name: string;
  currentEmail: string;
  targetEmail: string;
  requestedAt: Date;
  requestIp?: string | null;
  userAgent?: string | null;
};

export async function sendAdminEmailChangeNoticeEmail(
  input: SendAdminEmailChangeNoticeEmailInput,
): Promise<AuthLinkEmailResult> {
  const { subject, html, text } = await buildAdminEmailChangeNoticeEmail({
    name: input.name,
    currentEmail: input.currentEmail,
    targetEmail: input.targetEmail,
    requestedAt: input.requestedAt,
    requestIp: input.requestIp,
    userAgent: input.userAgent,
  });

  return sendEmail({
    to: input.to,
    subject,
    html,
    text,
  });
}
