"use client";

import { HiDocumentText } from "react-icons/hi";
import {
  LegalPageLayout,
  LegalSectionContent,
} from "@/components/layout/legal-page-layout";
import { termsOfServiceSections } from "@/lib/data/legal-data";

export function TermsContent() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="Rules and guidelines for using WardWise"
      systemCode="LEGAL_TOS_001"
      icon={HiDocumentText}
    >
      <LegalSectionContent sections={termsOfServiceSections} />
    </LegalPageLayout>
  );
}
