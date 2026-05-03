import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import { EmailBrandHeader } from "@/lib/email/components/email-brand-header";

export type AuthLinkEmailType = "invite" | "password_reset";

export type AuthLinkEmailInput = {
  type: AuthLinkEmailType;
  name: string;
  url: string;
  expiresAt: Date;
};

export type AuthLinkEmail = { subject: string; html: string; text: string };

function formatExpiresAt(expiresAt: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(expiresAt);
}

function AuthLinkTemplate({
  type,
  name,
  url,
  expiresLabel,
}: {
  type: AuthLinkEmailType;
  name: string;
  url: string;
  expiresLabel: string;
}) {
  const isInvite = type === "invite";

  const headerEyebrow = isInvite ? "Account Invite" : "Password Reset";

  const title = isInvite
    ? `You're in, ${name}.`
    : `Choose a new password, ${name}.`;

  const bodyText = isInvite
    ? "Your campaign admin set up your WardWise account. Click the button below to create your password and get started."
    : "We received a request to reset your WardWise password. If that was you, click the button below to choose a new one.";

  const ctaLabel = isInvite ? "Set your password" : "Choose a new password";

  const expiryNote = isInvite
    ? `This link expires ${expiresLabel}. After that, ask your campaign admin to resend the invite.`
    : `This link expires ${expiresLabel}. Request a new one from the sign-in page if it has already expired.`;

  const ignoreText = isInvite
    ? "Didn't expect this? You can safely ignore this email — no account has been activated."
    : "If you didn't request this, your account is safe — no changes have been made. You can safely ignore this email.";

  const preview = isInvite
    ? `Your campaign admin set you up. Create your password before ${expiresLabel}.`
    : `We got your request. This link expires ${expiresLabel} — if this wasn't you, ignore this email.`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.outerFrame}>
          <EmailBrandHeader eyebrow={headerEyebrow} />

          {/* ── Main panel ── */}
          <Section style={styles.panel}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.bodyText}>{bodyText}</Text>

            <Section style={styles.buttonRow}>
              <Button href={url} style={styles.button}>
                {ctaLabel}
              </Button>
            </Section>

            <Section style={styles.notePanel}>
              <Text style={styles.noteLabel}>Link Expiry</Text>
              <Text style={styles.noteText}>{expiryNote}</Text>
            </Section>

            <Text style={styles.ignoreText}>{ignoreText}</Text>
          </Section>

          {/* ── Footer ── */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Secure email from WardWise · wardwise.ng
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export async function buildAuthLinkEmail(
  input: AuthLinkEmailInput,
): Promise<AuthLinkEmail> {
  const displayName =
    input.name.trim().length > 0 ? input.name.trim() : "there";
  const expiresLabel = formatExpiresAt(input.expiresAt);

  const subject =
    input.type === "invite"
      ? `Your WardWise access is ready, ${displayName}`
      : `Reset your WardWise password, ${displayName}`;

  const template = (
    <AuthLinkTemplate
      type={input.type}
      name={displayName}
      url={input.url}
      expiresLabel={expiresLabel}
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
  // Panel
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
  buttonRow: {
    margin: "0 0 28px",
  },
  button: {
    backgroundColor: "#16655b",
    color: "#f7f7f4",
    padding: "13px 22px",
    borderRadius: "2px",
    textDecoration: "none",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    display: "inline-block",
  },
  // Expiry note (cockpit left-border accent panel)
  notePanel: {
    padding: "16px 18px",
    backgroundColor: "#f7f7f4",
    borderTop: "1px solid rgba(22, 101, 91, 0.12)",
    borderRight: "1px solid rgba(22, 101, 91, 0.12)",
    borderBottom: "1px solid rgba(22, 101, 91, 0.12)",
    borderLeft: "3px solid #16655b",
    borderRadius: "2px",
    marginBottom: "20px",
  },
  noteLabel: {
    margin: "0 0 6px",
    color: "#41535a",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
  },
  noteText: {
    margin: "0",
    color: "#101414",
    fontSize: "14px",
    lineHeight: "1.65",
  },
  ignoreText: {
    margin: "0",
    color: "#9aacb3",
    fontSize: "12px",
    lineHeight: "1.65",
  },
  // Footer
  footer: {
    backgroundColor: "#f7f7f4",
    borderTop: "1px solid rgba(15, 23, 42, 0.08)",
    padding: "14px 28px 18px",
  },
  footerText: {
    margin: "0",
    color: "#9aacb3",
    fontSize: "11px",
    textAlign: "center" as const,
  },
};
