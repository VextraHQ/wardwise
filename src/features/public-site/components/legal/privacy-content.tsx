"use client";

import {
  LegalPageLayout,
  LegalSectionContent,
} from "@/features/public-site/components/legal/legal-page-layout";
import { privacyPolicySections } from "@/lib/constants/legal-data";

export function PrivacyContent() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your information"
    >
      <LegalSectionContent sections={privacyPolicySections} />
    </LegalPageLayout>
  );
}
