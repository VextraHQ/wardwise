"use client";

import * as React from "react";
import { Suspense } from "react";
import {
  IconDashboard,
  IconUsers,
  IconUserCircle,
  IconSettings,
  IconHome,
  IconChartBar,
  IconHistory,
  IconHelp,
} from "@tabler/icons-react";
import { NavMain } from "@/components/candidate-dashboard/nav-main";
import { NavSecondary } from "@/components/candidate-dashboard/nav-secondary";
import { AdminNavUser } from "@/components/admin/admin-nav-user";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { MapIcon } from "@heroicons/react/24/outline";

const adminNavItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: IconDashboard,
  },
  {
    title: "Candidates",
    url: "/admin?tab=candidates",
    icon: IconUsers,
  },
  {
    title: "Voters",
    url: "/admin?tab=voters",
    icon: IconUserCircle,
  },
  {
    title: "Analytics",
    url: "#",
    icon: IconChartBar,
  },
  {
    title: "Activity Logs",
    url: "#",
    icon: IconHistory,
  },
];

const adminSecondaryItems = [
  {
    title: "Settings",
    url: "#",
    icon: IconSettings,
  },
  {
    title: "Help & Docs",
    url: "#",
    icon: IconHelp,
  },
  {
    title: "Home",
    url: "/",
    icon: IconHome,
  },
];

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-0!"
            >
              <Link href="/">
                <div className="from-primary flex size-8 items-center justify-center rounded-lg bg-linear-to-br via-[#2f7f6b] to-[#163a30] text-white">
                  <MapIcon className="size-4" />
                </div>
                <span className="text-base font-semibold">WardWise</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <Suspense
          fallback={
            <div className="space-y-2 px-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          }
        >
          <NavMain items={adminNavItems} />
        </Suspense>
        <NavSecondary items={adminSecondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
