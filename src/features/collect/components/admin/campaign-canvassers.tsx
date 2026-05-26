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
import { AdminFilterTabs } from "@/components/shared/admin/admin-filter-tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/shared/use-mobile";
import { cn, formatPersonName } from "@/lib/utils";
import { toast } from "sonner";
import { adminCollectApi } from "@/features/collect/api/collect-api";
import { track } from "@/lib/analytics/client";
import type { ExportFormat } from "@/lib/exports/shared";
import { readPreferredExportFormat } from "@/lib/exports/client-preferences";
import {
  EMPTY_MATCHES,
  EMPTY_PRELOADED,
  EMPTY_REFERRAL_ACTIVITY,
  exportFormatMeta,
  type SourceFilter,
} from "@/features/collect/lib/campaign-canvassers";
import { CampaignCanvassersPublicList } from "@/features/collect/components/admin/campaign-canvassers-public-list";
import { CampaignCanvassersReferralActivity } from "@/features/collect/components/admin/campaign-canvassers-referral-activity";
import { CampaignCanvassersCleanupWorkspace } from "@/features/collect/components/admin/campaign-canvassers-cleanup-workspace";

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
          <AdminFilterTabs
            value={sourceFilter}
            onValueChange={focusReferralSection}
            ariaLabel="Filter canvasser entries by source"
            options={[
              {
                value: "all",
                label: "All",
                count: referralActivity.length,
              },
              {
                value: "manual",
                label: "Typed In",
                count: manualEntries.length,
              },
              {
                value: "known",
                label: "From List",
                count: knownEntries.length,
              },
            ]}
          />
        </div>

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
        <CampaignCanvassersReferralActivity
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
                <CampaignCanvassersCleanupWorkspace
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
                <CampaignCanvassersPublicList
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
                <CampaignCanvassersCleanupWorkspace
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
                <CampaignCanvassersPublicList
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
