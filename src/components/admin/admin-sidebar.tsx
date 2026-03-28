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
import { Logo } from "@/components/layout/logo";

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
              <Logo variant="offwhite" size="sm" className="gap-2 px-1" />
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
