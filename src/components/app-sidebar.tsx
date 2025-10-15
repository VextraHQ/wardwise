"use client";

import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconMapPin,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconUserCheck,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
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
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Supporters",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "Ward Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Campaign Map",
      url: "#",
      icon: IconMapPin,
    },
    {
      title: "Voter Outreach",
      url: "#",
      icon: IconUserCheck,
    },
  ],
  navClouds: [
    {
      title: "Campaign Tools",
      icon: IconFileDescription,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Campaigns",
          url: "#",
        },
        {
          title: "Archived Campaigns",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Voter Database",
      url: "#",
      icon: IconUsers,
    },
    {
      name: "Campaign Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Ward Insights",
      url: "#",
      icon: IconMapPin,
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
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <div className="from-primary flex size-8 items-center justify-center rounded-lg bg-gradient-to-br via-[#2f7f6b] to-[#163a30] text-white">
                  <MapIcon className="size-4" />
                </div>
                <span className="text-base font-semibold">WardWise</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
