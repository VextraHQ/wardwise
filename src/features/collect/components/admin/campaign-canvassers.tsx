"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCampaignCanvassers,
  useAddCanvasser,
  useRemoveCanvasser,
  useCanvasserPossibleMatches,
  useLinkToRoster,
} from "@/features/collect/hooks/use-collect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPagination } from "@/components/shared/admin/admin-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/shared/use-mobile";
import { formatRelativeTime } from "@/lib/date-format";
import { cn, formatPersonName } from "@/lib/utils";
import { toast } from "sonner";
import { addCampaignCanvasserSchema } from "@/features/collect/schemas/collect-schemas";
import { adminCollectApi } from "@/features/collect/api/collect-api";
import { track } from "@/lib/analytics/client";
import type { ExportFormat } from "@/lib/exports/shared";
import {
  getOrderedExportFormats,
  readPreferredExportFormat,
  writePreferredExportFormat,
} from "@/lib/exports/client-preferences";
import type {
  CampaignCanvasserRecord,
  PossibleMatch,
  ReferralActivityItem,
} from "@/features/collect/types/collect.types";
import {
  IconChevronDown,
  IconFileExport,
  IconFileTypeCsv,
  IconFileTypeXls,
  IconLink,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconTrash,
  IconTrophy,
  IconUsers,
} from "@tabler/icons-react";

const exportFormatMeta = {
  csv: { label: "CSV", icon: IconFileTypeCsv },
  xlsx: { label: "Excel", icon: IconFileTypeXls },
} satisfies Record<
  ExportFormat,
  { label: string; icon: React.ComponentType<{ className?: string }> }
>;

type SourceFilter = "all" | "known" | "manual";

const EMPTY_PRELOADED: CampaignCanvasserRecord[] = [];
const EMPTY_REFERRAL_ACTIVITY: ReferralActivityItem[] = [];
const EMPTY_MATCHES: PossibleMatch[] = [];

function sourceFilterLabel(filter: Exclude<SourceFilter, "all">) {
  return filter === "known" ? "From List" : "Typed In";
}

function sourceTypeLabel(type: ReferralActivityItem["type"]) {
  return type === "known" ? "From List" : "Typed In";
}

function normalizeCleanupName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function cleanupConfidenceMeta({
  confidence,
  namesMatch,
}: {
  confidence: "high" | "medium";
  namesMatch: boolean;
}) {
  return confidence === "high"
    ? {
        label: namesMatch ? "Exact phone + name match" : "Exact phone match",
        badgeClass:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      }
    : {
        label: "Exact name match",
        badgeClass:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      };
}

