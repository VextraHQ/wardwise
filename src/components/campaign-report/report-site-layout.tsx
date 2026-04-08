"use client";

import { HiMail } from "react-icons/hi";
import { HiArrowUpRight } from "react-icons/hi2";
import { Header } from "@/components/layout/header";
import { COMPANY_INFO } from "@/lib/data/legal-data";

export function ReportSiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header badge="Private Campaign Report" />

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
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
