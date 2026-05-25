"use client";

import {
  IconUsers,
  IconBuildingCommunity,
  IconClipboardList,
} from "@tabler/icons-react";

import { Card, CardContent } from "@/components/ui/card";

export function CandidateOverviewStatsCard({
  campaignCount,
  supporterCount,
  canvasserCount,
}: {
  campaignCount: number;
  supporterCount: number;
  canvasserCount: number;
}) {
  const stats = [
    {
      label: "Campaigns",
      value: campaignCount,
      hint: "Collect campaigns created for this candidate",
      icon: IconClipboardList,
    },
    {
      label: "Supporters",
      value: supporterCount,
      hint: "Unique supporters recorded from Collect submissions",
      icon: IconUsers,
    },
    {
      label: "Canvassers",
      value: canvasserCount,
      hint: "Field agents assigned to this candidate",
      icon: IconBuildingCommunity,
    },
  ];

  return (
    <Card
      className="border-border/60 gap-0 overflow-hidden rounded-sm p-0 shadow-none"
      role="region"
      aria-label="Collect activity"
    >
      <CardContent className="p-0">
        <div className="divide-border/60 divide-y sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-row items-center justify-between gap-3 px-4 py-3 sm:flex-col sm:items-stretch sm:gap-3 sm:px-6 sm:py-4"
              title={stat.hint}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:w-full sm:flex-initial sm:items-start sm:justify-between sm:gap-3">
                <div className="bg-primary/10 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm sm:order-2 sm:h-8 sm:w-8">
                  <stat.icon
                    className="text-primary size-3.5 sm:size-4"
                    aria-hidden
                  />
                </div>
                <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase sm:order-1">
                  {stat.label}
                </p>
              </div>
              <p className="text-foreground font-mono text-lg leading-none font-semibold tracking-tight tabular-nums sm:w-full sm:text-2xl sm:leading-none">
                {stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
