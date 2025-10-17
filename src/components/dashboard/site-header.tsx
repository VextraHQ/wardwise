import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { IconHome } from "@tabler/icons-react";

export function SiteHeader() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-1 hidden data-[orientation=vertical]:h-4 sm:block"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold sm:text-base">
            Welcome Back, Hon. Adamu Ibrahim
          </h1>
          <p className="text-muted-foreground hidden truncate text-xs sm:block">
            House of Representatives Candidate
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Badge
            variant="outline"
            className="border-primary/30 text-primary hidden sm:inline-flex"
          >
            Live
          </Badge>
          <Button
            variant="ghost"
            asChild
            size="sm"
            className="text-muted-foreground gap-1.5 hover:text-white"
          >
            <a href="/">
              <IconHome className="size-4" />
              <span className="hidden sm:inline">Home</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
