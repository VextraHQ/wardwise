"use client";

import { HiArrowRight, HiCheckCircle } from "react-icons/hi";
import { ClipboardList } from "lucide-react";
import { IconCopy, IconPlus, IconRestore } from "@tabler/icons-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { PublicCampaign } from "@/types/collect";
import { StepCard, CardSectionHeader } from "@/components/collect/form-ui";
import type { DeviceSubmissionData } from "@/hooks/use-collect-form-persistence";

function formatSubmittedDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function SplashScreen({
  campaign,
  hasSavedProgress,
  deviceSubmission,
  onStart,
  onStartFresh,
  onRestore,
  onCopyReference,
}: {
  campaign: PublicCampaign;
  hasSavedProgress: boolean;
  deviceSubmission: DeviceSubmissionData | null;
  onStart: () => void;
  onStartFresh: () => void;
  onRestore: () => void;
  onCopyReference: () => void;
}) {
  const showDeviceSubmissionNote = !hasSavedProgress && !!deviceSubmission;
  const formattedDate =
    deviceSubmission ? formatSubmittedDate(deviceSubmission.submittedAt) : null;

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

        <div className="space-y-8 py-4 text-center">
          <div className="space-y-4">
            <div className="mx-auto flex items-center justify-center">
              <span className="text-primary bg-primary/10 border-primary/20 rounded-sm border px-3 py-1 text-[10px] font-black tracking-[0.4em] uppercase">
                {campaign.party}
              </span>
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              {campaign.candidateName}
            </h1>
            {campaign.candidateTitle && (
              <p className="text-muted-foreground font-medium">
                {campaign.candidateTitle}
              </p>
            )}
            <p className="text-muted-foreground/60 mt-4 font-mono text-[10px] tracking-widest uppercase">
              [ TARGET: {campaign.constituency} ]
            </p>
          </div>

          {hasSavedProgress ? (
            <div className="border-primary/20 bg-primary/5 mx-auto max-w-sm space-y-3 rounded-sm border p-4 text-left">
              <p className="text-foreground text-sm font-semibold">
                You have an unfinished registration on this device.
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Continue from where you stopped, or start a fresh registration
                if you&apos;re entering details for someone else.
              </p>
            </div>
          ) : (
            <div className="bg-muted/30 border-border/50 mx-auto max-w-sm space-y-4 rounded-sm border p-4">
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
                  className="bg-primary text-primary-foreground hover:bg-primary/95 h-12 w-full max-w-xs rounded-sm text-xs font-bold tracking-widest uppercase shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all active:scale-95"
                >
                  Continue where you left off
                  <HiArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStartFresh}
                  className="hover:bg-muted/50 h-10 w-full max-w-xs rounded-sm text-xs font-bold tracking-widest uppercase"
                >
                  <IconPlus className="mr-2 h-3.5 w-3.5" />
                  Start Fresh
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={onStart}
                className="bg-primary text-primary-foreground hover:bg-primary/95 h-12 w-full max-w-xs rounded-sm text-xs font-bold tracking-widest uppercase shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all active:scale-95"
              >
                Begin Registration
                <HiArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {showDeviceSubmissionNote && deviceSubmission && formattedDate && (
            <div className="border-border/60 bg-card/60 mx-auto max-w-lg rounded-sm border p-4 text-left">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <HiCheckCircle className="text-primary h-4 w-4" />
                    <p className="text-foreground text-xs font-bold tracking-widest uppercase">
                      Last Registration On This Device
                    </p>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Completed on {formattedDate}. Keep the reference code if you
                    need to confirm a previous registration later.
                  </p>
                  <p className="text-foreground font-mono text-sm font-bold tracking-wider">
                    {deviceSubmission.refCode}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopyReference}
                  className="hover:bg-muted/50 h-9 rounded-sm text-[10px] font-bold tracking-widest uppercase"
                >
                  <IconCopy className="mr-1.5 h-3.5 w-3.5" />
                  Copy Reference
                </Button>
              </div>
            </div>
          )}
        </div>
      </StepCard>
    </motion.div>
  );
}
