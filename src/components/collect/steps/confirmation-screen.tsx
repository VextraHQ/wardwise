"use client";

import { useEffect, useRef } from "react";
import { HiCheckCircle, HiShieldCheck } from "react-icons/hi";
import { HiLockClosed } from "react-icons/hi2";
import { AlertTriangle, CloudUpload, PartyPopper } from "lucide-react";
import { IconCopy, IconPlus } from "@tabler/icons-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RegistrationStepHeader } from "@/components/collect/registration-step-header";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { ShareInviteCard } from "@/components/collect/share-invite-card";
import type { PublicCampaign } from "@/types/collect";
import { getEffectiveCampaignName } from "@/lib/collect/branding";
import { track } from "@/lib/analytics/client";

export type ConfirmationScreenProps =
  | {
      state: "confirmed";
      campaign: PublicCampaign;
      submittedCount: number;
      refCode: string;
      onNewRegistration: () => void;
    }
  | {
      state: "queued";
      campaign: PublicCampaign;
      pendingCount: number;
      isOnline: boolean;
      isSyncing: boolean;
      onSyncNow: () => void;
      onNewRegistration: () => void;
    }
  | {
      state: "failed";
      campaign: PublicCampaign;
      error?: string;
      onNewRegistration: () => void;
    };

function QueueStatusCard({
  pendingCount,
  isOnline,
  isSyncing,
  onSyncNow,
  onNewRegistration,
}: {
  pendingCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  onSyncNow: () => void;
  onNewRegistration: () => void;
}) {
  if (pendingCount === 0) {
    return (
      <div className="bg-muted/10 border-border/50 rounded-sm border border-dashed p-5">
        <h3 className="text-foreground mb-3 text-xs font-bold tracking-widest uppercase">
          No Pending Uploads
        </h3>
        <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
          No pending uploads remain. If this registration uploaded successfully,
          its receipt is unavailable here. If you saw a rejection message, start
          a fresh registration with corrected details.
        </p>
        <Button
          type="button"
          onClick={onNewRegistration}
          className="h-9 w-full rounded-sm text-[10px] font-bold tracking-widest uppercase sm:w-auto"
        >
          Start New Registration
        </Button>
        <p className="text-muted-foreground/80 mt-4 text-[10px] leading-relaxed">
          Starting a new registration is safe.
        </p>
      </div>
    );
  }

  const title = "Upload Queue";
  const countLine = `${pendingCount} registration${pendingCount !== 1 ? "s" : ""} pending upload on this device`;
  const connectivityLine = isOnline
    ? "Online — ready to sync"
    : "Offline — will upload when reconnected";

  return (
    <div className="bg-muted/10 border-border/50 rounded-sm border border-dashed p-5">
      <h3 className="text-foreground mb-3 text-xs font-bold tracking-widest uppercase">
        {title}
      </h3>
      <p className="text-muted-foreground mb-2 text-xs leading-relaxed">
        {countLine}
      </p>
      <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
        {connectivityLine}
      </p>
      {isOnline && pendingCount > 0 ? (
        <button
          type="button"
          onClick={onSyncNow}
          disabled={isSyncing}
          aria-busy={isSyncing}
          className="mb-4 flex h-8 w-full items-center justify-center rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-3 font-mono text-[10px] font-bold tracking-widest text-emerald-700 uppercase transition-colors hover:bg-emerald-500/20 disabled:opacity-50 sm:w-auto dark:text-emerald-400"
        >
          {isSyncing ? "Syncing..." : "Sync Now"}
        </button>
      ) : null}
      <p className="text-muted-foreground/80 text-[10px] leading-relaxed">
        Safe on this device. No registrations will be lost as long as this
        browser data isn&apos;t cleared.
      </p>
    </div>
  );
}

