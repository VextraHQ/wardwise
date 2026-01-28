"use client";

import { HiShieldCheck } from "react-icons/hi";
import {
  LegalPageLayout,
  LegalSectionContent,
} from "@/components/layout/legal-page-layout";
import { privacyPolicySections } from "@/lib/data/legal-data";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your information"
      systemCode="LEGAL_PRIV_001"
      icon={HiShieldCheck}
      variant="primary"
      activePage="/privacy"
    >
      <LegalSectionContent sections={privacyPolicySections} />
    </LegalPageLayout>
  );
}
