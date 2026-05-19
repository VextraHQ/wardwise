import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import { formatRole } from "@/features/collect/lib/display-format";
import { EmailBrandHeader } from "@/lib/email/components/email-brand-header";
import { EmailStandardFooter } from "@/lib/email/components/email-standard-footer";

export type RegistrationReceiptEmailInput = {
  candidateName: string;
  campaignTitle?: string | null;
  refCode: string;
  submittedAt: Date;
  lgaName: string;
  wardName: string;
  pollingUnitName: string;
  role: string;
  supportGroupName?: string | null;
};

export type RegistrationReceiptEmail = {
  subject: string;
  html: string;
  text: string;
};

const PREVIEW_PADDING = " ‌​‍‎‏﻿".repeat(20);

function formatSubmittedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}

export function RegistrationReceiptTemplate({
  candidateName,
  campaignTitle,
  refCode,
  submittedAt,
  lgaName,
  wardName,
  pollingUnitName,
  role,
  supportGroupName,
}: RegistrationReceiptEmailInput) {
  const campaignLabel = campaignTitle ?? candidateName;
  const preview = `Your registration for ${campaignLabel} has been received. Reference: ${refCode}${PREVIEW_PADDING}`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.outerFrame}>
          <EmailBrandHeader eyebrow="Registration Receipt" />

          <Section style={styles.panel}>
            <Text style={styles.title}>Registration received.</Text>
            <Text style={styles.bodyText}>
              Your registration for <strong>{campaignLabel}</strong> has been
              successfully recorded. Your details are below for your records.
            </Text>

            {/* Reference block */}
            <Section style={styles.refBlock}>
              <Text style={styles.refLabel}>Registration Reference</Text>
              <Text style={styles.refCode}>{refCode}</Text>
            </Section>

            <Hr style={styles.divider} />

            {/* Detail rows */}
            <Section style={styles.detailSection}>
              <DetailRow label="Date" value={formatSubmittedAt(submittedAt)} />
              <DetailRow label="LGA" value={lgaName} />
              <DetailRow label="Ward" value={wardName} />
              <DetailRow label="Polling Unit" value={pollingUnitName} />
              <DetailRow label="Role" value={formatRole(role)} />
              {supportGroupName && (
                <DetailRow label="Support Group" value={supportGroupName} />
              )}
            </Section>

            <Hr style={styles.divider} />

            <Text style={styles.nextStepText}>
              Your record may be reviewed to verify your registration details.
              If any additional information is needed, the campaign team will be
              in touch.
            </Text>

            <Text style={styles.footerHint}>
              Keep your reference number in case you need to follow up on your
              registration.
            </Text>
          </Section>

          <EmailStandardFooter disclaimer="This receipt was sent because you opted in during registration. Your information is used solely for campaign purposes." />
        </Container>
      </Body>
    </Html>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Row style={styles.detailRow}>
      <Column style={styles.detailLabel}>
        <Text style={styles.detailLabelText}>{label}</Text>
      </Column>
      <Column style={styles.detailValue}>
        <Text style={styles.detailValueText}>{value}</Text>
      </Column>
    </Row>
  );
}

export async function buildRegistrationReceiptEmail(
  input: RegistrationReceiptEmailInput,
): Promise<RegistrationReceiptEmail> {
  const subject = `Registration confirmed — ${input.candidateName} (${input.refCode})`;
  const html = await render(<RegistrationReceiptTemplate {...input} />);
  const text = buildPlainText(input);
  return { subject, html, text };
}

function buildPlainText(input: RegistrationReceiptEmailInput): string {
  const campaignLabel = input.campaignTitle ?? input.candidateName;
  const lines = [
    `Registration Receipt`,
    ``,
    `Your registration for ${campaignLabel} has been received.`,
    ``,
    `Reference: ${input.refCode}`,
    `Date: ${formatSubmittedAt(input.submittedAt)}`,
    `LGA: ${input.lgaName}`,
    `Ward: ${input.wardName}`,
    `Polling Unit: ${input.pollingUnitName}`,
    `Role: ${formatRole(input.role)}`,
    ...(input.supportGroupName
      ? [`Support Group: ${input.supportGroupName}`]
      : []),
    ``,
    `Your record may be reviewed to verify your registration details.`,
    `Keep this reference number in case you need to follow up.`,
    ``,
    `WardWise · wardwise.ng`,
  ];
  return lines.join("\n");
}

const styles = {
  body: {
    backgroundColor: "#f0f0e8",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    margin: "0",
    padding: "24px 0",
  },
  outerFrame: {
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    maxWidth: "560px",
    margin: "0 auto",
    overflow: "hidden",
  },
  panel: {
    padding: "32px 32px 24px",
  },
  title: {
    margin: "0 0 12px",
    color: "#111111",
    fontSize: "22px",
    fontWeight: "700",
    lineHeight: "1.3",
  },
  bodyText: {
    margin: "0 0 24px",
    color: "#444444",
    fontSize: "15px",
    lineHeight: "1.6",
  },
  refBlock: {
    backgroundColor: "#f5f5ed",
    borderLeft: "3px solid #16655b",
    borderRadius: "2px",
    padding: "14px 18px",
    marginBottom: "24px",
  },
  refLabel: {
    margin: "0 0 4px",
    color: "#556f77",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    lineHeight: "1.4",
  },
  refCode: {
    margin: "0",
    color: "#16655b",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    lineHeight: "1.3",
    fontFamily: "monospace",
  },
  divider: {
    borderColor: "#e8e8e0",
    margin: "0 0 20px",
  },
  detailSection: {
    marginBottom: "8px",
  },
  detailRow: {
    marginBottom: "10px",
  },
  detailLabel: {
    width: "120px",
    verticalAlign: "top" as const,
    paddingRight: "12px",
  },
  detailLabelText: {
    margin: "0",
    color: "#888888",
    fontSize: "13px",
    lineHeight: "1.5",
  },
  detailValue: {
    verticalAlign: "top" as const,
  },
  detailValueText: {
    margin: "0",
    color: "#222222",
    fontSize: "13px",
    fontWeight: "500",
    lineHeight: "1.5",
  },
  nextStepText: {
    margin: "0 0 12px",
    color: "#555555",
    fontSize: "13px",
    lineHeight: "1.6",
  },
  footerHint: {
    margin: "0",
    color: "#888888",
    fontSize: "12px",
    lineHeight: "1.5",
  },
};
