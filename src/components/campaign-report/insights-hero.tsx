"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconBroadcast,
  IconClock,
  IconCopy,
  IconShieldCheck,
  IconUsersGroup,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  capitalize,
  timeAgo,
  STATUS_STYLES,
  STATUS_COPY,
} from "./insights-helpers";

export function InsightsHero({
  campaign,
  total,
  health,
  recentWindowCount,
  verifiedRate,
}: {
  campaign: {
    candidateName: string;
    candidateTitle: string | null;
    party: string;
    constituency: string;
    constituencyType: string;
    slug: string;
    status: string;
    enabledLgaCount: number;
  };
  total: number;
  health: {
    lastSubmissionAt: string | null;
    canvasserCount: number;
  };
  recentWindowCount: number;
  verifiedRate: number;
}) {
  const formUrl =
    typeof window !== "undefined"
      ? `${process.env.NEXT_PUBLIC_COLLECT_BASE_URL || window.location.origin}/c/${campaign.slug}`
      : "";

  const handleCopyFormLink = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      toast.success("Form link copied");
    } catch {
      toast.error("Failed to copy form link");
    }
  };

  return (
    <Card className="border-border/60 overflow-hidden rounded-sm shadow-none">
      <CardContent className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-primary font-mono text-[10px] font-black tracking-widest uppercase">
              {campaign.party}
            </span>
            <span
              className={`inline-flex items-center rounded-sm border px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest uppercase ${STATUS_STYLES[campaign.status] ?? ""}`}
            >
              {capitalize(campaign.status)}
            </span>
            <span className="border-border/60 inline-flex items-center rounded-sm border px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest uppercase">
              {campaign.enabledLgaCount} Active LGA
              {campaign.enabledLgaCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-2.5">
            <h1 className="text-foreground text-[1.6rem] leading-none font-black tracking-tight text-balance sm:text-[1.95rem] lg:text-[2.15rem]">
              {campaign.candidateTitle && (
                <span className="text-muted-foreground mr-2 text-[0.68em] font-medium">
                  {campaign.candidateTitle}
                </span>
              )}
              {campaign.candidateName}
            </h1>
            <p className="text-muted-foreground max-w-3xl text-[11px] leading-relaxed font-semibold tracking-[0.22em] uppercase">
              {campaign.constituency}
            </p>
          </div>

          <div className="border-border/60 bg-muted/10 rounded-sm border px-4 py-4">
            <div className="flex items-center gap-2">
              <IconBroadcast className="text-primary h-4 w-4" />
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Campaign Status
              </p>
            </div>
            <p className="text-foreground mt-2 text-sm font-medium">
              {STATUS_COPY[campaign.status] ??
                "Private campaign reporting is available for this campaign."}
            </p>
            <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <IconClock className="h-3.5 w-3.5" />
                Last activity {timeAgo(health.lastSubmissionAt)}
              </span>
              {health.canvasserCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <IconUsersGroup className="h-3.5 w-3.5" />
                  {health.canvasserCount} canvasser
                  {health.canvasserCount === 1 ? "" : "s"} in field
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <IconShieldCheck className="h-3.5 w-3.5" />
                {verifiedRate}% verified
              </span>
            </div>
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              {recentWindowCount.toLocaleString()} registrations were captured
              in the last 7 days.
            </p>
          </div>
        </div>

        <div className="grid content-start gap-3 lg:border-l lg:pl-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="border-border/60 rounded-sm border px-4 py-4">
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Supporters Captured
              </p>
              <p className="text-foreground mt-2 font-mono text-3xl font-semibold">
                {total.toLocaleString()}
              </p>
            </div>

            <div className="border-border/60 rounded-sm border px-4 py-4">
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Last 7 Days
              </p>
              <p className="text-foreground mt-2 font-mono text-3xl font-semibold">
                {recentWindowCount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="border-border/60 bg-muted/10 rounded-sm border px-4 py-4">
            <div className="space-y-1.5">
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Coverage Brief
              </p>
              <p className="text-foreground text-sm leading-relaxed font-medium">
                <span className="capitalize">{campaign.constituencyType}</span>{" "}
                scope across {campaign.enabledLgaCount.toLocaleString()} active
                LGA{campaign.enabledLgaCount === 1 ? "" : "s"}.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-11 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
            onClick={handleCopyFormLink}
          >
            <IconCopy className="mr-2 h-4 w-4" />
            Copy Form Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
