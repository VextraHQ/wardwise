"use client";

import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  quickActions,
  label,
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
  label?: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
          {label}
        </SidebarGroupLabel>
      )}
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
                    <span className="mt-0.5 font-mono text-[11px] font-bold tracking-widest uppercase">
                      Quick Actions
                    </span>
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
            const urlPath = item.url.split("?")[0];
            const isExactMatchOnly =
              urlPath === "/" ||
              urlPath === "/admin" ||
              urlPath === "/dashboard";
            const matchesNestedRoute =
              !isExactMatchOnly &&
              urlPath !== "/" &&
              pathname.startsWith(`${urlPath}/`);
            const isActive =
              item.url !== "#" && (pathname === urlPath || matchesNestedRoute);

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
