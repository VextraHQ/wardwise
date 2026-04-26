// TODO(email): Replace this string-template email with React Email once WardWise
// adds contact, welcome, or product notification emails with shared branded components.

export type AuthLinkEmailType = "invite" | "password_reset";

export type AuthLinkEmailInput = {
  type: AuthLinkEmailType;
  name: string;
  url: string;
  expiresAt: Date;
};

export type AuthLinkEmail = { subject: string; html: string; text: string };

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

function formatExpiresAt(expiresAt: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(expiresAt);
}

export function buildAuthLinkEmail(input: AuthLinkEmailInput): AuthLinkEmail {
  const subject =
    input.type === "invite"
      ? "Set up your WardWise account"
      : "Reset your WardWise password";

  const title =
    input.type === "invite"
      ? "Set up your WardWise access"
      : "Reset your password";

  const description =
    input.type === "invite"
      ? "Your campaign admin has created your WardWise access. Use the secure link below to set your password."
      : "We received a request to reset your WardWise password. Use the secure link below to choose a new one.";

  const displayName = input.name.trim().length > 0 ? input.name : "there";
  const safeName = escapeHtml(displayName);
  const safeUrl = escapeHtml(input.url);
  const expiresLabel = formatExpiresAt(input.expiresAt);
  const safeExpires = escapeHtml(expiresLabel);

  const html = `
        <div style="font-family: Geist, Arial, sans-serif; background:#f7f7f4; padding:32px;">
          <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid rgba(22,101,91,0.14); padding:32px;">
            <p style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#16655b; font-weight:700; margin:0 0 16px;">
              WardWise Secure Access
            </p>
            <h1 style="font-size:28px; line-height:1.1; margin:0 0 12px; color:#101414;">
              ${escapeHtml(title)}
            </h1>
            <p style="font-size:15px; line-height:1.7; color:#475569; margin:0 0 20px;">
              Hello ${safeName}, ${escapeHtml(description)}
            </p>
            <p style="margin:0 0 24px;">
              <a href="${safeUrl}" style="display:inline-block; background:#16655b; color:#ffffff; text-decoration:none; padding:14px 18px; font-size:12px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">
                Continue securely
              </a>
            </p>
            <p style="font-size:13px; line-height:1.7; color:#64748b; margin:0 0 8px;">
              This link expires on ${safeExpires}.
            </p>
            <p style="font-size:13px; line-height:1.7; color:#64748b; margin:0;">
              If you did not expect this email, you can safely ignore it.
            </p>
          </div>
        </div>
      `;

  const text = [
    `${title}`,
    "",
    `Hello ${displayName}, ${description}`,
    "",
    `Continue securely: ${input.url}`,
    "",
    `This link expires on ${expiresLabel}.`,
    "",
    "If you did not expect this email, you can safely ignore it.",
  ].join("\n");

  return { subject, html, text };
}
