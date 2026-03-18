"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  HiExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineUsers,
} from "react-icons/hi";
import { adminApi } from "@/lib/api/admin";
import { adminCollectApi } from "@/lib/api/collect";
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
  const {
    data: candidates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "candidates"],
    queryFn: () => adminApi.candidates.getAll(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const res = await adminCollectApi.getCampaigns();
      return res.campaigns;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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
        (runningTotal, candidate) => runningTotal + candidate.supporters,
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
            <span>Collect Campaigns</span>
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
          className="border-destructive/50 bg-destructive/10"
        >
          <HiExclamationCircle className="h-4 w-4" />
          <AlertTitle>Failed to load candidate accounts</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred while loading candidates."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  Total Candidates
                </CardTitle>
                <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-sm">
                  <HiOutlineUserGroup className="text-primary h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="font-mono text-2xl font-semibold tabular-nums">
                  {candidates.length}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Candidate accounts
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 rounded-sm shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  Total Supporters
                </CardTitle>
                <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-sm">
                  <HiOutlineUsers className="text-primary h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="font-mono text-2xl font-semibold tabular-nums">
                  {totalSupporters.toLocaleString()}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Across all candidates
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 rounded-sm shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  Coverage
                </CardTitle>
                <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-sm">
                  <HiOutlineBriefcase className="text-primary h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="font-mono text-2xl font-semibold tabular-nums">
                  {uniqueParties.length} parties
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {nationalCandidates} national,{" "}
                  {candidates.length - nationalCandidates} constituency
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 rounded-sm shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  Collect Campaigns
                </CardTitle>
                <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-sm">
                  <HiOutlineClipboardList className="text-primary h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="font-mono text-2xl font-semibold tabular-nums">
                  {campaigns.length}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {activeCampaigns} active
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 rounded-sm shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  Collect Registrations
                </CardTitle>
                <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-sm">
                  <HiOutlineUsers className="text-primary h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="font-mono text-2xl font-semibold tabular-nums">
                  {totalCollectSubmissions.toLocaleString()}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
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
              <div className="border-border/60 rounded-sm border border-dashed py-10 text-center">
                <HiOutlineUserGroup className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                <p className="text-muted-foreground mb-1 font-medium">
                  No candidates available yet
                </p>
                <p className="text-muted-foreground text-sm">
                  Candidate accounts will appear here once they are created.
                </p>
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
                        variant="secondary"
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
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
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
