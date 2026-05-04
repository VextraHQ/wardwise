import { canSendAuthLinkEmail } from "@/lib/email/auth";
import { buildAccountWelcomeEmail } from "@/lib/email/templates/account-welcome";
import { sendEmail } from "@/lib/email/send";

export type SendAccountWelcomeEmailInput = {
  to: string;
  name: string;
};

export type AccountWelcomeEmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" };

// Sent once after a user completes an invite (set-password) flow.
export async function sendAccountWelcomeEmail(
  input: SendAccountWelcomeEmailInput,
): Promise<AccountWelcomeEmailResult> {
  if (!canSendAuthLinkEmail()) {
    return { sent: false, reason: "not_configured" };
  }

  const { subject, html, text } = await buildAccountWelcomeEmail({
    name: input.name,
  });

  return sendEmail({
    to: input.to,
    subject,
    html,
    text,
  });
}
