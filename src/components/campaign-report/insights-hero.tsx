"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { capitalize } from "@/lib/helpers/campaign-report";
import { IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";
import { STATUS_STYLES } from "./insights-helpers";

export function InsightsHero({
  campaign,
  total,
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
      <CardContent className="space-y-4 sm:space-y-0">
        {/* Mobile: big number first, then identity */}
        <div className="border-border/60 flex items-center justify-between border-b pb-4 sm:hidden">
          <div>
            <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              Supporters Captured
            </p>
            <p className="text-foreground mt-1 font-mono text-4xl font-semibold tabular-nums">
              {total.toLocaleString()}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 shrink-0 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
            onClick={handleCopyFormLink}
          >
            <IconCopy className="mr-1.5 h-3.5 w-3.5" />
            Copy Link
          </Button>
        </div>

        {/* Desktop: horizontal layout */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-2.5">
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
                <span className="capitalize">{campaign.constituencyType}</span>
                &nbsp;· {campaign.enabledLgaCount} LGA
                {campaign.enabledLgaCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-foreground text-[1.5rem] leading-tight font-black tracking-tight text-balance sm:text-[1.95rem] lg:text-[2.15rem]">
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

            {/* Copy link — desktop only (mobile has it in the top bar) */}
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground -ml-2 hidden h-8 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase sm:inline-flex"
              onClick={handleCopyFormLink}
            >
              <IconCopy className="mr-1.5 h-3.5 w-3.5" />
              Copy Form Link
            </Button>
          </div>

          {/* Desktop big number */}
          <div className="hidden shrink-0 flex-col items-end text-right sm:flex sm:border-l sm:pl-6">
            <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              Supporters
            </p>
            <p className="text-foreground mt-1 font-mono text-4xl font-semibold tabular-nums">
              {total.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
