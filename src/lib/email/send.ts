import { Resend } from "resend";

// Defines what details are needed to send an email.
export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
};

// Represents the result of trying to send an email.
export type SendEmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" };

// Reads an environment variable, trims whitespace, and returns it if it's not empty.
export function readTrimmedEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

// Decides the email sender address. Uses override if given, or falls back to env vars.
function resolveFrom(override?: string): string | undefined {
  if (override) {
    const trimmed = override.trim();
    if (trimmed.length > 0) return trimmed;
  }
  // Fall back to EMAIL_FROM or AUTH_FROM_EMAIL from environment
  return readTrimmedEnv("EMAIL_FROM") ?? readTrimmedEnv("AUTH_FROM_EMAIL");
}

// Sends an email using the Resend API and returns the result.
export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = readTrimmedEnv("RESEND_API_KEY");
  const from = resolveFrom(input.from);

  // If config is missing, don't try to send.
  if (!apiKey || !from) {
    return { sent: false, reason: "not_configured" };
  }

  // Create Resend client and prepare message.
  const resend = new Resend(apiKey);
  const response = await resend.emails.send({
    from,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    ...(input.text !== undefined ? { text: input.text } : {}),
    ...(input.replyTo !== undefined ? { replyTo: input.replyTo } : {}),
  });

  // If there's an error sending, throw a descriptive error.
  if (response.error) {
    const status = response.error.statusCode ?? "unknown";
    const body = response.error.message.trim();
    const snippet = body.length > 500 ? `${body.slice(0, 500)}…` : body;
    throw new Error(
      `Email delivery failed (status ${status}): ${snippet || "<no response body>"}`,
    );
  }

  // Success
  return { sent: true };
}