function PublicFormListManager({
  preloaded,
  addMutation,
  removeMutation,
  onRemoveClick,
}: {
  preloaded: CampaignCanvasserRecord[];
  addMutation: ReturnType<typeof useAddCanvasser>;
  removeMutation: ReturnType<typeof useRemoveCanvasser>;
  onRemoveClick: (id: string, name: string) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("");
  const [search, setSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    zone?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const filteredPreloaded = useMemo(() => {
    if (!search.trim()) return preloaded;
    const q = search.toLowerCase();
    return preloaded.filter(
      (entry) =>
        entry.name.toLowerCase().includes(q) ||
        entry.phone.toLowerCase().includes(q) ||
        (entry.zone ?? "").toLowerCase().includes(q),
    );
  }, [preloaded, search]);

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    const result = addCampaignCanvasserSchema.safeParse({ name, phone, zone });
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        phone: errors.phone?.[0],
        zone: errors.zone?.[0],
      });
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);

    addMutation.mutate(
      {
        name: result.data.name,
        phone: result.data.phone,
        zone: result.data.zone || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Canvasser added to the public form list");
          setName("");
          setPhone("");
          setZone("");
          setFieldErrors({});
          setFormError(null);
        },
        onError: (error) => {
          const isPhoneConflict =
            error.message.toLowerCase().includes("phone") ||
            error.message.toLowerCase().includes("exists");
          if (isPhoneConflict) {
            setFieldErrors((current) => ({ ...current, phone: error.message }));
          } else {
            setFormError(error.message);
          }
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      <div className="border-border/60 bg-card rounded-sm border p-4 shadow-none">
        <p className="mb-4 font-mono text-[10px] font-bold tracking-widest uppercase">
          Add to Dropdown
        </p>
        <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
          Names added here appear in the public form dropdown. Supporters can
          still type a canvasser name manually if it is not in this list.
        </p>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="canvasser-name">Name</Label>
            <Input
              id="canvasser-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((current) => ({ ...current, name: undefined }));
                setFormError(null);
              }}
              placeholder="e.g. Ali Musa"
              className="h-9 rounded-sm"
            />
            {fieldErrors.name ? (
              <p className="text-destructive text-[11px] font-medium">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="canvasser-phone">Phone</Label>
            <Input
              id="canvasser-phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setFieldErrors((current) => ({ ...current, phone: undefined }));
                setFormError(null);
              }}
              placeholder="e.g. 08012345678"
              className="h-9 rounded-sm font-mono"
            />
            {fieldErrors.phone ? (
              <p className="text-destructive text-[11px] font-medium">
                {fieldErrors.phone}
              </p>
            ) : null}
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
                setFieldErrors((current) => ({ ...current, zone: undefined }));
                setFormError(null);
              }}
              placeholder="e.g. Ward 3"
              className="h-9 rounded-sm"
            />
            {fieldErrors.zone ? (
              <p className="text-destructive text-[11px] font-medium">
                {fieldErrors.zone}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p className="text-destructive text-[11px] font-medium">
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="sm"
            className="h-9 w-full rounded-sm"
            disabled={addMutation.isPending}
          >
            <IconPlus className="mr-1.5 h-3.5 w-3.5" />
            {addMutation.isPending ? "Adding..." : "Add to Canvasser List"}
          </Button>
        </form>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
              Current Canvasser List
            </p>
            <Badge
              variant="secondary"
              className="rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
            >
              {preloaded.length}
            </Badge>
          </div>

          {preloaded.length > 4 ? (
            <div className="relative min-w-0 sm:w-64">
              <IconSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search names or phone..."
                className="h-8 rounded-sm pl-8 text-sm"
              />
            </div>
          ) : null}
        </div>

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
                  <TableHead className="h-9 w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPreloaded.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm font-medium">
                      {formatPersonName(entry.name)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {entry.phone}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-xs sm:table-cell">
                      {entry.zone ?? "—"}
                    </TableCell>
                    <TableCell className="p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onRemoveClick(entry.id, entry.name)}
                        disabled={removeMutation.isPending}
                      >
                        <IconTrash className="text-destructive h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPreloaded.length === 0 && search.trim() ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground py-8 text-center text-sm"
                    >
                      No names match &quot;{search}&quot;
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border-border flex flex-col items-center gap-2 rounded-sm border border-dashed py-6 text-center">
            <IconUsers className="text-muted-foreground h-6 w-6" />
            <p className="text-muted-foreground text-xs">
              No dropdown names yet. Add one above to make the public form
              easier for supporters to use when choosing a canvasser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReferralActivitySection({
  referralActivity,
  sourceFilter,
  onNavigate,
  onExport,
  preferredFormat,
  setPreferredFormat,
}: {
  referralActivity: ReferralActivityItem[];
  sourceFilter: SourceFilter;
  onNavigate: (params: Record<string, string>) => void;
  onExport: (
    format: "csv" | "xlsx",
    search?: string,
    type?: "known" | "manual",
  ) => void;
  preferredFormat: ExportFormat;
  setPreferredFormat: (format: ExportFormat) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const scopedActivity = useMemo(() => {
    if (sourceFilter === "all") return referralActivity;
    return referralActivity.filter((item) => item.type === sourceFilter);
  }, [referralActivity, sourceFilter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return scopedActivity;
    const q = search.toLowerCase();
    return scopedActivity.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.phone ?? "").toLowerCase().includes(q),
    );
  }, [scopedActivity, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(pageStart, pageStart + pageSize);

  const entries = useMemo(
    () =>
      paginated.map((item, index) => {
        const overallIndex = pageStart + index;
        const verifiedPct =
          item.count > 0 ? Math.round((item.verified / item.count) * 100) : 0;
        const flaggedPct =
          item.count > 0 ? Math.round((item.flagged / item.count) * 100) : 0;

        return {
          item,
          index: overallIndex,
          verifiedPct,
          flaggedPct,
          rankEmoji:
            overallIndex === 0
              ? "🥇"
              : overallIndex === 1
                ? "🥈"
                : overallIndex === 2
                  ? "🥉"
                  : null,
          rowClass:
            overallIndex === 0
              ? "bg-amber-500/10 hover:bg-amber-500/15"
              : overallIndex === 1
                ? "bg-zinc-400/10 hover:bg-zinc-400/15"
                : overallIndex === 2
                  ? "bg-orange-600/10 hover:bg-orange-600/15"
                  : "hover:bg-muted/30",
        };
      }),
    [paginated, pageStart],
  );

  const orderedFormats = getOrderedExportFormats(preferredFormat);

  const handleRowClick = (item: ReferralActivityItem) => {
    if (item.type === "known" && item.canvasserId) {
      onNavigate({
        campaignCanvasserId: item.canvasserId,
        canvasserLabel: item.name,
      });
      return;
    }

    onNavigate({
      canvasserLabel: item.name,
      canvasserName: item.name,
      ...(item.phone ? { canvasserPhone: item.phone } : {}),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 px-1">
        <IconTrophy className="text-primary h-4 w-4 shrink-0" />
        <h3 className="text-sm font-semibold tracking-tight">
          Canvasser Activity
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 sm:flex-1">
          <IconSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or phone..."
            className="h-8 rounded-sm pl-8 text-sm"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full justify-center rounded-sm font-mono text-[10px] tracking-widest uppercase sm:w-auto"
              disabled={referralActivity.length === 0}
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
                  onClick={() => {
                    onExport(
                      format,
                      search.trim() || undefined,
                      sourceFilter === "all" ? undefined : sourceFilter,
                    );
                    writePreferredExportFormat(format);
                    setPreferredFormat(format);
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  Export {exportFormatMeta[format].label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {referralActivity.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Badge
              variant="secondary"
              className="rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tabular-nums"
            >
              {search.trim()
                ? `${filtered.length} / ${scopedActivity.length}`
                : scopedActivity.length}
            </Badge>
            <p className="text-muted-foreground text-xs">
              {sourceFilter === "all"
                ? "Showing all canvasser entries"
                : `Showing ${sourceFilterLabel(sourceFilter).toLowerCase()} only`}
            </p>
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
              <TableBody className="max-md:[&_td]:py-3">
                {entries.map(
                  ({
                    item,
                    index,
                    verifiedPct,
                    flaggedPct,
                    rankEmoji,
                    rowClass,
                  }) => (
                    <TableRow
                      key={
                        item.type === "known"
                          ? `known-${item.canvasserId}`
                          : `manual-${item.name}-${item.phone}`
                      }
                      className={cn(
                        "cursor-pointer transition-colors",
                        rowClass,
                      )}
                      tabIndex={0}
                      role="button"
                      onClick={() => handleRowClick(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRowClick(item);
                        }
                      }}
                    >
                      <TableCell className="text-muted-foreground w-12 text-center font-mono text-xs font-semibold tabular-nums">
                        <span>{index + 1}</span>
                        {rankEmoji ? (
                          <span
                            aria-hidden
                            className="pl-0.5 align-middle sm:pl-1"
                          >
                            {rankEmoji}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="truncate">
                            {formatPersonName(item.name)}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0 rounded-sm px-1.5 py-0 font-mono text-[9px] font-bold tracking-widest uppercase",
                              item.type === "known"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
                            )}
                          >
                            {sourceTypeLabel(item.type)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {item.phone ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold tabular-nums">
                        {item.count}
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
                        {item.lastActive
                          ? formatRelativeTime(item.lastActive, {
                              olderDateStyle: "months",
                            })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ),
                )}

                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground py-8 text-center text-sm"
                    >
                      {search.trim()
                        ? `No results match "${search}"`
                        : sourceFilter === "all"
                          ? "No canvasser activity yet."
                          : `No ${sourceFilterLabel(sourceFilter).toLowerCase()} rows yet.`}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          {filtered.length > pageSize ? (
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filtered.length}
              itemLabel="canvasser entries"
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
            />
          ) : null}
        </div>
      ) : (
        <div className="border-border flex flex-col items-center gap-3 rounded-sm border border-dashed py-12 text-center">
          <IconUsers className="text-muted-foreground h-10 w-10" />
          <p className="text-muted-foreground text-sm">
            No canvasser activity yet.
          </p>
        </div>
      )}
    </div>
  );
}

function CleanupWorkspace({
  matches,
  isLoading,
  linkMutation,
  isMobile,
}: {
  matches: PossibleMatch[];
  isLoading: boolean;
  linkMutation: ReturnType<typeof useLinkToRoster>;
  isMobile: boolean;
}) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeLinkKey, setActiveLinkKey] = useState<string | null>(null);

  const getMatchKey = (match: PossibleMatch) =>
    `${match.manualName}__${match.manualPhone ?? ""}`;
  const getSuggestionKey = (
    match: PossibleMatch,
    suggestion: PossibleMatch["suggestions"][0],
  ) => `${getMatchKey(match)}__${suggestion.canvasserId}`;

  const visibleMatches = useMemo(
    () => matches.filter((match) => !dismissed.has(getMatchKey(match))),
    [dismissed, matches],
  );

  const handleLink = (
    match: PossibleMatch,
    suggestion: PossibleMatch["suggestions"][0],
  ) => {
    if (linkMutation.isPending) return;

    const suggestionKey = getSuggestionKey(match, suggestion);
    setActiveLinkKey(suggestionKey);

    linkMutation.mutate(
      {
        manualName: match.manualName,
        manualPhone: match.manualPhone,
        canvasserId: suggestion.canvasserId,
      },
      {
        onSuccess: ({ linkedCount }) => {
          toast.success(
            `Linked ${linkedCount} submission${linkedCount !== 1 ? "s" : ""} to ${suggestion.canvasserName}`,
          );
          setDismissed((current) => new Set([...current, getMatchKey(match)]));
        },
        onError: (error) => toast.error(error.message),
        onSettled: () => setActiveLinkKey(null),
      },
    );
  };

  const handleDismiss = (match: PossibleMatch) => {
    setDismissed((current) => new Set([...current, getMatchKey(match)]));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-36 w-full rounded-sm" />
        ))}
      </div>
    );
  }

  if (visibleMatches.length === 0) {
    return (
      <div className="border-border flex flex-col items-center gap-3 rounded-sm border border-dashed py-12 text-center">
        <IconSparkles className="text-muted-foreground h-8 w-8" />
        <p className="text-muted-foreground text-sm font-medium">
          Nothing left to review right now.
        </p>
        <p className="text-muted-foreground/70 text-xs leading-relaxed">
          Only typed-in canvasser names that clearly match someone on your saved
          list will appear here.
        </p>
      </div>
    );
  }

  const currentIndex =
    visibleMatches.length === 0
      ? 0
      : Math.min(activeIndex, visibleMatches.length - 1);
  const activeMatch = visibleMatches[currentIndex];

  if (isMobile && activeMatch) {
    return (
      <div className="space-y-4">
        <div className="border-border/60 bg-muted/20 rounded-sm border px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
              Match Review
            </p>
            <Badge
              variant="secondary"
              className="rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
            >
              {visibleMatches.length}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
            Match {currentIndex + 1} of {visibleMatches.length}. Review the
            typed-in entry and link it only if the saved canvasser is clearly
            the same person.
          </p>
        </div>

        <div className="border-border/60 bg-card overflow-hidden rounded-sm border shadow-none">
          <div className="flex items-start justify-between gap-3 px-4 py-4">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
                  Typed In
                </p>
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
                >
                  {activeMatch.submissionCount}
                </Badge>
              </div>
              <p className="text-base font-semibold">
                {formatPersonName(activeMatch.manualName)}
              </p>
              <p className="text-muted-foreground font-mono text-xs">
                {activeMatch.manualPhone || "No phone shared"}
              </p>
              <p className="text-muted-foreground text-xs">
                {activeMatch.submissionCount} submission
                {activeMatch.submissionCount !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-8 shrink-0 rounded-sm font-mono text-[10px] tracking-widest uppercase"
              onClick={() => handleDismiss(activeMatch)}
            >
              Keep Separate
            </Button>
          </div>

          <div className="border-border/60 border-t px-4 py-4">
            <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
              Suggested Saved List Match
            </p>
            <div className="mt-3 space-y-3">
              {activeMatch.suggestions.map((suggestion) => {
                const matchMeta = cleanupConfidenceMeta({
                  confidence: suggestion.confidence,
                  namesMatch:
                    normalizeCleanupName(activeMatch.manualName) ===
                    normalizeCleanupName(suggestion.canvasserName),
                });
                const isLinkingThis =
                  linkMutation.isPending &&
                  activeLinkKey === getSuggestionKey(activeMatch, suggestion);

                return (
                  <div
                    key={suggestion.canvasserId}
                    className="border-border/60 bg-muted/10 rounded-sm border px-3 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">
                        {formatPersonName(suggestion.canvasserName)}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-sm px-1.5 py-0 font-mono text-[9px] font-bold tracking-widest uppercase",
                          matchMeta.badgeClass,
                        )}
                      >
                        {matchMeta.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 font-mono text-xs">
                      {suggestion.canvasserPhone}
                    </p>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 mt-3 h-8 w-full rounded-sm font-mono text-[10px] tracking-widest uppercase"
                      disabled={isLinkingThis}
                      onClick={() => handleLink(activeMatch, suggestion)}
                    >
                      {isLinkingThis ? (
                        <>
                          <Spinner className="mr-1 h-3 w-3" />
                          Linking...
                        </>
                      ) : (
                        <>
                          <IconLink className="mr-1 h-3 w-3" />
                          Link to List
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-border/60 bg-background/95 sticky bottom-0 space-y-2 border-t pt-3 pb-1 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-sm font-mono text-[10px] tracking-widest uppercase"
              disabled={currentIndex === 0}
              onClick={() =>
                setActiveIndex((current) => Math.max(0, current - 1))
              }
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-sm font-mono text-[10px] tracking-widest uppercase"
              disabled={currentIndex === visibleMatches.length - 1}
              onClick={() =>
                setActiveIndex((current) =>
                  Math.min(visibleMatches.length - 1, current + 1),
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-border/60 bg-muted/20 flex items-center justify-between gap-3 rounded-sm border px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
              Match Review
            </p>
            <Badge
              variant="secondary"
              className="rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
            >
              {visibleMatches.length}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Typed-in names only appear here when they clearly match someone on
            your saved canvasser list.
          </p>
        </div>
      </div>

      <div className="border-border/60 bg-card overflow-hidden rounded-sm border shadow-none">
        {visibleMatches.map((match, index) => (
          <div
            key={getMatchKey(match)}
            className={cn(
              "space-y-3 px-4 py-4",
              index > 0 && "border-border/60 border-t",
            )}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
                      Typed In
                    </p>
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
                    >
                      {match.submissionCount}
                    </Badge>
                  </div>
                  <p className="text-base font-semibold">
                    {formatPersonName(match.manualName)}
                  </p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {match.manualPhone || "No phone shared"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {match.submissionCount} submission
                    {match.submissionCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-8 shrink-0 rounded-sm font-mono text-[10px] tracking-widest uppercase"
                  onClick={() => handleDismiss(match)}
                >
                  Keep Separate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
                Suggested Saved List Match
                {match.suggestions.length > 1 ? "es" : ""}
              </p>

              {match.suggestions.map((suggestion) => {
                const matchMeta = cleanupConfidenceMeta({
                  confidence: suggestion.confidence,
                  namesMatch:
                    normalizeCleanupName(match.manualName) ===
                    normalizeCleanupName(suggestion.canvasserName),
                });
                const isLinkingThis =
                  linkMutation.isPending &&
                  activeLinkKey === getSuggestionKey(match, suggestion);

                return (
                  <div
                    key={suggestion.canvasserId}
                    className="border-border/60 bg-muted/10 flex items-center justify-between gap-3 rounded-sm border px-3 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {formatPersonName(suggestion.canvasserName)}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-sm px-1.5 py-0 font-mono text-[9px] font-bold tracking-widest uppercase",
                            matchMeta.badgeClass,
                          )}
                        >
                          {matchMeta.label}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 font-mono text-xs">
                        {suggestion.canvasserPhone}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 shrink-0 rounded-sm font-mono text-[10px] tracking-widest uppercase"
                      disabled={isLinkingThis}
                      onClick={() => handleLink(match, suggestion)}
                    >
                      {isLinkingThis ? (
                        <>
                          <Spinner className="mr-1 h-3 w-3" />
                          Linking...
                        </>
                      ) : (
                        <>
                          <IconLink className="mr-1 h-3 w-3" />
                          Link to List
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CampaignCanvassers({ campaignId }: { campaignId: string }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const referralSectionRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading } = useCampaignCanvassers(campaignId);
  const addMutation = useAddCanvasser(campaignId);
  const removeMutation = useRemoveCanvasser(campaignId);
  const { data: matchesData, isLoading: matchesLoading } =
    useCanvasserPossibleMatches(campaignId);
  const linkMutation = useLinkToRoster(campaignId);

  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [publicListOpen, setPublicListOpen] = useState(false);
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);
  const [preferredFormat, setPreferredFormat] = useState<ExportFormat>(() =>
    readPreferredExportFormat(),
  );

  const preloaded = data?.preloaded ?? EMPTY_PRELOADED;
  const referralActivity = data?.referralActivity ?? EMPTY_REFERRAL_ACTIVITY;
  const selfIdentifiedCount = data?.selfIdentifiedCount ?? 0;
  const possibleMatches = matchesData?.matches ?? EMPTY_MATCHES;

  const manualEntries = useMemo(
    () => referralActivity.filter((item) => item.type === "manual"),
    [referralActivity],
  );
  const knownEntries = useMemo(
    () => referralActivity.filter((item) => item.type === "known"),
    [referralActivity],
  );

  const focusReferralSection = (filter: SourceFilter) => {
    setSourceFilter(filter);
    referralSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleRemoveClick = (canvasserId: string, canvasserName: string) => {
    const referralEntry = referralActivity.find(
      (item) => item.type === "known" && item.canvasserId === canvasserId,
    );
    const referralNote = referralEntry
      ? `\n\nThis canvasser already has ${referralEntry.count} attributed submission${referralEntry.count !== 1 ? "s" : ""}.`
      : "";

    setConfirmDialog({
      title: `Remove ${formatPersonName(canvasserName)}?`,
      description: `This removes them from the public form dropdown for future registrations. Existing submissions will keep their original canvasser name and phone, but will move from Listed Canvassers to the typed canvasser list since the roster record will no longer exist.${referralNote}`,
      onConfirm: () => {
        removeMutation.mutate(canvasserId, {
          onSuccess: () => {
            track("admin_canvasser_removed", { campaign_id: campaignId });
            toast.success(`${formatPersonName(canvasserName)} removed`);
          },
          onError: (error) => toast.error(error.message),
        });
      },
    });
  };

  const navigateToSubmissions = (params: Record<string, string>) => {
    const sp = new URLSearchParams(window.location.search);
    sp.set("tab", "submissions");
    Object.entries(params).forEach(([key, value]) => sp.set(key, value));
    router.replace(`?${sp.toString()}`);
  };

  const handleExport = async (
    format: "csv" | "xlsx",
    search?: string,
    type?: "known" | "manual",
  ) => {
    try {
      await adminCollectApi.exportCanvasserLeaderboard(campaignId, {
        format,
        search,
        type,
      });
      toast.success(`${exportFormatMeta[format].label} exported`);
    } catch {
      toast.error("Export failed");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 pt-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-3 lg:gap-y-2">
        <div className="max-w-full min-w-0 flex-1">
          <Tabs
            value={sourceFilter}
            onValueChange={(value) =>
              focusReferralSection(value as SourceFilter)
            }
          >
            <TabsList className="bg-muted w-fit max-w-full justify-start overflow-x-auto rounded-sm p-1 [scrollbar-width:none] lg:max-w-full [&::-webkit-scrollbar]:hidden">
              {(
                [
                  {
                    key: "all",
                    label: "All",
                    count: referralActivity.length,
                  },
                  {
                    key: "manual",
                    label: "Typed In",
                    count: manualEntries.length,
                  },
                  {
                    key: "known",
                    label: "From List",
                    count: knownEntries.length,
                  },
                ] as const
              ).map((option) => (
                <TabsTrigger
                  key={option.key}
                  value={option.key}
                  className="flex-none rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
                >
                  {option.label}
                  <Badge
                    variant="secondary"
                    className="ml-1.5 rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
                  >
                    {option.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Desktop View */}
        <div className="hidden shrink-0 flex-wrap items-center justify-end gap-2 lg:ml-auto lg:flex">
          <Button
            type="button"
            variant="outline"
            size="sm"
            title="Manage Canvasser List"
            className="hover:bg-muted h-8 shrink-0 rounded-sm font-mono text-[10px] tracking-widest uppercase shadow-sm transition-all"
            onClick={() => setPublicListOpen(true)}
          >
            Manage List
            <Badge
              variant="secondary"
              className="ml-1.5 rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
            >
              {preloaded.length}
            </Badge>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hover:bg-muted h-8 shrink-0 rounded-sm font-mono text-[10px] tracking-widest uppercase shadow-sm transition-all"
            onClick={() => navigateToSubmissions({ role: "canvasser" })}
            disabled={selfIdentifiedCount === 0}
          >
            Self-Identified
            <Badge
              variant="secondary"
              className="ml-1.5 rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
            >
              {selfIdentifiedCount}
            </Badge>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            title="Canvasser Cleanup"
            className={cn(
              "hover:bg-muted h-8 shrink-0 rounded-sm font-mono text-[10px] tracking-widest uppercase shadow-sm transition-all",
              possibleMatches.length > 0 &&
                "border-amber-500/25 bg-amber-500/5 text-amber-800 hover:bg-amber-500/10 dark:text-amber-200",
            )}
            onClick={() => setCleanupOpen(true)}
            disabled={possibleMatches.length === 0}
          >
            Cleanup
            <Badge
              variant="secondary"
              className="ml-1.5 rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
            >
              {possibleMatches.length}
            </Badge>
          </Button>
        </div>

        {/* Mobile View */}
        <div className="flex w-full flex-col gap-2 lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="hover:bg-muted h-8 w-full rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase shadow-sm transition-all"
            onClick={() => setPublicListOpen(true)}
          >
            Manage Canvasser List
            <Badge
              variant="secondary"
              className="ml-2 rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tabular-nums"
            >
              {preloaded.length}
            </Badge>
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="hover:bg-muted h-8 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase shadow-sm transition-all"
              onClick={() => navigateToSubmissions({ role: "canvasser" })}
              disabled={selfIdentifiedCount === 0}
            >
              Self-Identified
              <Badge
                variant="secondary"
                className="ml-1.5 rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tabular-nums"
              >
                {selfIdentifiedCount}
              </Badge>
            </Button>

            <Button
              type="button"
              variant="outline"
              className={cn(
                "hover:bg-muted h-8 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase shadow-sm transition-all",
                possibleMatches.length > 0 &&
                  "border-amber-500/25 bg-amber-500/5 text-amber-800 hover:bg-amber-500/10 dark:text-amber-200",
              )}
              onClick={() => setCleanupOpen(true)}
              disabled={possibleMatches.length === 0}
            >
              Cleanup
              <Badge
                variant="secondary"
                className="ml-1.5 rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tabular-nums"
              >
                {possibleMatches.length}
              </Badge>
            </Button>
          </div>
        </div>
      </div>

      <div ref={referralSectionRef}>
        <ReferralActivitySection
          key={sourceFilter}
          referralActivity={referralActivity}
          sourceFilter={sourceFilter}
          onNavigate={navigateToSubmissions}
          onExport={handleExport}
          preferredFormat={preferredFormat}
          setPreferredFormat={setPreferredFormat}
        />
      </div>

      {isMobile ? (
        <>
          <Drawer open={cleanupOpen} onOpenChange={setCleanupOpen}>
            <DrawerContent className="max-h-[92vh]">
              <DrawerHeader className="border-border/60 bg-background/95 sticky top-0 z-10 border-b px-4 py-3 text-left backdrop-blur-sm">
                <DrawerTitle className="font-mono text-xs font-bold tracking-widest uppercase sm:text-sm">
                  Canvasser Cleanup
                </DrawerTitle>
                <DrawerDescription className="text-xs leading-relaxed">
                  Review typed-in canvasser names against your saved canvasser
                  list and link only the ones that are clearly the same person.
                </DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 py-4 pb-12">
                <CleanupWorkspace
                  matches={possibleMatches}
                  isLoading={matchesLoading}
                  linkMutation={linkMutation}
                  isMobile
                />
              </div>
            </DrawerContent>
          </Drawer>

          <Drawer open={publicListOpen} onOpenChange={setPublicListOpen}>
            <DrawerContent className="max-h-[90vh]">
              <DrawerHeader className="border-border/60 bg-background/95 sticky top-0 z-10 border-b px-4 py-3 text-left backdrop-blur-sm">
                <DrawerTitle className="font-mono text-xs font-bold tracking-widest uppercase sm:text-sm">
                  Manage Canvasser List
                </DrawerTitle>
                <DrawerDescription className="text-xs">
                  Add or remove canvassers supporters can choose directly from
                  the public form dropdown.
                </DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 py-4 pb-12">
                <PublicFormListManager
                  preloaded={preloaded}
                  addMutation={addMutation}
                  removeMutation={removeMutation}
                  onRemoveClick={handleRemoveClick}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <>
          <Sheet open={cleanupOpen} onOpenChange={setCleanupOpen}>
            <SheetContent side="right" className="w-full p-0 sm:max-w-xl">
              <SheetHeader className="border-border/60 bg-background/95 sticky top-0 z-10 border-b px-4 py-3 pr-10 backdrop-blur-sm">
                <SheetTitle className="font-mono text-xs font-bold tracking-widest uppercase sm:text-sm">
                  Canvasser Cleanup
                </SheetTitle>
                <SheetDescription className="text-left text-xs leading-relaxed">
                  Compare typed-in canvasser names with your saved canvasser
                  list, then link only the clear matches.
                </SheetDescription>
              </SheetHeader>
              <div className="h-full overflow-y-auto px-4 py-4">
                <CleanupWorkspace
                  matches={possibleMatches}
                  isLoading={matchesLoading}
                  linkMutation={linkMutation}
                  isMobile={false}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={publicListOpen} onOpenChange={setPublicListOpen}>
            <SheetContent side="right" className="w-full p-0 sm:max-w-md">
              <SheetHeader className="border-border/60 bg-background/95 sticky top-0 z-10 border-b px-4 py-3 pr-10 backdrop-blur-sm">
                <SheetTitle className="font-mono text-xs font-bold tracking-widest uppercase sm:text-sm">
                  Manage Canvasser List
                </SheetTitle>
                <SheetDescription className="text-left text-xs">
                  Add or remove canvassers supporters can choose directly from
                  the public form dropdown.
                </SheetDescription>
              </SheetHeader>
              <div className="h-full overflow-y-auto px-4 py-4">
                <PublicFormListManager
                  preloaded={preloaded}
                  addMutation={addMutation}
                  removeMutation={removeMutation}
                  onRemoveClick={handleRemoveClick}
                />
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}

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
