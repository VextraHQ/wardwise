import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import {
  getContactReasonLabel,
  type ContactReason,
} from "@/lib/constants/contact-reasons";
import { EmailBrandHeader } from "@/lib/email/components/email-brand-header";
import { EmailStandardFooter } from "@/lib/email/components/email-standard-footer";

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

const PREVIEW_PADDING = " ‌​‍‎‏﻿".repeat(20);

/** Shared by `buildContactNotificationEmail` and `src/lib/email/previews/*`. */
export function formatContactSubmittedAt(submittedAt: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(submittedAt);
}

export function ContactNotificationTemplate({
  reasonTitle,
  input,
  submittedLabel,
  messagePreview,
}: {
  reasonTitle: string;
  input: ContactNotificationEmailInput;
  submittedLabel: string;
  messagePreview: string;
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        {messagePreview}
        {PREVIEW_PADDING}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.outerFrame}>
          <EmailBrandHeader eyebrow="Contact Form" />

          <Section style={styles.panel}>
            <Text style={styles.title}>A new contact request is ready.</Text>
            <Text style={styles.bodyText}>
              Review the sender details, scan the request context, and reply
              directly if follow-up is needed.
            </Text>

            <Section style={styles.notePanel}>
              <Text style={styles.noteLabel}>Contact Summary</Text>
              <Text style={styles.metadataText}>
                <strong>Name:</strong> {input.name}
              </Text>
              <Text style={styles.metadataText}>
                <strong>Email:</strong>{" "}
                <Link
                  href={`mailto:${input.email}`}
                  style={styles.metadataLink}
                >
                  {input.email}
                </Link>
              </Text>
              <Text style={styles.metadataText}>
                <strong>Topic:</strong> {reasonTitle}
              </Text>
              <Text style={styles.metadataText}>
                <strong>Received:</strong> {submittedLabel}
              </Text>
              <Text style={styles.metadataTextLast}>
                <strong>Source:</strong> {input.sourcePath}
              </Text>
            </Section>

            <Text style={styles.sectionLabel}>Message</Text>
            <Section style={styles.messagePanel}>
              <Text style={styles.messageText}>{input.message}</Text>
            </Section>

            <Section style={styles.buttonRow}>
              <Button href={`mailto:${input.email}`} style={styles.button}>
                Reply by email
              </Button>
            </Section>
          </Section>

          <EmailStandardFooter disclaimer="Internal notification · Do not forward externally" />
        </Container>
      </Body>
    </Html>
  );
}

export async function buildContactNotificationEmail(
  input: ContactNotificationEmailInput,
): Promise<ContactNotificationEmail> {
  const reasonLabel = getContactReasonLabel(input.reason);
  const reasonDetailLabel = input.reasonDetails.trim();
  const resolvedReasonTitle =
    reasonDetailLabel.length > 0
      ? `${reasonLabel} — ${reasonDetailLabel}`
      : reasonLabel;
  const submittedLabel = formatContactSubmittedAt(input.submittedAt);
  const subject = `New contact: ${input.name} · ${resolvedReasonTitle}`;

  const rawMessage = input.message.trim().replace(/\s+/g, " ");
  const messagePreview =
    rawMessage.slice(0, 90) + (rawMessage.length > 90 ? "…" : "");

  const template = (
    <ContactNotificationTemplate
      reasonTitle={resolvedReasonTitle}
      input={input}
      submittedLabel={submittedLabel}
      messagePreview={messagePreview}
    />
  );

  const [html, text] = await Promise.all([
    render(template),
    render(template, { plainText: true }),
  ]);

  return { subject, html, text };
}

const styles = {
  body: {
    margin: "0",
    padding: "0",
    backgroundColor: "#f0efea",
    fontFamily:
      "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  outerFrame: {
    maxWidth: "600px",
    width: "100%",
    margin: "0 auto",
    backgroundColor: "#ffffff",
  },
  panel: {
    padding: "32px 28px 36px",
    backgroundColor: "#ffffff",
  },
  title: {
    margin: "0 0 16px",
    color: "#101414",
    fontSize: "26px",
    fontWeight: "800",
    letterSpacing: "-0.02em",
    lineHeight: "1.2",
  },
  bodyText: {
    margin: "0 0 24px",
    color: "#41535a",
    fontSize: "15px",
    lineHeight: "1.72",
  },
  notePanel: {
    padding: "16px 18px",
    backgroundColor: "#f5f5ed",
    border: "1px solid rgba(22, 101, 91, 0.14)",
    borderRadius: "2px",
    marginBottom: "24px",
  },
  noteLabel: {
    margin: "0 0 10px",
    color: "#41535a",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0",
  },
  metadataText: {
    margin: "0 0 8px",
    color: "#101414",
    fontSize: "14px",
    lineHeight: "1.65",
    wordBreak: "break-word" as const,
  },
  metadataTextLast: {
    margin: "0",
    color: "#101414",
    fontSize: "14px",
    lineHeight: "1.65",
    wordBreak: "break-word" as const,
  },
  metadataLink: {
    color: "#16655b",
    textDecoration: "none",
  },
  sectionLabel: {
    margin: "0 0 10px",
    color: "#41535a",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  },
  messagePanel: {
    padding: "18px 20px",
    backgroundColor: "#f5f5ed",
    border: "1px solid rgba(22, 101, 91, 0.1)",
    borderRadius: "2px",
  },
  messageText: {
    margin: "0",
    color: "#101414",
    fontSize: "15px",
    lineHeight: "1.72",
    whiteSpace: "pre-line" as const,
  },
  buttonRow: {
    margin: "24px 0 0",
  },
  button: {
    backgroundColor: "#16655b",
    color: "#f5f5ed",
    padding: "13px 22px",
    borderRadius: "2px",
    textDecoration: "none",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    display: "inline-block",
  },
};
