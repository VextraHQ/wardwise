"use client";

import * as React from "react";

import { signOut, useSession } from "next-auth/react";
import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
  IconSettings,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { resetAnalyticsIdentity } from "@/lib/analytics/client";

export function AdminNavUser() {
  const { data: session, status } = useSession();
  const { isMobile } = useSidebar();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = () => {
    resetAnalyticsIdentity();
    signOut({ callbackUrl: "/" });
  };

  const user = {
    name: session?.user?.name || "Admin",
    email: session?.user?.email || "admin@wardwise.ng",
  };

  const isLoadingSession = status === "loading" || !mounted;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-sm">
                {isLoadingSession ? (
                  <div className="bg-muted/30 border-border/50 size-full animate-pulse rounded-sm border" />
                ) : (
                  <AvatarFallback className="text-primary-foreground bg-primary rounded-sm">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {isLoadingSession ? (
                  <>
                    <span className="text-sidebar-foreground/60 animate-pulse truncate font-mono text-[10px] font-bold tracking-widest uppercase">
                      Syncing...
                    </span>
                    <span className="text-sidebar-foreground/40 truncate font-mono text-[9px] tracking-widest uppercase">
                      ID_FETCH
                    </span>
                  </>
                ) : (
                  <>
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="text-sidebar-foreground/40 truncate text-xs">
                      {user.email}
                    </span>
                  </>
                )}
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-sm"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-sm">
                  <AvatarFallback className="rounded-sm">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle className="hover:text-primary-foreground" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconSettings className="hover:text-primary-foreground" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive/80 focus:text-destructive/80 focus:bg-destructive/10 hover:bg-destructive/10"
            >
              <IconLogout className="hover:text-primary-foreground" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
