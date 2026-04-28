"use client";

import { FormShell } from "@/components/collect/form-shell";
import { StepCard, CardSectionHeader } from "@/components/collect/form-ui";
import type { PublicCampaign } from "@/types/collect";

type CampaignAvailabilityScreenProps = {
  campaign: PublicCampaign;
  status: "paused" | "closed";
};

const AVAILABILITY_COPY = {
  paused: {
    title: "System Paused",
    subtitle: "Registration Protocol",
    statusLabel: "Offline",
    indicator: "bg-orange-500",
    iconTone: "bg-orange-500/10",
    iconInnerTone: "bg-orange-500",
    iconAnimated: true,
    heading: "Registration Currently Paused",
    description:
      "This registration campaign is currently on hold. Field operations have been temporarily suspended. Please check back later.",
  },
  closed: {
    title: "Campaign Concluded",
    subtitle: "Registration Protocol",
    statusLabel: "Terminated",
    indicator: "bg-destructive",
    iconTone: "bg-destructive/10",
    iconInnerTone: "bg-destructive",
    iconAnimated: false,
    heading: "Registration Closed",
    description:
      "This registration campaign has successfully ended its collection phase. Thank you to all field operators and supporters.",
  },
} as const;

export function CampaignAvailabilityScreen({
  campaign,
  status,
}: CampaignAvailabilityScreenProps) {
  const copy = AVAILABILITY_COPY[status];

  return (
    <FormShell campaign={campaign}>
      <div className="w-full">
        <StepCard>
          <CardSectionHeader
            title={copy.title}
            subtitle={copy.subtitle}
            statusLabel={copy.statusLabel}
            icon={<div className={`h-2 w-2 rounded-full ${copy.indicator}`} />}
          />
          <div className="space-y-4 py-8 text-center">
            <div
              className={`mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full ${copy.iconTone}`}
            >
              <div
                className={`h-4 w-4 rounded-full ${copy.iconInnerTone} ${
                  copy.iconAnimated ? "animate-pulse" : ""
                }`}
              />
            </div>
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              {copy.heading}
            </h2>
            <p className="text-muted-foreground mx-auto max-w-sm text-sm">
              {copy.description}
            </p>
          </div>
        </StepCard>
      </div>
    </FormShell>
  );
}
