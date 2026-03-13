"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  HiOutlineRefresh,
  HiOutlineHome,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import Link from "next/link";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export function AdminHeader() {
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    toast.success("Data refreshed");
  };

  // Check if any queries are fetching
  const isRefreshing = queryClient.isFetching({ queryKey: ["admin"] }) > 0;

  const getBreadcrumbTitle = () => {
    if (pathname.startsWith("/admin/candidates")) {
      return "Candidates";
    }
    if (pathname === "/admin") return "Dashboard";
    if (pathname.startsWith("/admin/collect")) return "Collect";
    if (pathname.includes("/analytics")) return "Analytics";
    if (pathname.includes("/activity")) return "Activity Logs";
    if (pathname.includes("/settings")) return "Settings";
    if (pathname.includes("/help")) return "Help & Documentation";
    if (pathname.includes("/export")) return "Export Data";
    return "Candidate Management";
  };

  const getDescription = () => {
    if (pathname === "/admin") {
      return "Platform overview for candidate coverage, readiness, and upcoming Collect operations";
    }

    if (pathname.startsWith("/admin/candidates")) {
      return "Dedicated candidate account management with search, filters, and account actions";
    }

    return "Administrative controls and management";
  };

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-1 hidden data-[orientation=vertical]:h-4 sm:block"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold sm:text-base">
              {getBreadcrumbTitle()}
            </h1>
            <Badge
              variant="default"
              className="bg-primary/10 text-primary border-primary/20 hidden items-center gap-1 sm:inline-flex"
            >
              <HiOutlineShieldCheck className="h-3 w-3" />
              <span>Super Admin</span>
            </Badge>
          </div>
          <p className="text-muted-foreground hidden truncate text-xs sm:block">
            {getDescription()}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <HiOutlineRefresh
              className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" asChild size="sm" className="gap-1.5">
            <Link href="/" aria-label="Home">
              <HiOutlineHome className="size-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
