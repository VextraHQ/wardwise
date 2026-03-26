"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { IconPlus, IconClipboardList } from "@tabler/icons-react";

type CampaignSummary = {
  id: string;
  slug: string;
  candidateName: string;
  party: string;
  constituency: string;
  status: string;
  _count: { submissions: number };
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border/60",
  active: "bg-primary/10 text-primary border-primary/30",
  paused: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  closed: "bg-destructive/10 text-destructive border-destructive/30",
};

interface CandidateCampaignsProps {
  candidateId: string;
}

export function CandidateCampaigns({ candidateId }: CandidateCampaignsProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: campaigns, isLoading } = useQuery<CampaignSummary[]>({
    queryKey: ["admin", "candidates", candidateId, "campaigns"],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/collect/campaigns?candidateId=${candidateId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const json = await res.json();
      return json.campaigns;
    },
    staleTime: 1000 * 60,
  });

  const totalPages = Math.max(
    1,
    Math.ceil((campaigns?.length ?? 0) / pageSize),
  );
  const safePage = Math.min(page, totalPages);
  const snOffset = (safePage - 1) * pageSize;

  const paginatedCampaigns = useMemo(() => {
    if (!campaigns) return [];
    const start = (safePage - 1) * pageSize;
    return campaigns.slice(start, start + pageSize);
  }, [campaigns, safePage, pageSize]);

  if (isLoading) {
    return (
      <div className="space-y-3 pt-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="pt-4">
        <Card className="border-border rounded-sm border-dashed shadow-none">
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <IconClipboardList className="text-muted-foreground h-10 w-10" />
            <p className="text-muted-foreground text-sm">
              No campaigns created for this candidate yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
              onClick={() => router.push("/admin/collect/campaigns/new")}
            >
              <IconPlus className="mr-1.5 h-3.5 w-3.5" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSubmissions = campaigns.reduce(
    (sum, c) => sum + c._count.submissions,
    0,
  );

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}{" "}
          <span className="text-muted-foreground/50">·</span>{" "}
          {totalSubmissions} submission{totalSubmissions !== 1 ? "s" : ""}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
          onClick={() => router.push("/admin/collect/campaigns/new")}
        >
          <IconPlus className="mr-1.5 h-3.5 w-3.5" />
          Create Campaign
        </Button>
      </div>

          <div className="overflow-x-auto rounded-sm border">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-muted-foreground h-10 w-14 text-center font-mono text-[10px] font-bold tracking-widest uppercase">
                    S/N
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Campaign
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase md:table-cell">
                    Submissions
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase lg:table-cell">
                    Constituency
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase sm:table-cell">
                    Created
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCampaigns.map((campaign, idx) => (
                  <TableRow
                    key={campaign.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() =>
                      router.push(`/admin/collect/campaigns/${campaign.id}`)
                    }
                  >
                    <TableCell className="text-muted-foreground text-center font-mono text-xs tabular-nums">
                      {snOffset + idx + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-sm font-medium">
                          {campaign.candidateName}
                        </span>
                        <span className="text-muted-foreground block font-mono text-xs">
                          /c/{campaign.slug}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${STATUS_STYLES[campaign.status] ?? ""}`}
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden font-mono text-sm tabular-nums md:table-cell">
                      {campaign._count.submissions}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-xs lg:table-cell">
                      {campaign.constituency || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-xs sm:table-cell">
                      {new Date(campaign.createdAt).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="pt-4">
            <AdminPagination
              currentPage={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={campaigns.length}
              itemLabel="campaigns"
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
    </div>
  );
}
