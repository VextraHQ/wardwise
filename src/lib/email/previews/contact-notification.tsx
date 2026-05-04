import {
  ContactNotificationTemplate,
  formatContactSubmittedAt,
  type ContactNotificationEmailInput,
} from "@/lib/email/templates/contact-notification";
import { getContactReasonLabel } from "@/lib/contact/reasons";

const fixtureInput: ContactNotificationEmailInput = {
  name: "Jane Campaign",
  email: "jane@example.com",
  reason: "demo",
  reasonDetails: "Need access this week",
  message:
    "We would like a short walkthrough of WardWise Collect for our senatorial campaign.",
  submittedAt: new Date("2026-05-03T14:00:00.000Z"),
  sourcePath: "/contact",
};

const reasonDetailLabel = fixtureInput.reasonDetails.trim();
const reasonTitle =
  reasonDetailLabel.length > 0
    ? `${getContactReasonLabel(fixtureInput.reason)} — ${reasonDetailLabel}`
    : getContactReasonLabel(fixtureInput.reason);

const submittedLabel = formatContactSubmittedAt(fixtureInput.submittedAt);
const rawMessage = fixtureInput.message.trim().replace(/\s+/g, " ");
const messagePreview =
  rawMessage.slice(0, 90) + (rawMessage.length > 90 ? "…" : "");

/** Dev-only: `pnpm email:dev`. */
export default function ContactNotificationPreview() {
  return (
    <ContactNotificationTemplate
      reasonTitle={reasonTitle}
      input={fixtureInput}
      submittedLabel={submittedLabel}
      messagePreview={messagePreview}
    />
  );
}
