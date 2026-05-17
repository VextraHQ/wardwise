import * as React from "react";
import {
  IconDashboard,
  IconUsers,
  IconClipboardList,
  IconHistory,
  IconSettings,
  IconHome,
  IconMapPin,
} from "@tabler/icons-react";
import { NavMain } from "@/components/shared/sidebar/nav-main";
import { NavSecondary } from "@/components/shared/sidebar/nav-secondary";
import { NavUser } from "@/components/shared/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/shared/logo";

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
];

const adminSecondaryItems = [
  {
    title: "Audit Log",
    url: "#",
    icon: IconHistory,
    disabled: true,
    badge: "Soon",
  },
  {
    title: "Settings",
    url: "#",
    icon: IconSettings,
    disabled: true,
    badge: "Soon",
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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
