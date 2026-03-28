import * as React from "react";
import {
  IconDashboard,
  IconUsers,
  IconClipboardList,
  IconSettings,
  IconHome,
  IconChartBar,
  IconHistory,
  IconHelp,
  IconMapPin,
} from "@tabler/icons-react";
import { NavMain } from "@/components/candidate-dashboard/nav-main";
import { NavSecondary } from "@/components/candidate-dashboard/nav-secondary";
import { AdminNavUser } from "@/components/admin/admin-nav-user";
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

const adminNavItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: IconDashboard,
  },
  {
    title: "Candidates",
    url: "/admin/candidates",
    icon: IconUsers,
  },
  {
    title: "Collect",
    url: "/admin/collect",
    icon: IconClipboardList,
  },
  {
    title: "Geo Data",
    url: "/admin/geo",
    icon: IconMapPin,
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
                <div className="from-primary flex size-8 items-center justify-center rounded-sm bg-linear-to-br via-[#2f7f6b] to-[#163a30] text-white">
                  <HiMap className="h-4 w-4" />
                </div>
                <span className="text-base font-bold tracking-tight">
                  WardWise
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminNavItems} label="Operations" />
        <NavSecondary items={adminSecondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
