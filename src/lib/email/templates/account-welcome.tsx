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
import { getSiteUrl } from "@/lib/core/metadata";
import { EmailBrandHeader } from "@/lib/email/components/email-brand-header";
import { EmailStandardFooter } from "@/lib/email/components/email-standard-footer";

export type AccountWelcomeEmailInput = {
  name: string;
};

export type AccountWelcomeEmail = {
  subject: string;
  html: string;
  text: string;
};

export function AccountWelcomeTemplate({
  greetingName,
  loginUrl,
}: {
  greetingName: string;
  loginUrl: string;
}) {
  const preview =
    "Your WardWise account is ready. Sign in with the password you just created.";

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.outerFrame}>
          <EmailBrandHeader eyebrow="Welcome" />

          <Section style={styles.panel}>
            <Text style={styles.title}>
              You&apos;re all set, {greetingName}.
            </Text>
            <Text style={styles.bodyText}>
              Your password is saved and your WardWise account is active. Sign
              in any time with your email address and the password you chose.
            </Text>

            <Section style={styles.buttonRow}>
              <Button href={loginUrl} style={styles.button}>
                Sign in to WardWise
              </Button>
            </Section>

            <Text style={styles.footerHint}>
              Bookmark the sign-in page so you can get back to your dashboard
              quickly.
            </Text>
          </Section>

          <EmailStandardFooter />
        </Container>
      </Body>
    </Html>
  );
}

export async function buildAccountWelcomeEmail(
  input: AccountWelcomeEmailInput,
): Promise<AccountWelcomeEmail> {
  const trimmed = input.name.trim();
  const greetingName = trimmed.length > 0 ? trimmed : "there";
  const loginUrl = `${getSiteUrl()}/login`;
  const subject = "Welcome to WardWise";

  const template = (
    <AccountWelcomeTemplate greetingName={greetingName} loginUrl={loginUrl} />
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
  buttonRow: {
    margin: "0 0 24px",
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
  footerHint: {
    margin: "0",
    color: "#556f77",
    fontSize: "13px",
    lineHeight: "1.6",
  },
};
