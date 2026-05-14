import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import { EmailBrandHeader } from "@/lib/email/components/email-brand-header";
import { EmailStandardFooter } from "@/lib/email/components/email-standard-footer";
import { formatRequestIpLabel } from "@/lib/core/ip";
import { formatAuthLinkExpiresAt } from "@/lib/email/templates/auth-link";

export type AdminEmailChangeNoticeEmailInput = {
  name: string;
  currentEmail: string;
  targetEmail: string;
  requestedAt: Date;
  requestIp?: string | null;
  userAgent?: string | null;
};

export type AdminEmailChangeNoticeEmail = {
  subject: string;
  html: string;
  text: string;
};

const PREVIEW_PADDING = "\u200C\u200D\u200E\u200F".repeat(20);

export function AdminEmailChangeNoticeTemplate({
  name,
  currentEmail,
  targetEmail,
  requestedLabel,
  requestIp,
  userAgent,
}: {
  name: string;
  currentEmail: string;
  targetEmail: string;
  requestedLabel: string;
  requestIp?: string | null;
  userAgent?: string | null;
}) {
  const preview = `A WardWise admin email change was requested from ${currentEmail} to ${targetEmail}.`;

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {preview}
        {PREVIEW_PADDING}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.outerFrame}>
          <EmailBrandHeader eyebrow="Admin Security Notice" />

          <Section style={styles.panel}>
            <Text style={styles.title}>
              A sign-in email change was requested.
            </Text>
            <Text style={styles.bodyText}>
              Hi {name}, we received a request to move your WardWise admin
              account from <span style={styles.highlight}>{currentEmail}</span>{" "}
              to <span style={styles.highlight}>{targetEmail}</span>.
            </Text>
            <Text style={styles.bodyText}>
              No change has been completed yet. The new address must still be
              confirmed before your sign-in email switches.
            </Text>

            <Section style={styles.notePanel}>
              <Text style={styles.noteLabel}>Request details</Text>
              <Text style={styles.noteText}>Requested: {requestedLabel}</Text>
              {requestIp ? (
                <Text style={styles.noteText}>Source: {requestIp}</Text>
              ) : null}
              {userAgent ? (
                <Text style={styles.noteText}>Device: {userAgent}</Text>
              ) : null}
            </Section>

            <Text style={styles.ignoreText}>
              If this was you, no action is needed on this inbox. If this
              wasn&apos;t you, sign in and change your password immediately.
            </Text>
          </Section>

          <EmailStandardFooter />
        </Container>
      </Body>
    </Html>
  );
}

export async function buildAdminEmailChangeNoticeEmail(
  input: AdminEmailChangeNoticeEmailInput,
): Promise<AdminEmailChangeNoticeEmail> {
  const displayName =
    input.name.trim().length > 0 ? input.name.trim() : "there";
  const requestedLabel = formatAuthLinkExpiresAt(input.requestedAt);
  const requestIp = formatRequestIpLabel(input.requestIp ?? null);
  const subject = "Security notice: admin email change requested";

  const template = (
    <AdminEmailChangeNoticeTemplate
      name={displayName}
      currentEmail={input.currentEmail}
      targetEmail={input.targetEmail}
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
    fontSize: "24px",
    fontWeight: "800",
    letterSpacing: "-0.02em",
    lineHeight: "1.2",
  },
  bodyText: {
    margin: "0 0 16px",
    color: "#41535a",
    fontSize: "15px",
    lineHeight: "1.72",
  },
  highlight: {
    color: "#16655b",
    fontWeight: "700" as const,
  },
  notePanel: {
    padding: "16px 18px",
    backgroundColor: "#f5f5ed",
    border: "1px solid rgba(22, 101, 91, 0.14)",
    borderRadius: "2px",
    marginTop: "8px",
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
