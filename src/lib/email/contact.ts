// Import types and utility functions for processing contact notifications
import { type ContactReason } from "@/lib/contact/reasons";
import { readTrimmedEnv, sendEmail } from "@/lib/email/send";
import { buildContactNotificationEmail } from "@/lib/email/templates/contact-notification";

// Input type for sending a contact notification email
export type SendContactNotificationEmailInput = {
  name: string;
  email: string;
  reason: ContactReason;
  reasonDetails: string;
  message: string;
  submittedAt: Date;
  sourcePath: string;
};

// Result of attempting to send a notification email
export type ContactNotificationEmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" };

// Sends a notification email for contact form submissions
export async function sendContactNotificationEmail(
  input: SendContactNotificationEmailInput,
): Promise<ContactNotificationEmailResult> {
  // Get where to send the notification from environment variables
  const to = readTrimmedEnv("CONTACT_TO_EMAIL");

  // If not configured, return failure result
  if (!to) {
    return { sent: false, reason: "not_configured" };
  }

  // Prepare email contents from the input data
  const { subject, html, text } = await buildContactNotificationEmail(input);

  // Send the email with reply-to set as the sender's email
  return sendEmail({
    to,
    subject,
    html,
    text,
    replyTo: input.email,
  });
}
