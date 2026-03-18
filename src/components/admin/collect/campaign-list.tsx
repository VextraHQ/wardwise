"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconPlus,
  IconEye,
  IconClipboardList,
  IconPlayerPlay,
  IconUsers,
  IconClipboard,
} from "@tabler/icons-react";
import { useCampaigns } from "@/hooks/use-collect";
import type { CampaignSummary } from "@/types/collect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPagination } from "@/components/admin/admin-pagination";

function statusVariant(status: string) {
  switch (status) {
    case "draft":
      return "secondary";
    case "active":
      return "default";
    case "paused":
      return "outline";
    case "closed":
      return "destructive";
    default:
      return "secondary";
  }
}

const STATUS_DOT: Record<string, string> = {
  draft: "bg-muted-foreground",
  active: "bg-emerald-500",
  paused: "bg-orange-500",
  closed: "bg-destructive",
};

function StatsBar({ campaigns }: { campaigns: CampaignSummary[] }) {
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalSubmissions = campaigns.reduce(
    (sum, c) => sum + c._count.submissions,
    0,
  );

  const stats = [
    {
      label: "Total Campaigns",
      value: totalCampaigns,
      subtitle: "Registration campaigns",
      icon: IconClipboardList,
    },
    {
      label: "Active",
      value: activeCampaigns,
      subtitle: `of ${totalCampaigns} campaigns`,
      icon: IconPlayerPlay,
    },
    {
      label: "Total Submissions",
      value: totalSubmissions.toLocaleString(),
      subtitle: "Supporter registrations",
      icon: IconUsers,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-border/60 rounded-sm shadow-none"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              {stat.label}
            </CardTitle>
            <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-sm">
              <stat.icon className="text-primary h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-mono text-2xl font-semibold tabular-nums">
              {stat.value}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatsBarSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-9 rounded-sm" />
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <Table>
      <TableHeader className="bg-muted/30">
        <TableRow>
          <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
            Candidate
          </TableHead>
          <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
            Slug
          </TableHead>
          <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
            Constituency
          </TableHead>
          <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
            Status
          </TableHead>
          <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
            Submissions
          </TableHead>
          <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
            Created
          </TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 7 }).map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-4 w-24" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmptyState() {
  return (
    <div className="border-border/60 flex flex-col items-center justify-center gap-4 rounded-sm border border-dashed py-16">
      <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-sm">
        <IconClipboard className="text-muted-foreground h-7 w-7" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-foreground font-medium">No campaigns yet</p>
        <p className="text-muted-foreground text-sm">
          Create your first campaign to start collecting registrations.
        </p>
      </div>
      <Button
        asChild
        size="sm"
        className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
      >
        <Link href="/admin/collect/campaigns/new">
          <IconPlus className="mr-1.5 h-4 w-4" />
          New Campaign
        </Link>
      </Button>
    </div>
  );
}

export function CampaignList() {
  const { data: campaigns, isLoading, error } = useCampaigns();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalItems = campaigns?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedCampaigns = useMemo(() => {
    if (!campaigns) return [];
    const start = (page - 1) * pageSize;
    return campaigns.slice(start, start + pageSize);
  }, [campaigns, page, pageSize]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Stats */}
      {isLoading ? (
        <StatsBarSkeleton />
      ) : campaigns ? (
        <StatsBar campaigns={campaigns} />
      ) : null}

      {/* Header + action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Campaigns</h2>
          {!isLoading && campaigns && campaigns.length > 0 && (
            <p className="text-muted-foreground text-sm">
              {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}{" "}
              total
            </p>
          )}
        </div>
        <Button
          asChild
          size="sm"
          className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
        >
          <Link href="/admin/collect/campaigns/new">
            <IconPlus className="mr-1.5 h-4 w-4" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="overflow-x-auto rounded-sm border">
          <TableSkeleton />
        </div>
      ) : error ? (
        <div className="rounded-sm border p-6">
          <p className="text-destructive text-sm">Failed to load campaigns.</p>
        </div>
      ) : campaigns && campaigns.length === 0 ? (
        <div className="rounded-sm border">
          <EmptyState />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-sm border">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Candidate
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase sm:table-cell">
                    Constituency
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                    Submissions
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase md:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 w-[80px] font-mono text-[10px] font-bold tracking-widest uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCampaigns.map((campaign: CampaignSummary) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{campaign.candidateName}</p>
                        <p className="text-muted-foreground text-xs">
                          {campaign.party} &middot;{" "}
                          <code className="text-[11px]">
                            /c/{campaign.slug}
                          </code>
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {campaign.constituency}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant(campaign.status)}
                        className="gap-1.5 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                      >
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[campaign.status] ?? "bg-muted-foreground"}`}
                        />
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium tabular-nums">
                      {campaign._count.submissions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {new Date(campaign.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
                      >
                        <Link href={`/admin/collect/campaigns/${campaign.id}`}>
                          <IconEye className="mr-1 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            itemLabel="campaigns"
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}
