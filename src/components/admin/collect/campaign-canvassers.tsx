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
import { IconUsers } from "@tabler/icons-react";
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
      <div className="pt-4">
        <div className="border-border flex flex-col items-center gap-3 rounded-sm border border-dashed py-12 text-center">
          <IconUsers className="text-muted-foreground h-10 w-10" />
          <p className="text-muted-foreground text-sm">
            No canvasser data yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <IconTrophy className="text-primary h-4 w-4" />
        <h3 className="text-sm font-semibold tracking-tight">
          Canvasser Leaderboard
        </h3>
      </div>
      <div className="overflow-x-auto rounded-sm border">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0 z-10">
            <TableRow>
              <TableHead className="text-muted-foreground h-10 w-14 text-center font-mono text-[10px] font-bold tracking-widest uppercase">
                S/N
              </TableHead>
              <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                Name
              </TableHead>
              <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                Phone
              </TableHead>
              <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                Registrations
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {canvassers.map((c, i) => {
              const rankClass =
                i === 0
                  ? "bg-amber-500/10 hover:bg-amber-500/15"
                  : i === 1
                    ? "bg-zinc-400/10 hover:bg-zinc-400/15"
                    : i === 2
                      ? "bg-orange-600/10 hover:bg-orange-600/15"
                      : "hover:bg-muted/30";
              const rankLabel = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1);
              return (
              <TableRow
                key={`${c.canvasserName}-${c.canvasserPhone}`}
                className={`transition-colors ${rankClass}`}
              >
                <TableCell className="text-muted-foreground text-center text-xs font-medium">
                  {rankLabel}
                </TableCell>
                <TableCell>{c.canvasserName}</TableCell>
                <TableCell>{c.canvasserPhone}</TableCell>
                <TableCell className="text-right font-mono font-semibold tabular-nums">
                  {c._count}
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
