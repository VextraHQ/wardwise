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
    if (pathname.startsWith("/admin/geo")) return "Geo Data";
    if (pathname.startsWith("/admin/analytics")) return "Analytics";
    if (pathname.startsWith("/admin/activity")) return "Activity Logs";
    if (pathname.startsWith("/admin/settings")) return "Settings";
    if (pathname.startsWith("/admin/help")) return "Help & Documentation";
    if (pathname.startsWith("/admin/export")) return "Export Data";
    return "Candidate Management";
  };

  const getDescription = () => {
    if (pathname === "/admin") {
      return "Platform overview for candidate coverage, readiness, and upcoming Collect operations";
    }

    if (pathname.startsWith("/admin/candidates")) {
      return "Dedicated candidate account management with search, filters, and account actions";
    }

    if (pathname.startsWith("/admin/geo")) {
      return "Browse and manage geographic data across Nigeria";
    }

    return "Administrative controls and management";
  };

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-0.5 data-[orientation=vertical]:h-4"
        />
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-foreground/50 shrink-0 font-mono text-[9px] font-black tracking-[0.2em] uppercase sm:text-[10px]">
              Admin
            </span>
            <span className="text-foreground/30 shrink-0 font-mono text-[10px] sm:text-xs">
              {"//"}
            </span>
            <h1 className="truncate text-sm font-bold tracking-tight">
              {getBreadcrumbTitle()}
            </h1>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 hidden shrink-0 items-center gap-1 rounded-sm px-1.5 py-px font-mono text-[9px] font-bold tracking-widest uppercase sm:inline-flex sm:px-2 sm:py-0.5 sm:text-[10px]"
            >
              <HiOutlineShieldCheck className="h-3 w-3" />
              <span>Super Admin</span>
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 hidden truncate text-xs sm:text-sm md:block">
            {getDescription()}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
          >
            <HiOutlineRefresh
              className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="ghost"
            asChild
            size="sm"
            className="text-foreground/50 gap-1.5 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase transition-colors hover:text-gray-200"
          >
            <Link href="/" aria-label="Home">
              <HiOutlineHome className="size-4" />
              <span className="hidden sm:inline">Exit</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
