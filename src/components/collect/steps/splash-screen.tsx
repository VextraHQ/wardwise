"use client";

import { HiArrowRight, HiCheckCircle } from "react-icons/hi";
import { ClipboardList } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { PublicCampaign } from "@/types/collect";
import { StepCard, CardSectionHeader } from "@/components/collect/form-ui";
import { ShareInviteCard } from "@/components/collect/share-invite-card";

type ReturningVisitorData = {
  name: string;
  count: number;
  submittedAt: string;
  refCode: string;
};

export function SplashScreen({
  campaign,
  hasSavedProgress,
  returningVisitor,
  onStart,
  onRestore,
}: {
  campaign: PublicCampaign;
  hasSavedProgress: boolean;
  returningVisitor: ReturningVisitorData | null;
  onStart: () => void;
  onRestore: () => void;
}) {

  if (returningVisitor) {
    const date = new Date(returningVisitor.submittedAt);
    const formattedDate = date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <StepCard>
          <CardSectionHeader
            title="Supporter Registration"
            subtitle="Status"
            statusLabel="Registered"
            icon={<HiCheckCircle className="text-primary size-4.5" />}
          />

          <div className="space-y-6 py-4 text-center">
            <div className="space-y-4">
              <div className="mx-auto flex items-center justify-center">
                <span className="text-primary bg-primary/10 border-primary/20 rounded-sm border px-3 py-1 text-[10px] font-black tracking-[0.4em] uppercase">
                  {campaign.party}
                </span>
              </div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, {returningVisitor.name.split(" ")[0]}!
              </h1>
              <p className="text-muted-foreground text-sm">
                You registered as supporter #{returningVisitor.count} on{" "}
                {formattedDate}
              </p>
            </div>

            <div className="bg-muted/30 border-border/50 mx-auto max-w-lg space-y-3 rounded-sm border p-5">
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Your Reference
              </p>
              <p className="text-foreground font-mono text-lg font-bold tracking-wider">
                {returningVisitor.refCode}
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                For {campaign.candidateName} &middot; {campaign.constituency}
              </p>
            </div>

            {/* Share & Invite Card */}
            <div className="mx-auto max-w-lg">
              <ShareInviteCard
                campaignSlug={campaign.slug}
                candidateName={campaign.candidateName}
                party={campaign.party}
              />
            </div>

            <div className="flex flex-col items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onStart}
                className="hover:bg-muted/50 h-10 w-full max-w-xs rounded-sm text-xs font-bold tracking-widest uppercase"
              >
                <IconPlus className="mr-2 h-3.5 w-3.5" />
                Register Someone Else
              </Button>
            </div>
          </div>
        </StepCard>
      </motion.div>
    );
  }

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
          statusLabel="Open"
          icon={<ClipboardList className="size-4.5" />}
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

          <div className="bg-muted/30 border-border/50 mx-auto max-w-sm space-y-4 rounded-sm border p-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Join the movement! Register as a supporter in just a few steps.
              Your information helps strengthen grassroots support.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={onStart}
              className="bg-primary text-primary-foreground hover:bg-primary/95 h-12 w-full max-w-xs rounded-sm text-xs font-bold tracking-widest uppercase shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all active:scale-95"
            >
              Begin Registration
              <HiArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {hasSavedProgress && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRestore}
                className="hover:bg-muted/50 h-10 w-full max-w-xs rounded-sm text-xs font-bold tracking-widest uppercase"
              >
                Continue where you left off
              </Button>
            )}
          </div>
        </div>
      </StepCard>
    </motion.div>
  );
}
