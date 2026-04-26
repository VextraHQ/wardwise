"use client";

import type { CSSProperties } from "react";
import { AppFooter } from "@/components/layout/app-footer";
import { ReportSiteHeader } from "@/components/campaign-report/report-site-header";

export const REPORT_SITE_HEADER_HEIGHT = "calc(3.75rem + 1px)";

export function ReportSiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-background relative min-h-screen"
      style={
        {
          "--report-site-header-height": REPORT_SITE_HEADER_HEIGHT,
        } as CSSProperties
      }
    >
      <div className="relative z-10 flex min-h-screen flex-col">
        <ReportSiteHeader />

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </div>

        <AppFooter />
      </div>
    </div>
  );
}
