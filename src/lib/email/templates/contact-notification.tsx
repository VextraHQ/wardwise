import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import {
  getContactReasonLabel,
  type ContactReason,
} from "@/lib/contact/reasons";
import { EmailBrandHeader } from "@/lib/email/components/email-brand-header";

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

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <Row>
      <Column style={styles.metaKeyColumn}>
        <Text style={styles.metaKey}>{label}</Text>
      </Column>
      <Column style={styles.metaValueColumn}>
        <Text style={styles.metaValue}>{value}</Text>
      </Column>
    </Row>
  );
}

function ContactNotificationTemplate({
  reasonTitle,
  reasonLabel,
  input,
  submittedLabel,
  messagePreview,
}: {
  reasonTitle: string;
  reasonLabel: string;
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

          {/* ── Sender ── */}
          <Section style={styles.senderPanel}>
            <Text style={styles.senderEyebrow}>New contact from</Text>
            <Text style={styles.senderName}>{input.name}</Text>
            <Link href={`mailto:${input.email}`} style={styles.senderEmail}>
              {input.email}
            </Link>

            <Row style={{ marginTop: "20px" }}>
              <Column style={{ verticalAlign: "middle" }}>
                <Text style={styles.reasonLabel}>{reasonTitle}</Text>
              </Column>
              <Column style={{ textAlign: "right", verticalAlign: "middle" }}>
                <Text style={styles.timestamp}>{submittedLabel}</Text>
              </Column>
            </Row>
          </Section>

          {/* ── Metadata + Message ── */}
          <Section style={styles.detailSection}>
            <Section style={styles.metaPanel}>
              <Text style={styles.panelEyebrow}>Metadata</Text>
              <MetadataRow label="Name" value={input.name} />
              <MetadataRow label="Email" value={input.email} />
              <MetadataRow label="Reason" value={reasonLabel} />
              {input.reasonDetails.trim().length > 0 ? (
                <MetadataRow
                  label="Details"
                  value={input.reasonDetails.trim()}
                />
              ) : null}
              <MetadataRow label="Submitted" value={submittedLabel} />
              <MetadataRow label="Source" value={input.sourcePath} />
            </Section>

            <Text style={styles.messageSectionEyebrow}>Message</Text>
            <Hr style={styles.rule} />
            <Text style={styles.messageText}>{input.message}</Text>
          </Section>

          {/* ── CTA ── */}
          <Section style={styles.ctaSection}>
            <Button href={`mailto:${input.email}`} style={styles.button}>
              Reply to Sender
            </Button>
          </Section>

          {/* ── Footer ── */}
          <Section style={styles.footer}>
            <Text style={styles.footerSource}>Source: {input.sourcePath}</Text>
            <Text style={styles.footerText}>
              Internal notification · Do not forward externally
            </Text>
          </Section>
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
      reasonLabel={reasonLabel}
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
  // Sender panel
  senderPanel: {
    padding: "32px 28px 26px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid rgba(22, 101, 91, 0.12)",
  },
  senderEyebrow: {
    margin: "0 0 10px",
    color: "#41535a",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
  },
  senderName: {
    margin: "0 0 5px",
    color: "#101414",
    fontSize: "26px",
    fontWeight: "800",
    letterSpacing: "-0.02em",
    lineHeight: "1.2",
  },
  senderEmail: {
    color: "#16655b",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
  },
  reasonLabel: {
    margin: "0",
    color: "#16655b",
    fontSize: "13px",
    fontWeight: "700",
  },
  timestamp: {
    margin: "0",
    color: "#41535a",
    fontSize: "12px",
    textAlign: "right" as const,
  },
  // Detail section (meta + message)
  detailSection: {
    padding: "24px 28px 32px",
    backgroundColor: "#ffffff",
  },
  metaPanel: {
    marginBottom: "28px",
    padding: "18px 20px",
    backgroundColor: "#f7f7f4",
    borderTop: "1px solid rgba(22, 101, 91, 0.12)",
    borderRight: "1px solid rgba(22, 101, 91, 0.12)",
    borderBottom: "1px solid rgba(22, 101, 91, 0.12)",
    borderLeft: "3px solid #16655b",
    borderRadius: "2px",
  },
  panelEyebrow: {
    margin: "0 0 14px",
    color: "#41535a",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
  },
  metaKeyColumn: {
    width: "100px",
    paddingRight: "12px",
    paddingTop: "9px",
    paddingBottom: "9px",
    verticalAlign: "top" as const,
  },
  metaValueColumn: {
    paddingLeft: "12px",
    paddingTop: "9px",
    paddingBottom: "9px",
    borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
    verticalAlign: "top" as const,
  },
  metaKey: {
    margin: "0",
    color: "#41535a",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  },
  metaValue: {
    margin: "0",
    color: "#101414",
    fontSize: "13px",
    lineHeight: "1.55",
  },
  messageSectionEyebrow: {
    margin: "0",
    color: "#41535a",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
  },
  rule: {
    borderColor: "rgba(22, 101, 91, 0.12)",
    margin: "12px 0 20px",
  },
  messageText: {
    margin: "0",
    color: "#101414",
    fontSize: "15px",
    lineHeight: "1.72",
    whiteSpace: "pre-line" as const,
  },
  // CTA
  ctaSection: {
    padding: "20px 28px",
    backgroundColor: "#f7f7f4",
    borderTop: "1px solid rgba(22, 101, 91, 0.1)",
    borderBottom: "1px solid rgba(22, 101, 91, 0.1)",
  },
  button: {
    backgroundColor: "#16655b",
    color: "#f7f7f4",
    padding: "12px 22px",
    borderRadius: "2px",
    textDecoration: "none",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    display: "inline-block",
  },
  // Footer
  footer: {
    backgroundColor: "#f7f7f4",
    borderTop: "1px solid rgba(15, 23, 42, 0.08)",
    padding: "14px 28px 18px",
  },
  footerSource: {
    margin: "0 0 4px",
    color: "#41535a",
    fontSize: "11px",
  },
  footerText: {
    margin: "0",
    color: "#9aacb3",
    fontSize: "11px",
    textAlign: "center" as const,
  },
};
