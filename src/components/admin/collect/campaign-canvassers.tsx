"use client";

import { useCampaignCanvassers } from "@/hooks/use-collect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { IconTrophy } from "@tabler/icons-react";

export function CampaignCanvassers({ campaignId }: { campaignId: string }) {
  const { data: canvassers = [], isLoading } =
    useCampaignCanvassers(campaignId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (canvassers.length === 0) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground py-12 text-center">
          No canvasser data yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <IconTrophy className="text-primary h-4 w-4" />
        <h3 className="text-sm font-semibold tracking-tight">Canvasser Leaderboard</h3>
      </div>
      <div className="overflow-x-auto rounded-sm border">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0 z-10">
            <TableRow>
              <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase w-14 text-center">S/N</TableHead>
              <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">Name</TableHead>
              <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">Phone</TableHead>
              <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase text-right">Registrations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {canvassers.map((c, i) => (
              <TableRow
                key={`${c.canvasserName}-${c.canvasserPhone}`}
                className="hover:bg-muted/30"
              >
                <TableCell className="text-muted-foreground text-center text-xs font-medium">
                  {i + 1}
                </TableCell>
                <TableCell>{c.canvasserName}</TableCell>
                <TableCell>{c.canvasserPhone}</TableCell>
                <TableCell className="text-right font-semibold font-mono tabular-nums">
                  {c._count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
