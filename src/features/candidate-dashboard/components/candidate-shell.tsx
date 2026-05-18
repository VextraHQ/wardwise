"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CandidateSidebar } from "@/features/candidate-dashboard/components/candidate-sidebar";
import { SiteHeader } from "@/features/candidate-dashboard/components/site-header";

export function CandidateShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <CandidateSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
