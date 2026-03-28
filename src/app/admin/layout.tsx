"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// Removed AdminDashboardSkeleton import to prevent unused variable

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Redirect to login if not authenticated or not an admin
    if (status === "unauthenticated") {
      redirect("/login");
    }
    if (status === "authenticated" && session?.user?.role !== "admin") {
      redirect("/login");
    }
  }, [status, session]);

  // ─── "Always-On Shell" Pattern ──────────────────────────────────
  // The layout frame (sidebar, header) renders IMMEDIATELY and
  // unconditionally. Each component inside the shell (NavUser,
  // page content) independently handles its own loading state.
  //
  // This eliminates the "double skeleton" problem:
  //   ❌ Old: Skeleton wall → Shell appears → Content skeletons → Data
  //   ✅ New: Shell appears instantly → Content area loads in-place
  // ────────────────────────────────────────────────────────────────

  // Don't render anything only if we KNOW user is unauthorized
  if (
    status === "unauthenticated" ||
    (status === "authenticated" && session?.user?.role !== "admin")
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
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <AdminHeader />
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
