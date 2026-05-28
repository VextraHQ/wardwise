"use client";

import { SiteFooter } from "@/features/public-site/components/shared/footer";
import { ScrollToTop } from "@/features/public-site/components/shared/scroll-to-top";
import { ForCampaignsAudiences } from "@/features/public-site/components/for-campaigns/for-campaigns-audiences";
import { ForCampaignsComparison } from "@/features/public-site/components/for-campaigns/for-campaigns-comparison";
import { ForCampaignsCta } from "@/features/public-site/components/for-campaigns/for-campaigns-cta";
import { ForCampaignsHero } from "@/features/public-site/components/for-campaigns/for-campaigns-hero";
import { ForCampaignsPlatformMap } from "@/features/public-site/components/for-campaigns/for-campaigns-platform-map";
import { MarketingHeader } from "@/features/public-site/components/shared/marketing-header";

export function ForCampaignsContent() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="flex-1">
        <ForCampaignsHero />
        <ForCampaignsPlatformMap />
        <ForCampaignsAudiences />
        <ForCampaignsComparison />
        <ForCampaignsCta />
      </main>

      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
