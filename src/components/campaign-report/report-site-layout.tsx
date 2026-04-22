"use client";

import { Header } from "@/components/layout/header";
import { AppFooter } from "@/components/layout/app-footer";

export function ReportSiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header badge="Private Campaign Report" />

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </div>

        <AppFooter />
      </div>
    </div>
  );
}
