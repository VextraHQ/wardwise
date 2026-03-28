"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { AppSidebar } from "@/components/candidate-dashboard/app-sidebar";
import { SiteHeader } from "@/components/candidate-dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// Removed CandidateDashboardSkeleton to prevent unused variable

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Redirect to login if not authenticated or not a candidate
    if (status === "unauthenticated") {
      redirect("/login");
    }
    if (status === "authenticated" && session?.user?.role !== "candidate") {
      redirect("/login");
    }
  }, [status, session]);

  // ─── "Always-On Shell" Pattern ──────────────────────────────────
  // Layout frame renders unconditionally. Each child component
  // handles its own loading state independently. This eliminates
  // the jarring "skeleton wall → real UI" double-transition.
  // ────────────────────────────────────────────────────────────────

  // Only bail out if we KNOW user is unauthorized
  if (
    status === "unauthenticated" ||
    (status === "authenticated" && session?.user?.role !== "candidate")
  ) {
    return null;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
