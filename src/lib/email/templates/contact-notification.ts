// TODO(email): Replace this string-template email with React Email once WardWise
// adds more branded public-facing templates with shared email components.

import {
  getContactReasonLabel,
  type ContactReason,
} from "@/lib/contact/reasons";

export type ContactNotificationEmailInput = {
  name: string;
  email: string;
  reason: ContactReason;
  reasonDetails: string;
  message: string;
  submittedAt: Date;
  sourcePath: string;
};

export type ContactNotificationEmail = {
  subject: string;
  html: string;
  text: string;
};

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

function formatSubmittedAt(submittedAt: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(submittedAt);
}

export function buildContactNotificationEmail(
  input: ContactNotificationEmailInput,
): ContactNotificationEmail {
  const reasonLabel = getContactReasonLabel(input.reason);
  const reasonDetailLabel = input.reasonDetails.trim();
  const submittedLabel = formatSubmittedAt(input.submittedAt);
  const safeMessage = escapeHtml(input.message).replace(/\n/g, "<br />");
  const resolvedReasonTitle =
    reasonDetailLabel.length > 0
      ? `${reasonLabel} - ${reasonDetailLabel}`
      : reasonLabel;

  const subject = `New contact request: ${resolvedReasonTitle}`;
  const html = `
    <div style="font-family: Geist, Arial, sans-serif; background:#f7f7f4; padding:32px;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid rgba(22,101,91,0.14); padding:32px;">
        <p style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#16655b; font-weight:700; margin:0 0 16px;">
          WardWise Contact Intake
        </p>
        <h1 style="font-size:28px; line-height:1.1; margin:0 0 20px; color:#101414;">
          ${escapeHtml(resolvedReasonTitle)}
        </h1>
        <div style="display:grid; gap:12px; margin:0 0 24px;">
          <p style="font-size:14px; line-height:1.6; color:#0f172a; margin:0;"><strong>Name:</strong> ${escapeHtml(input.name)}</p>
          <p style="font-size:14px; line-height:1.6; color:#0f172a; margin:0;"><strong>Email:</strong> ${escapeHtml(input.email)}</p>
          ${
            reasonDetailLabel.length > 0
              ? `<p style="font-size:14px; line-height:1.6; color:#0f172a; margin:0;"><strong>Reason details:</strong> ${escapeHtml(reasonDetailLabel)}</p>`
              : ""
          }
          <p style="font-size:14px; line-height:1.6; color:#0f172a; margin:0;"><strong>Submitted:</strong> ${escapeHtml(submittedLabel)}</p>
          <p style="font-size:14px; line-height:1.6; color:#0f172a; margin:0;"><strong>Source:</strong> ${escapeHtml(input.sourcePath)}</p>
        </div>
        <div style="border:1px solid rgba(15,23,42,0.08); background:#fbfcfb; padding:18px;">
          <p style="font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:#475569; font-weight:700; margin:0 0 12px;">
            Message
          </p>
          <p style="font-size:15px; line-height:1.75; color:#334155; margin:0;">${safeMessage}</p>
        </div>
      </div>
    </div>
  `;

  const text = [
    subject,
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    ...(reasonDetailLabel.length > 0
      ? [`Reason details: ${reasonDetailLabel}`]
      : []),
    `Submitted: ${submittedLabel}`,
    `Source: ${input.sourcePath}`,
    "",
    "Message:",
    input.message,
  ].join("\n");

  return { subject, html, text };
}
