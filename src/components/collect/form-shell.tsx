"use client";

import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import type { PublicCampaign } from "@/types/collect";

export function FormShell({
  children,
  campaign,
}: {
  children: React.ReactNode;
  campaign: PublicCampaign;
}) {
  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header badge={`${campaign.candidateName} — ${campaign.party}`} />

        <div className="border-border/40 bg-primary/5 border-b backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <div className="flex max-w-[70%] shrink-0 items-center gap-2 sm:gap-3">
              <Badge
                variant="outline"
                className="bg-background border-primary/20 text-primary shrink-0 text-left text-[9px] font-black tracking-widest whitespace-normal uppercase shadow-sm"
              >
                {campaign.constituency}
              </Badge>
              <span className="text-primary/60 hidden shrink-0 font-mono text-[9px] font-bold tracking-widest uppercase sm:inline-block">
                SYS_ACTIVE_NODE
              </span>
            </div>
            <div className="ml-3 flex min-w-0 items-center justify-end gap-2">
              <div className="bg-brand-emerald size-1.5 shrink-0 animate-pulse rounded-full" />
              <span className="text-muted-foreground truncate text-right text-[9px] font-black tracking-widest uppercase">
                <span className="hidden sm:inline">Supporter </span>Registration
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-start px-4 py-8">
          {children}
        </div>

        <div className="border-border/40 border-t py-4">
          <p className="text-muted-foreground/50 text-center text-[10px] font-medium tracking-widest uppercase">
            Powered by{" "}
            <span className="text-muted-foreground/70 font-bold">
              Vextra Limited
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
