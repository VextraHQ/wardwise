"use client";

import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconMapPin,
  IconReport,
  IconSettings,
  IconUsers,
  IconPlus,
  IconClipboardList,
  IconMessageCircle,
  IconBell,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/dashboard/nav-documents";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
import { NavUser } from "@/components/dashboard/nav-user";
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
      title: "Surveys",
      url: "/dashboard/surveys",
      icon: IconClipboardList,
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
      title: "Create Survey",
      url: "/dashboard/surveys/create",
      icon: IconPlus,
    },
    {
      title: "Send Message",
      url: "/dashboard/messages",
      icon: IconMessageCircle,
    },
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
      name: "Campaign Reports",
      url: "/dashboard/reports",
      icon: IconReport,
    },
    {
      name: "Export Data",
      url: "/dashboard/export",
      icon: IconFileDescription,
    },
    {
      name: "Messages",
      url: "/dashboard/messages",
      icon: IconMessageCircle,
    },
    {
      name: "Notifications",
      url: "/dashboard/notifications",
      icon: IconBell,
    },
    {
      name: "Chart Patterns",
      url: "/dashboard/charts",
      icon: IconChartBar,
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
