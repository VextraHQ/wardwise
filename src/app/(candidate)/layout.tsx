"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { AppSidebar } from "@/components/candidate-dashboard/app-sidebar";
import { SiteHeader } from "@/components/candidate-dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col sm:flex-row">
        <div className="hidden w-64 border-r p-4 sm:block">
          <Skeleton className="h-12 w-full" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex-1 p-4 sm:p-6">
          <Skeleton className="mb-4 h-12 w-full sm:mb-6 sm:h-16" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === "unauthenticated" || session?.user?.role !== "candidate") {
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
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
