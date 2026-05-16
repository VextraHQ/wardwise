"use client";

import { motion } from "motion/react";
import { IconLock, IconPlayerPauseFilled } from "@tabler/icons-react";
import { FormShell } from "@/features/collect/components/public/form-shell";
import {
  StepCard,
  CardSectionHeader,
} from "@/features/collect/components/public/form-ui";
import {
  getEffectiveCampaignName,
  shouldShowCandidateTitle,
} from "@/features/collect/lib/branding";
import type { PublicCampaign } from "@/features/collect/types/collect.types";

type CampaignAvailabilityScreenProps = {
  campaign: PublicCampaign;
  status: "paused" | "closed";
};

const AVAILABILITY_COPY = {
  paused: {
    statusLabel: "Paused",
    indicator: "bg-orange-500",
    indicatorAnimated: true,
    heading: "Registration temporarily paused",
    description:
      "This campaign has paused new registrations. Check back soon or follow updates from the campaign.",
    cardTone: "border-amber-500/35 bg-amber-500/10",
    iconTone: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  closed: {
    statusLabel: "Closed",
    indicator: "bg-destructive",
    indicatorAnimated: false,
    heading: "Registration closed",
    description:
      "This campaign has concluded its supporter registration phase. Thank you to everyone who stood with the campaign.",
    cardTone: "border-border/60 bg-muted/30",
    iconTone: "bg-muted text-muted-foreground",
  },
} as const;

export function CampaignAvailabilityScreen({
  campaign,
  status,
}: CampaignAvailabilityScreenProps) {
  const copy = AVAILABILITY_COPY[status];
  const campaignName = getEffectiveCampaignName(campaign);
  const showCandidateTitle = shouldShowCandidateTitle(campaign);
  const StatusIcon = status === "paused" ? IconPlayerPauseFilled : IconLock;

  return (
    <FormShell campaign={campaign}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <StepCard>
          <CardSectionHeader
            title="Supporter Registration"
            subtitle="Registration Protocol"
            statusLabel={copy.statusLabel}
            icon={
              <div
                className={`h-2 w-2 rounded-full ${copy.indicator} ${
                  copy.indicatorAnimated ? "animate-pulse" : ""
                }`}
              />
            }
          />

          <div className="space-y-6 py-4 text-center">
            <div className="space-y-5">
              <div className="mx-auto flex items-center justify-center gap-3">
                <div className="bg-primary h-px w-8" />
                <span className="text-primary text-[10px] font-black tracking-widest uppercase">
                  {campaign.party}
                </span>
                <div className="bg-primary h-px w-8" />
              </div>

              <div className="flex flex-col items-center justify-center space-y-3">
                <h1 className="text-foreground text-3xl font-black tracking-tight text-balance sm:text-4xl">
                  {showCandidateTitle && campaign.candidateTitle && (
                    <span className="text-muted-foreground mr-2 font-medium">
                      {campaign.candidateTitle}
                    </span>
                  )}
                  {campaignName}
                </h1>
                <p className="text-muted-foreground mx-auto max-w-sm text-xs leading-relaxed font-semibold tracking-widest text-balance uppercase">
                  {campaign.constituency}
                </p>
              </div>
            </div>

            <div
              className={`mx-auto max-w-sm rounded-sm border border-dashed p-5 text-left ${copy.cardTone}`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${copy.iconTone}`}
                >
                  <StatusIcon className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-foreground text-sm font-semibold">
                    {copy.heading}
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {copy.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </StepCard>
      </motion.div>
    </FormShell>
  );
}
