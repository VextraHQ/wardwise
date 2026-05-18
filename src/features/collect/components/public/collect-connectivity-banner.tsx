"use client";

import { CloudOff, RefreshCw, UploadCloud } from "lucide-react";

type CollectConnectivityBannerProps = {
  isOffline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  /**
   * Hard-signal pack health flag — currently driven only by `scope_invalid`.
   * `aged` and `content_outdated` are intentionally NOT surfaced here to keep
   * this banner reserved for actionable signals.
   */
  needsRefresh?: boolean;
  onSyncNow: () => void;
};

export function CollectConnectivityBanner({
  isOffline,
  pendingCount,
  isSyncing,
  needsRefresh = false,
  onSyncNow,
}: CollectConnectivityBannerProps) {
  if (!isOffline && pendingCount === 0 && !isSyncing && !needsRefresh) {
    return null;
  }

  const copy = isSyncing
    ? {
        tone: "emerald" as const,
        Icon: RefreshCw,
        label: "Syncing",
        body:
          pendingCount > 0
            ? `Uploading ${pendingCount} saved submission${pendingCount === 1 ? "" : "s"} from this device.`
            : "Uploading saved submissions from this device.",
        action: null,
        spin: true,
      }
    : needsRefresh
      ? {
          tone: "red" as const,
          Icon: RefreshCw,
          label: "Refresh required",
          body: isOffline
            ? "Some saved areas are no longer part of this campaign. Reconnect to refresh — submissions made now will be rejected on sync."
            : "Some saved areas are no longer part of this campaign. Refresh your offline data before going offline again.",
          action: null,
          spin: false,
        }
      : isOffline
        ? {
            tone: "amber" as const,
            Icon: CloudOff,
            label: "Offline",
            body:
              pendingCount > 0
                ? `${pendingCount} saved submission${pendingCount === 1 ? "" : "s"} will upload when this device reconnects.`
                : "New submissions will be saved on this device until you reconnect.",
            action: null,
            spin: false,
          }
        : {
            tone: "emerald" as const,
            Icon: UploadCloud,
            label: "Back online",
            body: `${pendingCount} saved submission${pendingCount === 1 ? "" : "s"} ready to upload.`,
            action: "Sync now" as const,
            spin: false,
          };

  const styles =
    copy.tone === "amber"
      ? {
          wrapper:
            "border-amber-500/20 bg-amber-500/6 text-amber-800 dark:text-amber-300",
          button:
            "border-amber-500/30 bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 dark:text-amber-300",
        }
      : copy.tone === "red"
        ? {
            wrapper:
              "border-red-500/25 bg-red-500/[0.06] text-red-800 dark:text-red-300",
            button:
              "border-red-500/30 bg-red-500/10 text-red-800 hover:bg-red-500/20 dark:text-red-300",
          }
        : {
            wrapper:
              "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-800 dark:text-emerald-300",
            button:
              "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-300",
          };

  const { Icon } = copy;

  return (
    <div className={`border-b ${styles.wrapper}`}>
      <div className="mx-auto flex w-full max-w-2xl items-start justify-between gap-3 px-4 py-2 sm:items-center sm:px-4">
        <div className="flex min-w-0 items-start gap-2">
          <Icon
            className={`mt-0.5 size-3.5 shrink-0 ${copy.spin ? "animate-spin" : ""}`}
          />
          <p className="min-w-0 text-xs leading-relaxed">
            <span className="mr-2 font-mono text-[10px] font-bold tracking-widest uppercase">
              {copy.label}
            </span>
            <span>{copy.body}</span>
          </p>
        </div>

        {copy.action ? (
          <button
            type="button"
            onClick={onSyncNow}
            disabled={isSyncing}
            className={`inline-flex h-7 shrink-0 items-center justify-center rounded-sm border px-2.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-colors disabled:opacity-50 ${styles.button}`}
          >
            {isSyncing ? "Syncing..." : copy.action}
          </button>
        ) : null}
      </div>
    </div>
  );
}
