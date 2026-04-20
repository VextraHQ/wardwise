"use client";

import { useState, useEffect } from "react";
import { HiCheckCircle, HiShieldCheck } from "react-icons/hi";
import { HiLockClosed } from "react-icons/hi2";
import { PartyPopper } from "lucide-react";
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

export function ConfirmationScreen({
  campaign,
  submittedCount,
  refCode,
  onNewRegistration,
}: {
  campaign: PublicCampaign;
  submittedCount: number | null;
  refCode: string | null;
  onNewRegistration: () => void;
}) {
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const campaignName = getEffectiveCampaignName(campaign);

  useEffect(() => {
    // Only trigger confetti for confirmed online submissions, not offline queued ones
    if (!hasTriggeredConfetti && submittedCount !== null) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#46C2A7", "#1D453A", "#0f2b24"],
        });
        setHasTriggeredConfetti(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [hasTriggeredConfetti, submittedCount]);

  const handleCopyReference = async () => {
    if (!refCode) return;
    try {
      await navigator.clipboard.writeText(refCode);
      toast.success("Reference code copied");
    } catch {
      toast.error("Could not copy reference code");
    }
  };

  return (
    <div className="space-y-6">
      {/* Animated Checkmark */}
      <section className="text-center">
        <div className="mb-5 flex justify-center">
          <div className="relative">
            <div className="border-primary/40 absolute inset-0 animate-ping rounded-full border-2 opacity-30" />
            <div className="bg-primary/10 border-primary relative flex h-20 w-20 items-center justify-center rounded-full border-2 sm:h-24 sm:w-24">
              <HiCheckCircle className="text-primary animate-in zoom-in h-10 w-10 duration-500 sm:h-12 sm:w-12" />
            </div>
          </div>
        </div>

        <RegistrationStepHeader
          icon={PartyPopper}
          badge="Registration Complete"
          title="You're All Set!"
          description={
            submittedCount !== null
              ? "Thank you for registering your support. Your details have been received."
              : "Your registration is saved and will be submitted when you're back online."
          }
        />

        {submittedCount !== null && (
          <p className="text-muted-foreground mx-auto max-w-md text-center text-sm leading-relaxed">
            The campaign team will review and verify your registration.
          </p>
        )}

        {refCode && (
          <div className="mt-2 space-y-2">
            <div className="border-border/60 bg-muted/30 inline-flex items-center gap-3 rounded-sm border border-dashed px-5 py-2.5">
              <span className="text-muted-foreground/60 text-[10px] font-bold tracking-[0.2em] uppercase">
                Registration Reference
              </span>
              <div className="bg-border/50 h-3 w-px" />
              <span className="text-foreground font-mono text-sm font-bold tracking-widest">
                {refCode}
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
        )}
      </section>

      {/* New Registration Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onNewRegistration}
          aria-label="Start a new registration"
          className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 rounded-sm px-4 text-[10px] font-bold tracking-widest uppercase"
        >
          <IconPlus className="h-3.5 w-3.5" />
          New Registration
        </Button>
      </div>

      {/* Summary Card */}
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
                  {campaign.party}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  {campaign.constituency}
                </span>
              </div>
            </div>
          </div>

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
        </div>
      </motion.div>

      {/* Share + QR Card */}
      <ShareInviteCard
        campaignSlug={campaign.slug}
        campaignName={campaignName}
        party={campaign.party}
        animated
        animationDelay={0.2}
      />

      <TrustIndicators
        items={[
          { icon: <HiShieldCheck />, label: "COMPLETE_REGISTRATION" },
          { icon: <HiLockClosed />, label: "SECURE_ENCRYPTION" },
          { icon: <HiCheckCircle />, label: "VERIFIED_SUPPORTER" },
        ]}
      />
    </div>
  );
}