export function ConfirmationScreen(props: ConfirmationScreenProps) {
  const campaignName = getEffectiveCampaignName(props.campaign);
  const hasFiredConfettiRef = useRef(false);
  const initialStateRef = useRef(props.state);
  const lastTrackedStateRef = useRef<"confirmed" | "queued" | "failed" | null>(
    null,
  );

  useEffect(() => {
    if (lastTrackedStateRef.current === props.state) return;
    lastTrackedStateRef.current = props.state;

    track("collect_confirmation_viewed", {
      state: props.state,
      pending_count: props.state === "queued" ? props.pendingCount : 0,
      flipped_from_queued:
        initialStateRef.current === "queued" &&
        (props.state === "confirmed" || props.state === "failed"),
    });
    // Intentionally once per distinct `state` value (not on pendingCount ticks).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [props.state]);

  useEffect(() => {
    if (props.state !== "confirmed" || hasFiredConfettiRef.current) return;
    hasFiredConfettiRef.current = true;
    const timer = window.setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#46C2A7", "#1D453A", "#0f2b24"],
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [props.state]);

  const handleCopyReference = async () => {
    if (props.state !== "confirmed") return;
    try {
      await navigator.clipboard.writeText(props.refCode);
      toast.success("Reference code copied");
    } catch {
      toast.error("Could not copy reference code");
    }
  };

  return (
    <div className="space-y-6">
      <section
        className="text-center"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="mb-5 flex justify-center">
          <div className="relative">
            {props.state === "confirmed" ? (
              <>
                <div className="border-primary/40 absolute inset-0 animate-ping rounded-full border-2 opacity-30" />
                <div className="bg-primary/10 border-primary relative flex h-20 w-20 items-center justify-center rounded-full border-2 sm:h-24 sm:w-24">
                  <HiCheckCircle className="text-primary animate-in zoom-in h-10 w-10 duration-500 sm:h-12 sm:w-12" />
                </div>
              </>
            ) : props.state === "queued" ? (
              <>
                <div className="absolute inset-0 animate-ping rounded-full border-2 border-amber-500/40 opacity-30" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-500/30 bg-amber-500/5 text-amber-700 sm:h-24 sm:w-24 dark:text-amber-400">
                  <CloudUpload className="animate-in zoom-in h-10 w-10 duration-500 sm:h-12 sm:w-12" />
                </div>
              </>
            ) : (
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-500/40 bg-red-500/5 text-red-600 sm:h-24 sm:w-24 dark:text-red-400">
                <AlertTriangle className="animate-in zoom-in h-10 w-10 duration-500 sm:h-12 sm:w-12" />
              </div>
            )}
          </div>
        </div>

        {props.state === "confirmed" ? (
          <RegistrationStepHeader
            icon={PartyPopper}
            badge="Registration Complete"
            title="You're All Set!"
            description="Thank you for registering your support. Your details have been received."
          />
        ) : props.state === "queued" ? (
          <RegistrationStepHeader
            icon={
              <CloudUpload className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            }
            badge="Pending Upload"
            badgeClassName="text-amber-700 dark:text-amber-400"
            title="Saved — Waiting to Upload"
            description="This registration is stored on this device. It will upload automatically when this page is open and internet is available."
          />
        ) : (
          <RegistrationStepHeader
            icon={
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            }
            badge="Needs Attention"
            badgeClassName="text-red-600 dark:text-red-400"
            title="Upload Failed"
            description="This registration was not accepted by the server. Start a fresh registration with corrected details."
          />
        )}
      </section>

      {props.state === "confirmed" && (
        <>
          <p className="text-muted-foreground mx-auto max-w-md text-center text-sm leading-relaxed">
            The campaign team will review and verify your registration.
          </p>

          <div className="mt-2 space-y-2 text-center">
            <div className="border-border/60 bg-muted/30 inline-flex items-center gap-3 rounded-sm border border-dashed px-5 py-2.5">
              <span className="text-muted-foreground/60 text-[10px] font-bold tracking-[0.2em] uppercase">
                Registration Reference
              </span>
              <div className="bg-border/50 h-3 w-px" />
              <span className="text-foreground font-mono text-sm font-bold tracking-widest">
                {props.refCode}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyReference}
                className="text-muted-foreground hover:text-foreground h-7 rounded-sm px-2 text-[10px] font-bold tracking-widest uppercase"
              >
                <IconCopy className="mr-1 h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
            <p className="text-muted-foreground text-center text-xs leading-relaxed">
              Keep this reference if you need help with this registration.
            </p>
          </div>
        </>
      )}

      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={props.onNewRegistration}
          aria-label="Start a new registration"
          className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 rounded-sm px-4 text-[10px] font-bold tracking-widest uppercase"
        >
          <IconPlus className="h-3.5 w-3.5" />
          New Registration
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative overflow-hidden border"
      >
        <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

        <div className="space-y-6 p-7 sm:p-10">
          <div className="border-border/40 border-b pb-6">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
                {campaignName}
              </h2>
              <div className="flex items-center gap-2">
                <Badge
                  variant="default"
                  className="text-[9px] font-bold tracking-widest uppercase"
                >
                  {props.campaign.party}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  {props.campaign.constituency}
                </span>
              </div>
            </div>
          </div>

          {props.state === "confirmed" ? (
            <div className="bg-muted/10 border-border/50 rounded-sm border border-dashed p-5">
              <h3 className="text-foreground mb-4 text-xs font-bold tracking-widest uppercase">
                What Happens Next?
              </h3>
              <ul className="space-y-2.5 text-xs">
                <li className="text-muted-foreground flex items-start gap-2 leading-relaxed">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  <span>Your registration has been saved securely</span>
                </li>
                <li className="text-muted-foreground flex items-start gap-2 leading-relaxed">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  <span>
                    The campaign team will review and verify your details
                  </span>
                </li>
                <li className="text-muted-foreground flex items-start gap-2 leading-relaxed">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  <span>Share the link below to help grow the movement</span>
                </li>
              </ul>
            </div>
          ) : props.state === "queued" ? (
            <QueueStatusCard
              pendingCount={props.pendingCount}
              isOnline={props.isOnline}
              isSyncing={props.isSyncing}
              onSyncNow={props.onSyncNow}
              onNewRegistration={props.onNewRegistration}
            />
          ) : (
            <div className="rounded-sm border border-dashed border-red-500/30 bg-red-500/5 p-5">
              <h3 className="mb-3 text-xs font-bold tracking-widest text-red-700 uppercase dark:text-red-400">
                Sync Failed
              </h3>
              <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
                The server rejected this registration. It was not added to the
                campaign.
              </p>
              {props.error ? (
                <div className="border-border/50 bg-background/60 mb-4 rounded-sm border p-3">
                  <p className="text-muted-foreground/70 mb-1 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Server response
                  </p>
                  <p className="text-foreground font-mono text-xs wrap-break-word">
                    {props.error}
                  </p>
                </div>
              ) : null}
              <Button
                type="button"
                onClick={props.onNewRegistration}
                className="h-9 w-full rounded-sm text-[10px] font-bold tracking-widest uppercase sm:w-auto"
              >
                Start New Registration
              </Button>
              <p className="text-muted-foreground/80 mt-4 text-[10px] leading-relaxed">
                Retrying the same details will usually fail again. Correct the
                information and submit a fresh registration.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {props.state === "confirmed" && (
        <ShareInviteCard
          campaignSlug={props.campaign.slug}
          campaignName={campaignName}
          party={props.campaign.party}
          animated
          animationDelay={0.2}
        />
      )}

      {props.state === "confirmed" ? (
        <TrustIndicators
          items={[
            { icon: <HiShieldCheck />, label: "COMPLETE_REGISTRATION" },
            { icon: <HiLockClosed />, label: "SECURE_ENCRYPTION" },
            { icon: <HiCheckCircle />, label: "VERIFIED_SUPPORTER" },
          ]}
        />
      ) : props.state === "queued" ? (
        <TrustIndicators
          variant="canvasser"
          items={[
            { icon: <CloudUpload />, label: "PENDING_UPLOAD" },
            { icon: <HiLockClosed />, label: "SAVED_ON_DEVICE" },
            { icon: <HiShieldCheck />, label: "ENCRYPTED_LOCALLY" },
          ]}
        />
      ) : (
        <TrustIndicators
          variant="destructive"
          items={[
            { icon: <AlertTriangle />, label: "NEEDS_ATTENTION" },
            { icon: <HiLockClosed />, label: "SAVED_ON_DEVICE" },
            { icon: <AlertTriangle />, label: "NOT_SUBMITTED" },
          ]}
        />
      )}
    </div>
  );
}
