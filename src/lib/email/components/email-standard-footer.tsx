import { Section, Text } from "@react-email/components";

type EmailStandardFooterProps = {
  // Optional line (e.g. internal-use disclaimer) below copyright
  disclaimer?: string;
};

// Shared transactional footer: trust line, copyright year, optional disclaimer.
export function EmailStandardFooter({ disclaimer }: EmailStandardFooterProps) {
  const year = new Date().getFullYear();

  return (
    <Section style={styles.footer}>
      <Text style={styles.primaryLine}>
        Secure email from WardWise · wardwise.ng
      </Text>
      <Text style={styles.copyright}>
        © {year} WardWise. All rights reserved.
      </Text>
      {disclaimer ? <Text style={styles.disclaimer}>{disclaimer}</Text> : null}
    </Section>
  );
}

const styles = {
  footer: {
    backgroundColor: "#f5f5ed",
    borderTop: "1px solid rgba(22, 101, 91, 0.1)",
    padding: "18px 28px 22px",
  },
  primaryLine: {
    margin: "0 0 6px",
    color: "#556f77",
    fontSize: "12px",
    lineHeight: "1.55",
    textAlign: "center" as const,
  },
  copyright: {
    margin: "0",
    color: "#7a8f96",
    fontSize: "11px",
    lineHeight: "1.5",
    textAlign: "center" as const,
  },
  disclaimer: {
    margin: "14px 0 0",
    color: "#556f77",
    fontSize: "11px",
    lineHeight: "1.5",
    textAlign: "center" as const,
  },
};
