import { Column, Img, Row, Section, Text } from "@react-email/components";
import { getEmailAssetsBaseUrl } from "@/lib/core/metadata";

const LOGOTYPE_PATH = "/brand/logotype-lagoon.png";

export const EMAIL_LOGOTYPE_DISPLAY = {
  width: 140,
  height: 20,
} as const;

export function getEmailLogotypeSrc(): string {
  return `${getEmailAssetsBaseUrl()}${LOGOTYPE_PATH}`;
}

export function EmailBrandHeader({ eyebrow }: { eyebrow: string }) {
  return (
    <Section style={styles.section}>
      <Row>
        <Column style={styles.logoColumn}>
          <Img
            src={getEmailLogotypeSrc()}
            alt="WardWise"
            width={String(EMAIL_LOGOTYPE_DISPLAY.width)}
            height={String(EMAIL_LOGOTYPE_DISPLAY.height)}
            style={styles.logo}
          />
        </Column>
        <Column style={styles.eyebrowColumn}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        </Column>
      </Row>
    </Section>
  );
}

const styles = {
  section: {
    backgroundColor: "#f5f5ed",
    padding: "18px 28px",
  },
  logoColumn: {
    verticalAlign: "middle" as const,
    paddingRight: "8px",
    width: "auto",
  },
  eyebrowColumn: {
    textAlign: "right" as const,
    verticalAlign: "middle" as const,
  },
  logo: {
    display: "block",
  },
  eyebrow: {
    margin: "0",
    color: "#556f77",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0",
    lineHeight: "1.4",
  },
};
