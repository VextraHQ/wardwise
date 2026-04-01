"use client";

import { useState } from "react";
import {
  useCampaignCanvassers,
  useAddCanvasser,
  useRemoveCanvasser,
} from "@/hooks/use-collect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  IconUsers,
  IconTrophy,
  IconPlus,
  IconTrash,
  IconUserPlus,
} from "@tabler/icons-react";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function CampaignCanvassers({ campaignId }: { campaignId: string }) {
  const { data, isLoading } = useCampaignCanvassers(campaignId);
  const addMutation = useAddCanvasser(campaignId);
  const removeMutation = useRemoveCanvasser(campaignId);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("");

  const preloaded = data?.preloaded || [];
  const canvassers = data?.canvassers || [];

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    addMutation.mutate(
      {
        name: name.trim(),
        phone: phone.trim(),
        zone: zone.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Canvasser added");
          setName("");
          setPhone("");
          setZone("");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const handleRemove = (canvasserId: string, canvasserName: string) => {
    removeMutation.mutate(canvasserId, {
      onSuccess: () => toast.success(`${canvasserName} removed`),
      onError: (e) => toast.error(e.message),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pre-loaded Canvassers Management */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconUserPlus className="text-primary h-4 w-4" />
            <CardTitle className="text-sm font-semibold tracking-tight">
              Pre-loaded Canvassers
            </CardTitle>
          </div>
          <p className="text-muted-foreground text-xs">
            Add canvassers upfront so the public form shows a dropdown instead
            of free text. Reduces typos and improves analytics.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add form */}
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-0 flex-1">
              <label className="text-muted-foreground mb-1 block text-[10px] font-bold tracking-widest uppercase">
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ali Musa"
                className="h-8 rounded-sm text-sm"
              />
            </div>
            <div className="min-w-0 flex-1">
              <label className="text-muted-foreground mb-1 block text-[10px] font-bold tracking-widest uppercase">
                Phone
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                className="h-8 rounded-sm font-mono text-sm"
              />
            </div>
            <div className="min-w-0 flex-1">
              <label className="text-muted-foreground mb-1 block text-[10px] font-bold tracking-widest uppercase">
                Zone
              </label>
              <Input
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="Optional"
                className="h-8 rounded-sm text-sm"
              />
            </div>
            <Button
              size="sm"
              className="h-8 rounded-sm font-mono text-[10px] tracking-widest uppercase"
              onClick={handleAdd}
              disabled={addMutation.isPending}
            >
              <IconPlus className="mr-1 h-3.5 w-3.5" />
              {addMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </div>

          {/* Pre-loaded list */}
          {preloaded.length > 0 ? (
            <div className="overflow-x-auto rounded-sm border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground h-9 font-mono text-[10px] font-bold tracking-widest uppercase">
                      Name
                    </TableHead>
                    <TableHead className="text-muted-foreground h-9 font-mono text-[10px] font-bold tracking-widest uppercase">
                      Phone
                    </TableHead>
                    <TableHead className="text-muted-foreground hidden h-9 font-mono text-[10px] font-bold tracking-widest uppercase sm:table-cell">
                      Zone
                    </TableHead>
                    <TableHead className="h-9 w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preloaded.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell className="text-sm font-medium">
                        {c.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {c.phone}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                        {c.zone || "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleRemove(c.id, c.name)}
                          disabled={removeMutation.isPending}
                        >
                          <IconTrash className="text-destructive h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border-border flex flex-col items-center gap-2 rounded-sm border border-dashed py-6 text-center">
              <IconUsers className="text-muted-foreground h-6 w-6" />
              <p className="text-muted-foreground text-xs">
                No canvassers pre-loaded. Add canvassers above to enable
                dropdown selection on the public form.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Canvasser Leaderboard */}
      {canvassers.length > 0 ? (
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
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-muted-foreground h-10 w-14 text-center font-mono text-[10px] font-bold tracking-widest uppercase">
                    S/N
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Name
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase sm:table-cell">
                    Phone
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                    Total
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase md:table-cell">
                    Verified %
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase md:table-cell">
                    Flagged %
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase lg:table-cell">
                    Last Active
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
                  const rankLabel =
                    i === 0
                      ? "🥇"
                      : i === 1
                        ? "🥈"
                        : i === 2
                          ? "🥉"
                          : String(i + 1);
                  const verifiedPct =
                    c._count > 0
                      ? Math.round((c.verified / c._count) * 100)
                      : 0;
                  const flaggedPct =
                    c._count > 0 ? Math.round((c.flagged / c._count) * 100) : 0;
                  return (
                    <TableRow
                      key={`${c.canvasserName}-${c.canvasserPhone}`}
                      className={`transition-colors ${rankClass}`}
                    >
                      <TableCell className="text-muted-foreground text-center text-xs font-medium">
                        {rankLabel}
                      </TableCell>
                      <TableCell>{c.canvasserName}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {c.canvasserPhone}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold tabular-nums">
                        {c._count}
                      </TableCell>
                      <TableCell className="hidden text-right md:table-cell">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-sm px-1.5 py-0 font-mono text-[10px]",
                            verifiedPct > 80
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                              : verifiedPct > 50
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                                : "border-border text-muted-foreground",
                          )}
                        >
                          {verifiedPct}%
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-right md:table-cell">
                        {flaggedPct > 0 ? (
                          <Badge
                            variant="outline"
                            className="border-destructive/30 bg-destructive/10 text-destructive rounded-sm px-1.5 py-0 font-mono text-[10px]"
                          >
                            {flaggedPct}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            0%
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden text-xs lg:table-cell">
                        {c.lastActive ? relativeTime(c.lastActive) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="pt-2">
          <div className="border-border flex flex-col items-center gap-3 rounded-sm border border-dashed py-12 text-center">
            <IconUsers className="text-muted-foreground h-10 w-10" />
            <p className="text-muted-foreground text-sm">
              No canvasser submission data yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
