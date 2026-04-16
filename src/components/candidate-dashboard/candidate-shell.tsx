"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CandidateSidebar } from "@/components/candidate-dashboard/candidate-sidebar";
import { SiteHeader } from "@/components/candidate-dashboard/site-header";

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
