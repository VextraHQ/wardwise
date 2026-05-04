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
} from "@/lib/contact/reasons";
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

function formatSubmittedAt(submittedAt: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(submittedAt);
}

function ContactNotificationTemplate({
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
      <Preview>{messagePreview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.outerFrame}>
          <EmailBrandHeader eyebrow="Contact Form" />

          <Section style={styles.senderPanel}>
            <Text style={styles.senderEyebrow}>New contact</Text>
            <Text style={styles.senderName}>{input.name}</Text>

            <Text style={styles.senderFieldLabel}>Email</Text>
            <Link href={`mailto:${input.email}`} style={styles.senderEmail}>
              {input.email}
            </Link>

            <Section style={styles.senderMetaStrip}>
              <Text style={styles.senderMetaLabel}>Topic</Text>
              <Text style={styles.senderTopicValue}>{reasonTitle}</Text>
              <Text style={styles.senderMetaLabelReceived}>Received</Text>
              <Text style={styles.timestampValue}>{submittedLabel}</Text>
            </Section>
          </Section>

          <Section style={styles.detailSection}>
            <Text style={styles.sourceInline}>
              Submitted from {input.sourcePath}
            </Text>

            <Text style={styles.sectionLabel}>Message</Text>
            <Section style={styles.messagePanel}>
              <Text style={styles.messageText}>{input.message}</Text>
            </Section>
          </Section>

          <Section style={styles.ctaSection}>
            <Button href={`mailto:${input.email}`} style={styles.button}>
              Reply by email
            </Button>
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
  const submittedLabel = formatSubmittedAt(input.submittedAt);
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
  senderPanel: {
    padding: "30px 28px 26px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid rgba(22, 101, 91, 0.12)",
  },
  senderEyebrow: {
    margin: "0 0 14px",
    color: "#7a8f96",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    lineHeight: "1.4",
  },
  senderName: {
    margin: "0 0 18px",
    color: "#101414",
    fontSize: "24px",
    fontWeight: "800",
    letterSpacing: "-0.02em",
    lineHeight: "1.2",
  },
  senderFieldLabel: {
    margin: "0 0 5px",
    color: "#556f77",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    lineHeight: "1.4",
  },
  senderEmail: {
    margin: "0",
    color: "#16655b",
    fontSize: "15px",
    fontWeight: "600",
    lineHeight: "1.45",
    textDecoration: "none",
  },
  senderMetaStrip: {
    margin: "22px 0 0",
  },
  senderMetaLabel: {
    margin: "0 0 5px",
    color: "#556f77",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    lineHeight: "1.4",
  },
  senderMetaLabelReceived: {
    margin: "14px 0 5px",
    color: "#556f77",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    lineHeight: "1.4",
  },
  senderTopicValue: {
    margin: "0",
    color: "#101414",
    fontSize: "14px",
    fontWeight: "600",
    lineHeight: "1.55",
    wordBreak: "break-word" as const,
  },
  timestampValue: {
    margin: "0",
    color: "#41535a",
    fontSize: "13px",
    fontWeight: "500",
    lineHeight: "1.5",
  },
  detailSection: {
    padding: "26px 28px 30px",
    backgroundColor: "#ffffff",
  },
  sourceInline: {
    margin: "0 0 16px",
    color: "#556f77",
    fontSize: "12px",
    fontWeight: "500",
    lineHeight: "1.5",
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
  ctaSection: {
    padding: "24px 28px 26px",
    backgroundColor: "#ffffff",
    borderTop: "1px solid rgba(22, 101, 91, 0.12)",
    textAlign: "center" as const,
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
