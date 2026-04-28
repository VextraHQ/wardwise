"use client";

import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import type { PublicCampaign } from "@/types/collect";
import { getEffectiveCampaignName } from "@/lib/collect/branding";
import { AppFooter } from "@/components/layout/app-footer";

export function FormShell({
  children,
  campaign,
  statusBanner,
  headerActions,
}: {
  children: ReactNode;
  campaign: PublicCampaign;
  statusBanner?: ReactNode;
  headerActions?: ReactNode;
}) {
  const campaignName = getEffectiveCampaignName(campaign);

  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header
          badge={`${campaignName} — ${campaign.party}`}
          hideMobileBadge
          actions={headerActions}
        />

        {statusBanner}
        <div
          className={`mx-auto flex w-full max-w-2xl flex-1 flex-col justify-start px-4 ${
            statusBanner ? "pt-2 pb-4 sm:pt-4 sm:pb-8" : "py-4 sm:py-8"
          }`}
        >
          {children}
        </div>

        <AppFooter />
      </div>
    </div>
  );
}
