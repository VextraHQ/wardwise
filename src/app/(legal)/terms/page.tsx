"use client";

import { HiDocumentText } from "react-icons/hi";
import {
  LegalPageLayout,
  LegalSectionContent,
} from "@/components/layout/legal-page-layout";
import { termsOfServiceSections } from "@/lib/data/legal-data";

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="Rules and guidelines for using WardWise"
      systemCode="LEGAL_TOS_001"
      icon={HiDocumentText}
      variant="primary"
      activePage="/terms"
    >
      <LegalSectionContent sections={termsOfServiceSections} />
    </LegalPageLayout>
  );
}
