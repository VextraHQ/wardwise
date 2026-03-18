"use client";

import { useSession } from "next-auth/react";
import { useCandidateProfile } from "@/hooks/use-candidate-dashboard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { IconHome } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function SiteHeader() {
  const { data: session } = useSession();
  const { data: candidateProfile, isLoading } = useCandidateProfile();

  const candidateName =
    candidateProfile?.name || session?.user?.name || "Candidate";
  const candidatePosition = candidateProfile?.position || "";

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-1 hidden data-[orientation=vertical]:h-4 sm:block"
        />
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="mt-1 h-4 w-32" />
            </>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground/50 hidden font-mono text-[10px] font-black tracking-[0.2em] uppercase sm:inline-block">
                  Candidate
                </span>
                <span className="text-muted-foreground/30 hidden font-mono text-xs sm:inline-block">
                  {"//"}
                </span>
                <h1 className="truncate text-sm font-bold tracking-tight sm:text-base">
                  {candidateName}
                </h1>
              </div>
              <p className="text-muted-foreground hidden truncate font-mono text-[11px] tracking-wider uppercase sm:block">
                Role: {candidatePosition || "Candidate"}
              </p>
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <div className="border-primary/20 bg-primary/5 hidden items-center gap-1.5 rounded-sm border px-2 py-0.5 sm:flex">
            <div className="bg-primary size-1.5 animate-pulse rounded-full" />
            <span className="text-primary font-mono text-[10px] font-black tracking-widest uppercase">
              Live
            </span>
          </div>
          <Button
            variant="ghost"
            asChild
            size="sm"
            className="text-muted-foreground gap-1.5 font-mono text-[11px] tracking-widest uppercase hover:text-gray-200"
          >
            <Link href="/" aria-label="Exit to Homepage">
              <IconHome className="size-4" />
              <span className="hidden sm:inline">Exit</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
