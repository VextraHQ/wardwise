"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatPersonName } from "@/lib/utils";
import { toast } from "sonner";
import { addCampaignCanvasserSchema } from "@/lib/schemas/collect-schemas";
import { adminCollectApi } from "@/lib/api/collect";
import { track } from "@/lib/analytics/client";
import type { ExportFormat } from "@/lib/exports/shared";
import {
  getOrderedExportFormats,
  readPreferredExportFormat,
  writePreferredExportFormat,
} from "@/lib/exports/client-preferences";
import {
  IconUsers,
  IconTrophy,
  IconPlus,
  IconTrash,
  IconUserPlus,
  IconSearch,
  IconChevronDown,
  IconFileExport,
  IconFileTypeCsv,
  IconFileTypeXls,
} from "@tabler/icons-react";

const exportFormatMeta = {
  csv: { label: "CSV", icon: IconFileTypeCsv },
  xlsx: { label: "Excel", icon: IconFileTypeXls },
} satisfies Record<
  ExportFormat,
  { label: string; icon: React.ComponentType<{ className?: string }> }
>;

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

function StatPill({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "border-border/60 bg-card inline-flex w-full items-center justify-between gap-2 rounded-sm border px-3 py-2 text-left shadow-xs sm:w-auto sm:justify-start",
        onClick &&
          "hover:bg-accent hover:border-primary/20 cursor-pointer transition-all",
      )}
    >
      <Icon className="text-primary/70 h-3.5 w-3.5" />
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <Badge
        variant="secondary"
        className="rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tabular-nums"
      >
        {value}
      </Badge>
    </Comp>
  );
}

