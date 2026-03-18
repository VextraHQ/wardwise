"use client";

import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconMapPin,
  IconSettings,
  IconUsers,
  IconBell,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/candidate-dashboard/nav-documents";
import { NavMain } from "@/components/candidate-dashboard/nav-main";
import { NavSecondary } from "@/components/candidate-dashboard/nav-secondary";
import { NavUser } from "@/components/candidate-dashboard/nav-user";
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
import { HiMap } from "react-icons/hi";

const data = {
  user: {
    name: "Hon. Bello",
    email: "bello@wardwise.ng",
    avatar: "/avatars/candidate.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Supporters",
      url: "/dashboard/supporters",
      icon: IconUsers,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
    {
      title: "Wards",
      url: "/dashboard/wards",
      icon: IconMapPin,
    },
  ],
  quickActions: [
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: IconBell,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/dashboard/help",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Export Data",
      url: "/dashboard/export",
      icon: IconFileDescription,
    },
    {
      name: "Notifications",
      url: "/dashboard/notifications",
      icon: IconBell,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                <div className="from-primary flex size-8 items-center justify-center rounded-sm bg-linear-to-br via-[#2f7f6b] to-[#163a30] text-white">
                  <HiMap className="h-4 w-4" />
                </div>
                <span className="text-base font-bold tracking-tight">WardWise</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} quickActions={data.quickActions} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
