"use client";

import { HiCog } from "react-icons/hi";
import {
  LegalPageLayout,
  LegalSectionContent,
} from "@/components/layout/legal-page-layout";
import { cookiePolicySections } from "@/lib/data/legal-data";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      subtitle="How we use cookies and similar technologies"
      systemCode="LEGAL_COOK_001"
      icon={HiCog}
      variant="primary"
      activePage="/cookies"
    >
      <LegalSectionContent sections={cookiePolicySections} />
    </LegalPageLayout>
  );
}
