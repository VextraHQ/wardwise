"use client";

import { HiCog } from "react-icons/hi";
import { CookieSettingsButton } from "@/components/layout/cookie-consent";
import {
  LegalPageLayout,
  LegalSectionContent,
} from "@/components/layout/legal-page-layout";
import { cookiePolicySections } from "@/lib/data/legal-data";

export function CookiesContent() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      subtitle="How we use cookies and similar technologies"
      systemCode="LEGAL_COOK_001"
      icon={HiCog}
    >
      <div className="border-border/60 bg-muted/20 mb-8 flex flex-col gap-3 rounded-sm border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Manage your cookie choices</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Reopen the consent controls any time to update whether optional
            analytics is allowed.
          </p>
        </div>
        <CookieSettingsButton variant="outline" />
      </div>
      <LegalSectionContent sections={cookiePolicySections} />
    </LegalPageLayout>
  );
}
