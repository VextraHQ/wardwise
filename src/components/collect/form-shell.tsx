"use client";

import { HiMail } from "react-icons/hi";
import { HiArrowUpRight } from "react-icons/hi2";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { COMPANY_INFO } from "@/lib/data/legal-data";
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
          <div className="mx-auto flex max-w-2xl flex-col items-start gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Badge
              variant="outline"
              className="bg-background border-primary/20 text-primary text-left text-[9px] font-black tracking-widest whitespace-normal uppercase shadow-sm"
            >
              {campaign.constituency}
            </Badge>
            <div className="flex items-center gap-2">
              <div className="bg-brand-emerald size-1.5 shrink-0 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                Registration
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-start px-4 py-8">
          {children}
        </div>

        <div className="border-border/40 border-t py-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
            <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-0">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider">
                © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights
                reserved.
              </p>
              <span className="text-muted-foreground/40 hidden sm:mx-2 sm:inline">
                ·
              </span>
              <p className="text-muted-foreground/70 font-mono text-[10px]">
                A Product of{" "}
                <a
                  href={COMPANY_INFO.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
                >
                  {COMPANY_INFO.legalName}
                </a>
              </p>
            </div>
            <a
              href="/contact"
              className="group border-border bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary flex items-center gap-2 rounded-full border px-4 py-2 transition-all"
            >
              <HiMail className="h-4 w-4" />
              <span className="text-xs font-medium">Contact Us</span>
              <HiArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
