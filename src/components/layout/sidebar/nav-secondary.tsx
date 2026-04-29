"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuBadge,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
    disabled?: boolean;
    badge?: string;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarGroupLabel className="text-sidebar-foreground/50 font-mono text-[10px] font-bold tracking-widest uppercase">
          System
        </SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              !item.disabled && item.url !== "#" && pathname === item.url;
            return (
              <SidebarMenuItem key={item.title} className="relative">
                {item.disabled ? (
                  <>
                    <SidebarMenuButton
                      tooltip={item.title}
                      type="button"
                      aria-disabled="true"
                      className="text-sidebar-foreground/45 hover:bg-transparent hover:text-sidebar-foreground/45 active:bg-transparent active:text-sidebar-foreground/45 cursor-default pr-14"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge className="text-sidebar-foreground/45 right-2 rounded-xs border border-current/15 px-1.5 font-mono text-[9px] font-bold tracking-widest uppercase">
                        {item.badge}
                      </SidebarMenuBadge>
                    ) : null}
                  </>
                ) : (
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
