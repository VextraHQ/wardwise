"use client";

import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  quickActions,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
  quickActions?: {
    title: string;
    url: string;
    icon: Icon;
  }[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {quickActions && quickActions.length > 0 && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    tooltip="Quick Actions"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground w-full duration-200 ease-linear"
                  >
                    <IconCirclePlusFilled />
                    <span>Quick Actions</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {quickActions.map((action) => (
                    <DropdownMenuItem key={action.title} asChild>
                      <Link
                        href={action.url}
                        className="flex items-center gap-2"
                      >
                        <action.icon className="hover:text-primary-foreground size-4" />
                        <span>{action.title}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarMenu>
          {items.map((item) => {
            // Check if URL matches pathname exactly, or if it's a query param match
            const urlPath = item.url.split("?")[0];
            const urlParams = new URLSearchParams(item.url.split("?")[1] || "");
            const currentTab = searchParams?.get("tab");
            const itemTab = urlParams.get("tab");

            const isActive =
              pathname === item.url ||
              (pathname === urlPath &&
                ((itemTab && currentTab === itemTab) ||
                  (!itemTab && !currentTab && pathname === urlPath)));

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
