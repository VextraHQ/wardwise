"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { HiSearch } from "react-icons/hi";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCampaignLgas } from "@/hooks/use-collect";
import { formatGeoDisplayName } from "@/lib/geo/display";
import {
  getEffectiveSelection,
  getPrepIntent,
  getStalePreparedIds,
  getVisibleIds,
} from "@/lib/collect/offline-prep-selection";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignSlug: string;
  preparedLgaIds: number[];
  isPreparing: boolean;
  hasExistingPack: boolean;
  isOffline: boolean;
  onPrepare: (lgaIds: number[]) => Promise<void>;
  onClear: () => Promise<void>;
};

export function OfflinePrepSheet({
  open,
  onOpenChange,
  campaignSlug,
  preparedLgaIds,
  isPreparing,
  hasExistingPack,
  isOffline,
  onPrepare,
  onClear,
}: Props) {
  const isMobile = useIsMobile();

  // The sheet's state always reflects the latest prepared LGAs each time it is opened.
  return (
    <Sheet open={open} onOpenChange={isPreparing ? () => {} : onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "max-h-[min(90dvh,90svh)] min-h-0 gap-0 overflow-hidden p-0"
            : "gap-0 overflow-hidden p-0"
        }
      >
        {open ? (
          <PrepSheetBody
            campaignSlug={campaignSlug}
            preparedLgaIds={preparedLgaIds}
            isPreparing={isPreparing}
            hasExistingPack={hasExistingPack}
            isOffline={isOffline}
            onPrepare={onPrepare}
            onClear={onClear}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function PrepSheetBody({
  campaignSlug,
  preparedLgaIds,
  isPreparing,
  hasExistingPack,
  isOffline,
  onPrepare,
  onClear,
  onClose,
}: {
  campaignSlug: string;
  preparedLgaIds: number[];
  isPreparing: boolean;
  hasExistingPack: boolean;
  isOffline: boolean;
  onPrepare: (lgaIds: number[]) => Promise<void>;
  onClear: () => Promise<void>;
  onClose: () => void;
}) {
  const { data: lgas = [], isLoading, isError } = useCampaignLgas(campaignSlug);
  // Set of selected LGA IDs. Starts from previously prepared list.
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(preparedLgaIds),
  );
  // For handling search input
  const [search, setSearch] = useState("");

  // Check if LGAs have loaded successfully
  const lgasLoadedSuccessfully = !isLoading && !isError;
  // IDs of all currently visible LGAs, or null if not loaded successfully
  const visibleIds = useMemo(
    () => (lgasLoadedSuccessfully ? getVisibleIds(lgas) : null),
    [lgas, lgasLoadedSuccessfully],
  );
  // Only show/check LGAs that are still allowed in this campaign
  const effectiveSelection = useMemo(
    () => (visibleIds ? getEffectiveSelection(selected, visibleIds) : selected),
    [selected, visibleIds],
  );
  // IDs of saved LGAs that are no longer in the allowed/visible list
  const stalePreparedIds = useMemo(
    () => (visibleIds ? getStalePreparedIds(preparedLgaIds, visibleIds) : []),
    [preparedLgaIds, visibleIds],
  );
  // What should the save/remove CTA be?
  const intent = getPrepIntent({
    effectiveCount: effectiveSelection.size,
    hasExistingPack,
  });

  // Filter LGAs by search term
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return lgas;
    return lgas.filter((l) => l.name.toLowerCase().includes(term));
  }, [lgas, search]);

  // Toggle LGA selection, unless preparing
  const toggle = (id: number) => {
    if (isPreparing) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle saving new offline LGA selection
  const handlePrepare = async () => {
    const ids = Array.from(effectiveSelection);
    if (ids.length === 0 || isPreparing) return;
    try {
      await onPrepare(ids);
      toast.success(
        `Saved ${ids.length} LGA${ids.length === 1 ? "" : "s"} for offline use`,
        {
          description: "This data is stored on this device only.",
        },
      );
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download failed";
      toast.error("Could not save offline data", {
        description: `${message}. Your previous offline data is unchanged.`,
      });
    }
  };

  // Handle clearing all offline data
  const handleClear = async () => {
    try {
      await onClear();
      toast.success("Offline data removed", {
        description:
          "Saved LGAs, wards, and polling units were cleared from this device.",
      });
      onClose();
    } catch {
      toast.error("Could not remove offline data");
    }
  };

  // Show stale warning if some saved LGAs are missing from the current campaign
  const showStaleWarning = !isLoading && stalePreparedIds.length > 0;
  // Count of currently effective selections
  const effectiveCount = effectiveSelection.size;

  return (
    <>
      <SheetHeader className="border-border shrink-0 border-b p-4 text-left">
        <SheetTitle>Prepare offline areas</SheetTitle>
        <SheetDescription>
          Choose the LGAs you need offline. Wards and polling units for those
          LGAs are downloaded once so the form works without network. This data
          is saved on this device/browser only.
        </SheetDescription>
      </SheetHeader>

      <div className="border-border shrink-0 border-b p-4">
        <div className="relative">
          <HiSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search LGAs"
            className="pl-9"
            disabled={isPreparing}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {/* Show a warning if there are old saved LGAs that are no longer available */}
        {showStaleWarning ? (
          <div className="mb-3 rounded-sm border border-dashed border-amber-500/30 bg-amber-500/5 px-3 py-2">
            <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
              {stalePreparedIds.length === 1
                ? "1 previously saved LGA is no longer available and will be removed when you save."
                : `${stalePreparedIds.length} previously saved LGAs are no longer available and will be removed when you save.`}
            </p>
          </div>
        ) : null}

        {/* Show loading, error, search results, or the list */}
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading LGAs…</p>
        ) : isError ? (
          <p className="text-destructive text-sm">
            Could not load LGAs. Please reconnect and try again.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No LGAs match &quot;{search}&quot;.
          </p>
        ) : (
          <ul className="space-y-1">
            {filtered.map((lga) => {
              const checked = selected.has(lga.id);
              const id = `offline-prep-lga-${lga.id}`;
              return (
                <li key={lga.id}>
                  <label
                    htmlFor={id}
                    className={`hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-sm border border-transparent px-3 py-2 transition-colors ${
                      isPreparing ? "cursor-not-allowed opacity-60" : ""
                    }`}
                  >
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => toggle(lga.id)}
                      disabled={isPreparing}
                    />
                    <span className="text-foreground text-sm">
                      {formatGeoDisplayName(lga.name)}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <SheetFooter className="border-border shrink-0 border-t">
        <PrepCta
          intent={intent}
          isPreparing={isPreparing}
          isLoading={isLoading}
          isError={isError}
          isOffline={isOffline}
          effectiveCount={effectiveCount}
          onSave={handlePrepare}
          onClear={handleClear}
        />
      </SheetFooter>
    </>
  );
}

function PrepCta({
  intent,
  isPreparing,
  isLoading,
  isError,
  isOffline,
  effectiveCount,
  onSave,
  onClear,
}: {
  intent: "save" | "clear" | "disabled";
  isPreparing: boolean;
  isLoading: boolean;
  isError: boolean;
  isOffline: boolean;
  effectiveCount: number;
  onSave: () => void;
  onClear: () => void;
}) {
  if (intent === "save") {
    // Only allow saving if we're not preparing/loading, and there's no error
    const disabled = isPreparing || isLoading || isError;
    return (
      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        className="bg-primary text-primary-foreground hover:bg-primary/95 inline-flex h-10 w-full items-center justify-center rounded-sm px-4 text-xs font-semibold tracking-widest uppercase transition-colors disabled:pointer-events-none disabled:opacity-50"
      >
        {isPreparing ? (
          <>
            <Spinner className="mr-2 h-4 w-4 shrink-0" />
            Saving…
          </>
        ) : (
          `Save ${effectiveCount} LGA${effectiveCount === 1 ? "" : "s"} offline`
        )}
      </button>
    );
  }

  if (intent === "clear") {
    // Show dialog to confirm removing offline data
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            disabled={isPreparing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex h-10 w-full items-center justify-center rounded-sm px-4 text-xs font-semibold tracking-widest uppercase transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            Remove offline data
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove offline data for this campaign?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isOffline
                ? "You're offline. Removing this data will block the location step until you reconnect and prepare again. The campaign itself is not affected."
                : "This removes the saved LGAs, wards, and polling units from this device only. The campaign and your past submissions are not affected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep offline data</AlertDialogCancel>
            <AlertDialogAction onClick={onClear}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // If nothing is selected, show disabled button
  return (
    <button
      type="button"
      disabled
      className="bg-muted text-muted-foreground inline-flex h-10 w-full items-center justify-center rounded-sm px-4 text-xs font-semibold tracking-widest uppercase opacity-60"
    >
      Select LGAs to save offline
    </button>
  );
}
