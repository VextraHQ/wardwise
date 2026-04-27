"use client";

import { HiArrowRight, HiCheckCircle } from "react-icons/hi";
import {
  ClipboardList,
  CloudDownload,
  CloudOff,
  RefreshCw,
} from "lucide-react";
import { IconCopy, IconPlus, IconRestore } from "@tabler/icons-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { PublicCampaign } from "@/types/collect";
import { StepCard, CardSectionHeader } from "@/components/collect/form-ui";
import type { DeviceSubmissionData } from "@/hooks/use-collect-form-persistence";
import type { OfflineGeoHealth } from "@/lib/collect/offline-geo-health";
import {
  getEffectiveCampaignName,
  shouldShowCandidateTitle,
} from "@/lib/collect/branding";

function formatSubmittedDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

export function SplashScreen({
  campaign,
  hasSavedProgress,
  deviceSubmission,
  offlineHealth,
  isOffline,
  preparedLgaCount,
  preparedAt,
  onStart,
  onStartFresh,
  onRestore,
  onCopyReference,
  onOpenPrepSheet,
}: {
  campaign: PublicCampaign;
  hasSavedProgress: boolean;
  deviceSubmission: DeviceSubmissionData | null;
  offlineHealth: OfflineGeoHealth;
  isOffline: boolean;
  preparedLgaCount: number;
  preparedAt: string | null;
  onStart: () => void;
  onStartFresh: () => void;
  onRestore: () => void;
  onCopyReference: () => void;
  onOpenPrepSheet: () => void;
}) {
  // Block fresh start when offline AND the local data isn't trustworthy:
  // either there's no pack at all, or the server already confirmed some of
  // the saved LGAs are out of scope. In both cases new submissions would
  // either be impossible (no_pack) or guaranteed to fail at sync.
  const blockFreshStart =
    isOffline &&
    (offlineHealth === "no_pack" || offlineHealth === "scope_invalid");
  const showDeviceSubmissionNote = !hasSavedProgress && !!deviceSubmission;
  const formattedDate = deviceSubmission
    ? formatSubmittedDate(deviceSubmission.submittedAt)
    : null;
  const campaignName = getEffectiveCampaignName(campaign);
  const showCandidateTitle = shouldShowCandidateTitle(campaign);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <StepCard>
        <CardSectionHeader
          title="Supporter Registration"
          subtitle="Get Started"
          statusLabel={hasSavedProgress ? "Resume Available" : "Open"}
          icon={
            hasSavedProgress ? (
              <IconRestore className="size-4.5" />
            ) : (
              <ClipboardList className="size-4.5" />
            )
          }
        />

        <div className="space-y-6 py-4 text-center">
          <div className="space-y-5">
            <div className="mx-auto flex items-center justify-center gap-3">
              <div className="bg-primary h-px w-8" />
              <span className="text-primary text-[10px] font-black tracking-widest uppercase">
                {campaign.party}
              </span>
              <div className="bg-primary h-px w-8" />
            </div>

            <div className="flex flex-col items-center justify-center space-y-3">
              <h1 className="text-foreground text-3xl font-black tracking-tight text-balance sm:text-4xl">
                {showCandidateTitle && campaign.candidateTitle && (
                  <span className="text-muted-foreground mr-2 font-medium">
                    {campaign.candidateTitle}
                  </span>
                )}
                {campaignName}
              </h1>
              <p className="text-muted-foreground mx-auto max-w-sm text-xs leading-relaxed font-semibold tracking-widest text-balance uppercase">
                {campaign.constituency}
              </p>
            </div>
          </div>

          {hasSavedProgress ? (
            <div className="border-primary/30 bg-primary/5 mx-auto max-w-sm space-y-2 rounded-sm border border-dashed p-4 text-left">
              <p className="text-foreground text-center text-sm font-semibold">
                You have an unfinished registration on this device.
              </p>
              <p className="text-muted-foreground text-center text-xs leading-relaxed">
                Continue from where you stopped, or start a fresh registration
                if you&apos;re entering details for someone else.
              </p>
            </div>
          ) : (
            <div className="bg-muted/30 border-border/50 mx-auto max-w-sm space-y-4 rounded-sm border border-dashed p-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Join the movement! Register as a supporter in just a few steps.
                Your information helps strengthen grassroots support.
              </p>
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            {hasSavedProgress ? (
              <>
                <Button
                  size="lg"
                  onClick={onRestore}
                  className="bg-primary text-primary-foreground hover:bg-primary/95 h-12 w-full max-w-sm rounded-sm text-xs font-bold tracking-widest uppercase transition-all active:scale-95"
                >
                  Continue where you left off
                  <HiArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStartFresh}
                  disabled={blockFreshStart}
                  className="hover:bg-muted/50 h-10 w-full max-w-sm rounded-sm text-xs font-bold tracking-widest uppercase disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <IconPlus className="mr-2 h-3.5 w-3.5" />
                  Start Fresh
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={onStart}
                disabled={blockFreshStart}
                className="bg-primary text-primary-foreground hover:bg-primary/95 h-12 w-full max-w-sm rounded-sm text-xs font-bold tracking-widest uppercase transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Begin registration
                <HiArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          <OfflinePrepCard
            health={offlineHealth}
            isOffline={isOffline}
            preparedLgaCount={preparedLgaCount}
            preparedAt={preparedAt}
            onOpen={onOpenPrepSheet}
          />

          {showDeviceSubmissionNote && deviceSubmission && formattedDate && (
            <div className="mx-auto w-full max-w-sm text-left">
              <div className="group border-border bg-muted/10 hover:border-primary/30 hover:bg-primary/5 relative overflow-hidden rounded-sm border border-dashed px-4 py-3 transition-colors duration-300">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="bg-primary/10 flex size-4 items-center justify-center rounded-full">
                        <HiCheckCircle className="text-primary h-3 w-3" />
                      </div>
                      <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
                        Recent Registration Found
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-foreground font-mono text-[13px] font-bold tracking-[0.15em]">
                        {deviceSubmission.refCode}
                      </span>
                      <span className="text-muted-foreground font-mono text-[9px] tracking-widest uppercase">
                        / {formattedDate}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCopyReference}
                    className="text-muted-foreground group-hover:text-primary h-8 w-8 shrink-0 rounded-sm transition-colors"
                  >
                    <IconCopy className="h-4 w-4" />
                    <span className="sr-only">Copy Reference</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </StepCard>
    </motion.div>
  );
}

type PrepCardProps = {
  health: OfflineGeoHealth;
  isOffline: boolean;
  preparedLgaCount: number;
  preparedAt: string | null;
  onOpen: () => void;
};

type PrepCardCopy = {
  tone: "neutral" | "ready" | "warning" | "alert";
  Icon: typeof CloudDownload;
  label: string;
  title: string;
  body: string;
  action: { kind: "open"; text: string } | null;
};

function getPrepCardCopy({
  health,
  isOffline,
  preparedLgaCount,
  preparedAt,
}: Omit<PrepCardProps, "onOpen">): PrepCardCopy {
  const ageDays = preparedAt ? daysSince(preparedAt) : 0;

  if (isOffline) {
    if (health === "no_pack") {
      return {
        tone: "warning",
        Icon: CloudOff,
        label: "Offline",
        title: "Offline setup required",
        body: "You're offline and no campaign data has been saved on this device. Reconnect to prepare offline data, or restore a saved draft.",
        action: null,
      };
    }
    if (health === "scope_invalid") {
      // Server already confirmed (last time we were online) that some saved
      // LGAs are no longer in scope. Don't pretend the pack is usable just
      // because we're offline now.
      return {
        tone: "alert",
        Icon: RefreshCw,
        label: "Offline",
        title: "Saved areas need a refresh",
        body: "One or more LGAs in your offline data are no longer part of this campaign. Reconnect to refresh — submissions made now would be rejected on sync.",
        action: null,
      };
    }
    return {
      tone: "ready",
      Icon: CloudDownload,
      label: "Offline",
      title: "Offline ready on this device",
      body: `Saved ${preparedLgaCount} LGA${preparedLgaCount === 1 ? "" : "s"}${preparedAt ? ` · prepared ${ageDays === 0 ? "today" : `${ageDays}d ago`}` : ""}.`,
      action: null,
    };
  }

  if (health === "no_pack") {
    return {
      tone: "neutral",
      Icon: CloudDownload,
      label: "Offline",
      title: "Offline not ready",
      body: "Save selected LGAs to this device so you can complete registrations without network later.",
      action: { kind: "open", text: "Prepare offline" },
    };
  }

  if (health === "scope_invalid") {
    return {
      tone: "alert",
      Icon: RefreshCw,
      label: "Offline",
      title: "Refresh required",
      body: "One or more saved LGAs are no longer part of this campaign. Refresh your offline data before going offline.",
      action: { kind: "open", text: "Refresh offline data" },
    };
  }

  if (health === "content_outdated") {
    return {
      tone: "warning",
      Icon: RefreshCw,
      label: "Offline",
      title: "Campaign updated since prep",
      body: `Your offline data still works, but the campaign has changed since you prepared it. ${preparedLgaCount} LGA${preparedLgaCount === 1 ? "" : "s"} saved.`,
      action: { kind: "open", text: "Refresh offline data" },
    };
  }

  if (health === "aged") {
    return {
      tone: "neutral",
      Icon: RefreshCw,
      label: "Offline",
      title: `Offline data is ${ageDays} days old`,
      body: `${preparedLgaCount} LGA${preparedLgaCount === 1 ? "" : "s"} saved. Refresh if the campaign or boundaries may have changed.`,
      action: { kind: "open", text: "Refresh" },
    };
  }

  return {
    tone: "ready",
    Icon: CloudDownload,
    label: "Offline",
    title: "Offline ready",
    body: `Saved ${preparedLgaCount} LGA${preparedLgaCount === 1 ? "" : "s"}${preparedAt ? ` · prepared ${ageDays === 0 ? "today" : `${ageDays}d ago`}` : ""}.`,
    action: { kind: "open", text: "Manage offline areas" },
  };
}

const TONE_STYLES = {
  neutral: {
    border: "border-border/60",
    bg: "bg-muted/20",
    iconBg: "bg-muted",
    iconText: "text-muted-foreground",
  },
  ready: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-600 dark:text-amber-400",
  },
  alert: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    iconBg: "bg-red-500/10",
    iconText: "text-red-600 dark:text-red-400",
  },
};

function OfflinePrepCard({
  health,
  isOffline,
  preparedLgaCount,
  preparedAt,
  onOpen,
}: PrepCardProps) {
  const copy = getPrepCardCopy({
    health,
    isOffline,
    preparedLgaCount,
    preparedAt,
  });
  const styles = TONE_STYLES[copy.tone];
  const { Icon } = copy;

  return (
    <div
      className={`mx-auto w-full max-w-sm overflow-hidden rounded-sm border border-dashed px-4 py-3 text-left ${styles.border} ${styles.bg}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}
        >
          <Icon className={`size-4 ${styles.iconText}`} />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p
            className={`font-mono text-[10px] font-bold tracking-widest uppercase ${styles.iconText}`}
          >
            {copy.label}
          </p>
          <p className="text-foreground text-sm font-semibold">{copy.title}</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {copy.body}
          </p>
          {copy.action ? (
            <button
              type="button"
              onClick={onOpen}
              className="border-foreground/20 hover:bg-foreground/5 mt-2 inline-flex h-8 items-center justify-center rounded-sm border px-3 font-mono text-[10px] font-bold tracking-widest uppercase transition-colors"
            >
              {copy.action.text}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
