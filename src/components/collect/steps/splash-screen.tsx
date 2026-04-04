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
  const formattedDate = deviceSubmission
    ? formatSubmittedDate(deviceSubmission.submittedAt)
    : null;

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
                {campaign.candidateTitle && (
                  <span className="text-muted-foreground mr-2 font-medium">
                    {campaign.candidateTitle}
                  </span>
                )}
                {campaign.candidateName}
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
                  className="hover:bg-muted/50 h-10 w-full max-w-sm rounded-sm text-xs font-bold tracking-widest uppercase"
                >
                  <IconPlus className="mr-2 h-3.5 w-3.5" />
                  Start Fresh
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={onStart}
                className="bg-primary text-primary-foreground hover:bg-primary/95 h-12 w-full max-w-sm rounded-sm text-xs font-bold tracking-widest uppercase transition-all active:scale-95"
              >
                Begin Registration
                <HiArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

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
