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

import { NavDocuments } from "@/components/layout/sidebar/nav-documents";
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavSecondary } from "@/components/layout/sidebar/nav-secondary";
import { NavUser } from "@/components/layout/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/layout/logo";

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

export function CandidateSidebar({
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
              <Logo variant="offwhite" size="sm" className="gap-2 px-1" />
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
