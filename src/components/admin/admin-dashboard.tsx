"use client";

import { useMemo } from "react";
import { useAdminCandidates } from "@/hooks/use-admin";
import { useCampaigns } from "@/hooks/use-collect";
import Link from "next/link";
import {
  HiExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineUsers,
} from "react-icons/hi";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CandidateCardSkeleton,
  StatCardSkeleton,
} from "@/components/admin/admin-skeletons";

export function AdminDashboard() {
  const { data: candidates = [], isLoading, error } = useAdminCandidates();

  const { data: campaigns = [] } = useCampaigns();

  const uniqueParties = useMemo(
    () =>
      Array.from(
        new Set(candidates.map((candidate) => candidate.party).filter(Boolean)),
      ).sort(),
    [candidates],
  );

  const totalSupporters = useMemo(
    () =>
      candidates.reduce(
        (runningTotal, candidate) =>
          runningTotal + (candidate.supporterCount ?? 0),
        0,
      ),
    [candidates],
  );

  const nationalCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.isNational).length,
    [candidates],
  );

  const totalCollectSubmissions = useMemo(
    () => campaigns.reduce((sum, c) => sum + (c._count?.submissions ?? 0), 0),
    [campaigns],
  );

  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => c.status === "active").length,
    [campaigns],
  );

  const latestCandidates = useMemo(
    () =>
      [...candidates]
        .sort(
          (left, right) =>
            new Date(right.user.createdAt).getTime() -
            new Date(left.user.createdAt).getTime(),
        )
        .slice(0, 5),
    [candidates],
  );

  const topPositions = useMemo(() => {
    const counts = candidates.reduce<Record<string, number>>(
      (acc, candidate) => {
        acc[candidate.position] = (acc[candidate.position] ?? 0) + 1;
        return acc;
      },
      {},
    );

    return Object.entries(counts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4);
  }, [candidates]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          asChild
          variant="outline"
          className="gap-2 rounded-sm font-mono text-[11px] tracking-widest uppercase"
        >
          <Link href="/admin/collect">
            <HiOutlineClipboardList className="h-4 w-4" />
            <span className="inline sm:hidden">Collect</span>
            <span className="hidden sm:inline">Collect Campaigns</span>
          </Link>
        </Button>
        <Button
          asChild
          className="gap-2 rounded-sm font-mono text-[11px] tracking-widest uppercase"
        >
          <Link href="/admin/candidates">
            <span>Manage Candidates</span>
            <HiOutlineArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="border-destructive/30 bg-destructive/10 rounded-sm shadow-none"
        >
          <HiExclamationCircle className="h-4 w-4" />
          <AlertTitle className="font-mono text-[11px] font-bold tracking-widest uppercase">
            Failed to load candidate accounts
          </AlertTitle>
          <AlertDescription className="text-destructive/80 text-xs">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred while loading candidates."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card className="border-border/60 rounded-sm shadow-none">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                <CardTitle className="text-muted-foreground min-w-0 pr-2 font-mono text-[10px] leading-relaxed font-bold tracking-widest uppercase">
                  Total Candidates
                </CardTitle>
                <div className="bg-primary/10 border-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border">
                  <HiOutlineUserGroup className="text-primary h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="font-mono text-[2rem] leading-none font-semibold tracking-tight tabular-nums">
                  {candidates.length}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  Candidate accounts
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 rounded-sm shadow-none">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                <CardTitle className="text-muted-foreground min-w-0 pr-2 font-mono text-[10px] leading-relaxed font-bold tracking-widest uppercase">
                  Total Supporters
                </CardTitle>
                <div className="bg-primary/10 border-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border">
                  <HiOutlineUsers className="text-primary h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="font-mono text-[2rem] leading-none font-semibold tracking-tight tabular-nums">
                  {totalSupporters.toLocaleString()}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  Across all candidates
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 rounded-sm shadow-none">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                <CardTitle className="text-muted-foreground min-w-0 pr-2 font-mono text-[10px] leading-relaxed font-bold tracking-widest uppercase">
                  Coverage
                </CardTitle>
                <div className="bg-primary/10 border-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border">
                  <HiOutlineBriefcase className="text-primary h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="font-mono text-[2rem] leading-none font-semibold tracking-tight tabular-nums">
                  {uniqueParties.length} parties
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  {nationalCandidates} national,{" "}
                  {candidates.length - nationalCandidates} constituency
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 hover:border-border group relative overflow-hidden rounded-sm shadow-none transition-colors">
              <div className="bg-primary/20 absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                <CardTitle className="text-muted-foreground min-w-0 pr-2 font-mono text-[10px] leading-relaxed font-bold tracking-widest uppercase">
                  Collect Campaigns
                </CardTitle>
                <div className="bg-primary/10 border-primary/20 group-hover:bg-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border transition-colors">
                  <HiOutlineClipboardList className="text-primary h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="font-mono text-[2rem] leading-none font-semibold tracking-tight tabular-nums">
                  {campaigns.length}
                </div>
                <div className="text-muted-foreground mt-2 flex items-start gap-2 text-sm">
                  {activeCampaigns > 0 && (
                    <span className="relative mt-1 flex h-1.5 w-1.5 shrink-0">
                      <span className="bg-victory absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                      <span className="bg-victory relative inline-flex h-1.5 w-1.5 rounded-full"></span>
                    </span>
                  )}
                  <span>{activeCampaigns} live campaigns</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 rounded-sm shadow-none">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                <CardTitle className="text-muted-foreground min-w-0 pr-2 font-mono text-[10px] leading-relaxed font-bold tracking-widest uppercase">
                  Collect Registrations
                </CardTitle>
                <div className="bg-primary/10 border-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border">
                  <HiOutlineUsers className="text-primary h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="font-mono text-[2rem] leading-none font-semibold tracking-tight tabular-nums">
                  {totalCollectSubmissions.toLocaleString()}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  Total supporter registrations
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold tracking-tight">
                Recent Candidate Accounts
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-sm">
                Newly added candidate records across the current admin
                workspace.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              asChild
              className="shrink-0 rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              <Link href="/admin/candidates">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <CandidateCardSkeleton />
                <CandidateCardSkeleton />
              </div>
            ) : latestCandidates.length === 0 ? (
              <div className="border-border flex flex-col items-center gap-4 rounded-sm border border-dashed py-12 text-center">
                <HiOutlineUserGroup className="text-muted-foreground h-10 w-10" />
                <div className="space-y-1">
                  <p className="font-medium">No candidates yet</p>
                  <p className="text-muted-foreground text-sm">
                    Add your first candidate account to get started.
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
                >
                  <Link href="/admin/candidates/new">
                    <HiOutlineUsers className="mr-1.5 h-4 w-4" />
                    Create First Candidate
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {latestCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="border-border/60 bg-card/50 flex flex-col gap-2 rounded-sm border p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold tracking-tight">
                        {candidate.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                      >
                        {candidate.party}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {candidate.user.email}
                    </p>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                      <span>{candidate.position}</span>
                      {candidate.constituency && (
                        <span>{candidate.constituency}</span>
                      )}
                      <span>
                        Added{" "}
                        {new Date(candidate.user.createdAt).toLocaleDateString(
                          "en-NG",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-tight">
              Coverage Snapshot
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-sm">
              A quick read on how the current candidate base is distributed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Constituency-linked candidates
                </span>
                <span className="font-mono font-medium tabular-nums">
                  {candidates.length - nationalCandidates}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  National candidates
                </span>
                <span className="font-mono font-medium tabular-nums">
                  {nationalCandidates}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Distinct parties</span>
                <span className="font-mono font-medium tabular-nums">
                  {uniqueParties.length}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  Top Positions
                </h3>
                <Badge
                  variant="outline"
                  className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                >
                  {topPositions.length} tracked
                </Badge>
              </div>
              {topPositions.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Position data will appear here once candidate accounts exist.
                </p>
              ) : (
                <div className="space-y-3">
                  {topPositions.map(([position, count]) => (
                    <div key={position} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {position}
                        </span>
                        <span className="font-mono font-medium tabular-nums">
                          {count}
                        </span>
                      </div>
                      <div className="bg-muted h-2 rounded-sm">
                        <div
                          className="bg-primary h-2 rounded-sm"
                          style={{
                            width: `${(count / Math.max(candidates.length, 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
