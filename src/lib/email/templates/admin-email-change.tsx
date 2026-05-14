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
import { EmailBrandHeader } from "@/lib/email/components/email-brand-header";
import { EmailStandardFooter } from "@/lib/email/components/email-standard-footer";
import { formatRequestIpLabel } from "@/lib/core/ip";
import { formatAuthLinkExpiresAt } from "@/lib/email/templates/auth-link";

export type AdminEmailChangeEmailInput = {
  name: string;
  url: string;
  targetEmail: string;
  expiresAt: Date;
  requestedAt: Date;
  requestIp?: string | null;
  userAgent?: string | null;
};

export type AdminEmailChangeEmail = {
  subject: string;
  html: string;
  text: string;
};

// Invisible padding for email preview to prevent merge issues eg: Gmail, Outlook, etc.
const PREVIEW_PADDING = "\u200C\u200D\u200E\u200F".repeat(20);

export function AdminEmailChangeTemplate({
  name,
  url,
  targetEmail,
  expiresLabel,
  requestedLabel,
  requestIp,
  userAgent,
}: {
  name: string;
  url: string;
  targetEmail: string;
  expiresLabel: string;
  requestedLabel: string;
  requestIp?: string | null;
  userAgent?: string | null;
}) {
  const preview = `Confirm your new WardWise admin email (${targetEmail}). Link expires ${expiresLabel}.`;

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {preview}
        {PREVIEW_PADDING}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.outerFrame}>
          <EmailBrandHeader eyebrow="Admin Email Change" />

          <Section style={styles.panel}>
            <Text style={styles.title}>Confirm your new email, {name}.</Text>
            <Text style={styles.bodyText}>
              We received a request to change the email on your WardWise admin
              account to <span style={styles.targetEmail}>{targetEmail}</span>.
              Click the button below to confirm. Until you confirm, your
              existing email stays in use.
            </Text>

            <Section style={styles.buttonRow}>
              <Button href={url} style={styles.button}>
                Confirm email change
              </Button>
            </Section>

            <Text style={styles.fallbackIntro}>
              If the button above doesn&apos;t work, copy this link into your
              browser:
            </Text>
            <Link href={url} style={styles.fallbackUrl}>
              {url}
            </Link>

            <Section style={styles.notePanel}>
              <Text style={styles.noteLabel}>Link Expiry</Text>
              <Text style={styles.noteText}>
                This link expires {expiresLabel}. If it has already expired,
                request a new email change from your admin account page.
              </Text>
            </Section>

            <Section style={styles.notePanel}>
              <Text style={styles.noteLabel}>Request Details</Text>
              <Text style={styles.noteText}>Requested: {requestedLabel}</Text>
              {requestIp ? (
                <Text style={styles.noteText}>IP address: {requestIp}</Text>
              ) : null}
              {userAgent ? (
                <Text style={styles.noteText}>Device: {userAgent}</Text>
              ) : null}
            </Section>

            <Text style={styles.ignoreText}>
              If you didn&apos;t request this, your account is safe — no changes
              have been made. You can ignore this email and your existing
              sign-in email will stay in use.
            </Text>
          </Section>

          <EmailStandardFooter />
        </Container>
      </Body>
    </Html>
  );
}

export async function buildAdminEmailChangeEmail(
  input: AdminEmailChangeEmailInput,
): Promise<AdminEmailChangeEmail> {
  const displayName =
    input.name.trim().length > 0 ? input.name.trim() : "there";
  const expiresLabel = formatAuthLinkExpiresAt(input.expiresAt);
  const requestedLabel = formatAuthLinkExpiresAt(input.requestedAt);

  const subject = `Confirm your new WardWise admin email`;
  const requestIp = formatRequestIpLabel(input.requestIp ?? null);

  const template = (
    <AdminEmailChangeTemplate
      name={displayName}
      url={input.url}
      targetEmail={input.targetEmail}
      expiresLabel={expiresLabel}
      requestedLabel={requestedLabel}
      requestIp={requestIp}
      userAgent={input.userAgent ?? null}
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
  targetEmail: {
    color: "#16655b",
    fontWeight: "700" as const,
  },
  buttonRow: {
    margin: "0 0 14px",
  },
  fallbackIntro: {
    margin: "0 0 6px",
    color: "#7a8f96",
    fontSize: "12px",
    lineHeight: "1.5",
  },
  fallbackUrl: {
    display: "block",
    margin: "0 0 24px",
    color: "#16655b",
    fontSize: "11px",
    lineHeight: "1.6",
    wordBreak: "break-all" as const,
    textDecoration: "none",
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
  notePanel: {
    padding: "16px 18px",
    backgroundColor: "#f5f5ed",
    border: "1px solid rgba(22, 101, 91, 0.14)",
    borderRadius: "2px",
    marginBottom: "20px",
  },
  noteLabel: {
    margin: "0 0 8px",
    color: "#41535a",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0",
  },
  noteText: {
    margin: "0 0 4px",
    color: "#101414",
    fontSize: "14px",
    lineHeight: "1.65",
  },
  ignoreText: {
    margin: "0",
    color: "#556f77",
    fontSize: "13px",
    lineHeight: "1.6",
  },
};