export function CampaignCanvassers({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const { data, isLoading } = useCampaignCanvassers(campaignId);
  const addMutation = useAddCanvasser(campaignId);
  const removeMutation = useRemoveCanvasser(campaignId);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("");
  const [addFieldErrors, setAddFieldErrors] = useState<{
    name?: string;
    phone?: string;
    zone?: string;
  }>({});
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [manageOpen, setManageOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);
  const [preferredFormat, setPreferredFormat] = useState<ExportFormat>(() =>
    readPreferredExportFormat(),
  );

  const preloaded = data?.preloaded || [];
  const canvassers = useMemo(() => data?.canvassers || [], [data?.canvassers]);
  const selfIdentifiedCount = data?.selfIdentifiedCount ?? 0;

  const filteredCanvassers = useMemo(() => {
    if (!leaderboardSearch.trim()) return canvassers;
    const q = leaderboardSearch.toLowerCase();
    return canvassers.filter(
      (c) =>
        c.canvasserName.toLowerCase().includes(q) ||
        c.canvasserPhone.toLowerCase().includes(q),
    );
  }, [canvassers, leaderboardSearch]);

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    const result = addCampaignCanvasserSchema.safeParse({ name, phone, zone });
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setAddFieldErrors({
        name: errors.name?.[0],
        phone: errors.phone?.[0],
        zone: errors.zone?.[0],
      });
      setAddFormError(null);
      return;
    }

    setAddFieldErrors({});
    setAddFormError(null);

    addMutation.mutate(
      {
        name: result.data.name,
        phone: result.data.phone,
        zone: result.data.zone || undefined,
      },
      {
        onSuccess: () => {
          track("admin_canvasser_added", {
            campaign_id: campaignId,
            has_zone: Boolean(result.data.zone),
          });
          toast.success("Canvasser added");
          setName("");
          setPhone("");
          setZone("");
          setAddFieldErrors({});
          setAddFormError(null);
        },
        onError: (e) => {
          const isPhoneConflict =
            e.message.toLowerCase().includes("phone") ||
            e.message.toLowerCase().includes("exists");
          if (isPhoneConflict) {
            setAddFieldErrors((current) => ({
              ...current,
              phone: e.message,
            }));
            return;
          }
          setAddFormError(e.message);
        },
      },
    );
  };

  const handleRemoveClick = (
    canvasserId: string,
    canvasserName: string,
    canvasserPhone: string,
  ) => {
    const referralEntry = canvassers.find(
      (c) =>
        c.canvasserName === canvasserName &&
        c.canvasserPhone === canvasserPhone,
    );
    const referralNote = referralEntry
      ? `\n\nThis canvasser already has ${referralEntry._count} attributed submission${referralEntry._count !== 1 ? "s" : ""}.`
      : "";
    setConfirmDialog({
      title: `Remove ${formatPersonName(canvasserName)}?`,
      description: `This removes them from the public form dropdown for future registrations. Existing submissions already attributed to this canvasser will remain in reports and leaderboard history.${referralNote}`,
      onConfirm: () => {
        removeMutation.mutate(canvasserId, {
          onSuccess: () => {
            track("admin_canvasser_removed", {
              campaign_id: campaignId,
            });
            toast.success(`${formatPersonName(canvasserName)} removed`);
          },
          onError: (e) => toast.error(e.message),
        });
      },
    });
  };

  const navigateToSubmissions = (params: Record<string, string>) => {
    const sp = new URLSearchParams(window.location.search);
    sp.set("tab", "submissions");
    Object.entries(params).forEach(([k, v]) => sp.set(k, v));
    router.replace(`?${sp.toString()}`);
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      await adminCollectApi.exportCanvasserLeaderboard(campaignId, {
        search: leaderboardSearch.trim() || undefined,
        format,
      });
      writePreferredExportFormat(format);
      setPreferredFormat(format);
      toast.success(
        leaderboardSearch.trim()
          ? `${exportFormatMeta[format].label} exported with search filter`
          : `${exportFormatMeta[format].label} exported`,
      );
    } catch {
      toast.error("Export failed");
    }
  };

  const orderedFormats = getOrderedExportFormats(preferredFormat);

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
    <div className="space-y-4">
      {/* Header: subtitle + stat pills */}
      <div className="space-y-3">
        <p className="text-muted-foreground text-xs">
          Referral performance and attribution for this campaign
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <StatPill
            icon={IconTrophy}
            label="Referral Canvassers"
            value={canvassers.length}
          />
          <StatPill
            icon={IconUserPlus}
            label="Public Form"
            value={preloaded.length}
          />
          {selfIdentifiedCount > 0 && (
            <StatPill
              icon={IconUsers}
              label="Self-Identified"
              value={selfIdentifiedCount}
              onClick={() => navigateToSubmissions({ role: "canvasser" })}
            />
          )}
        </div>
      </div>

      {/* Toolbar: search + export + manage */}
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 sm:flex-1">
          <IconSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            value={leaderboardSearch}
            onChange={(e) => setLeaderboardSearch(e.target.value)}
            placeholder="Search canvassers..."
            className="h-8 rounded-sm pl-8 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full justify-center rounded-sm font-mono text-[10px] tracking-widest uppercase sm:w-auto"
                disabled={canvassers.length === 0}
              >
                <IconFileExport className="mr-1 h-3.5 w-3.5" />
                Export
                <IconChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                Last Used: {exportFormatMeta[preferredFormat].label}
              </DropdownMenuLabel>
              {orderedFormats.map((format) => {
                const Icon = exportFormatMeta[format].icon;
                return (
                  <DropdownMenuItem
                    key={format}
                    onClick={() => handleExport(format)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    Export {exportFormatMeta[format].label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full justify-center rounded-sm font-mono text-[10px] tracking-widest uppercase sm:w-auto"
            onClick={() => setManageOpen(true)}
          >
            <IconUserPlus className="mr-1 h-3.5 w-3.5" />
            Manage Dropdown
          </Button>
        </div>
      </div>

      {/* Referral Leaderboard */}
      {canvassers.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 px-1">
            <IconTrophy className="text-primary h-4 w-4" />
            <h3 className="text-sm font-semibold tracking-tight">
              Referral Leaderboard
            </h3>
            <Badge
              variant="secondary"
              className="rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tabular-nums"
            >
              {leaderboardSearch.trim()
                ? `${filteredCanvassers.length} / ${canvassers.length}`
                : canvassers.length}
            </Badge>
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
                {filteredCanvassers.map((c, i) => {
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
                      className={cn(
                        "cursor-pointer transition-colors",
                        rankClass,
                      )}
                      tabIndex={0}
                      role="button"
                      onClick={() =>
                        navigateToSubmissions({
                          canvasserName: c.canvasserName,
                          canvasserPhone: c.canvasserPhone,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigateToSubmissions({
                            canvasserName: c.canvasserName,
                            canvasserPhone: c.canvasserPhone,
                          });
                        }
                      }}
                    >
                      <TableCell className="text-muted-foreground text-center text-xs font-medium">
                        {rankLabel}
                      </TableCell>
                      <TableCell>{formatPersonName(c.canvasserName)}</TableCell>
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
                {filteredCanvassers.length === 0 &&
                  leaderboardSearch.trim() && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-muted-foreground py-8 text-center text-sm"
                      >
                        No canvassers match &quot;{leaderboardSearch}&quot;
                      </TableCell>
                    </TableRow>
                  )}
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

      {/* Manage Dropdown Sheet */}
      <Sheet open={manageOpen} onOpenChange={setManageOpen}>
        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="space-y-1 border-b">
            <SheetTitle className="text-base font-bold tracking-tight">
              Public Form Canvassers
            </SheetTitle>
            <SheetDescription className="text-xs">
              Shown in the registration dropdown. Removing a canvasser only
              affects future registrations — existing submissions stay in
              reports.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* Add form */}
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="canvasser-name">Name</Label>
                <Input
                  id="canvasser-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setAddFieldErrors((current) => ({
                      ...current,
                      name: undefined,
                    }));
                    setAddFormError(null);
                  }}
                  placeholder="e.g. Ali Musa"
                  className="h-9 rounded-sm"
                />
                {addFieldErrors.name && (
                  <p className="text-destructive text-[11px] font-medium">
                    {addFieldErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="canvasser-phone">Phone</Label>
                <Input
                  id="canvasser-phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setAddFieldErrors((current) => ({
                      ...current,
                      phone: undefined,
                    }));
                    setAddFormError(null);
                  }}
                  placeholder="e.g. 08012345678"
                  className="h-9 rounded-sm font-mono"
                />
                {addFieldErrors.phone && (
                  <p className="text-destructive text-[11px] font-medium">
                    {addFieldErrors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="canvasser-zone">
                  Zone{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="canvasser-zone"
                  value={zone}
                  onChange={(e) => {
                    setZone(e.target.value);
                    setAddFieldErrors((current) => ({
                      ...current,
                      zone: undefined,
                    }));
                    setAddFormError(null);
                  }}
                  placeholder="e.g. Ward 3"
                  className="h-9 rounded-sm"
                />
                {addFieldErrors.zone && (
                  <p className="text-destructive text-[11px] font-medium">
                    {addFieldErrors.zone}
                  </p>
                )}
              </div>
              {addFormError && (
                <p className="text-destructive text-[11px] font-medium">
                  {addFormError}
                </p>
              )}
              <Button
                type="submit"
                size="sm"
                className="h-9 w-full rounded-sm"
                disabled={addMutation.isPending}
              >
                <IconPlus className="mr-1.5 h-3.5 w-3.5" />
                {addMutation.isPending ? "Adding..." : "Add Canvasser"}
              </Button>
            </form>

            <Separator />

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
                      <TableHead className="h-9 w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preloaded.map((c) => (
                      <TableRow key={c.id} className="hover:bg-muted/30">
                        <TableCell className="text-sm font-medium">
                          {c.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {c.phone}
                        </TableCell>
                        <TableCell className="p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              handleRemoveClick(c.id, c.name, c.phone)
                            }
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
                  No canvassers added. Add canvassers above to enable dropdown
                  selection on the public form.
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm Dialog */}
      <AlertDialog
        open={!!confirmDialog}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent className="rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {confirmDialog?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm font-mono text-[11px] tracking-widest uppercase">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 rounded-sm font-mono text-[11px] tracking-widest uppercase"
              onClick={() => {
                confirmDialog?.onConfirm();
                setConfirmDialog(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
