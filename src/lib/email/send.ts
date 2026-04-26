export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
};

export type SendEmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" };

export function readTrimmedEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function resolveFrom(override?: string): string | undefined {
  if (override) {
    const trimmed = override.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return readTrimmedEnv("EMAIL_FROM") ?? readTrimmedEnv("AUTH_FROM_EMAIL");
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = readTrimmedEnv("RESEND_API_KEY");
  const from = resolveFrom(input.from);

  if (!apiKey || !from) {
    return { sent: false, reason: "not_configured" };
  }

  const payload: Record<string, unknown> = {
    from,
    to: [input.to],
    subject: input.subject,
    html: input.html,
  };

  if (input.text !== undefined) {
    payload.text = input.text;
  }

  if (input.replyTo !== undefined) {
    payload.reply_to = input.replyTo;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.text()).trim();
    const snippet = body.length > 500 ? `${body.slice(0, 500)}…` : body;
    throw new Error(
      `Email delivery failed (status ${response.status}): ${snippet || "<no response body>"}`,
    );
  }

  return { sent: true };
}
