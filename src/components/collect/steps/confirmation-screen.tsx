"use client";

import { useState, useEffect } from "react";
import {
  HiPhone,
  HiMail,
  HiCheckCircle,
  HiShieldCheck,
  HiUsers,
} from "react-icons/hi";
import { HiLockClosed } from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import { PartyPopper } from "lucide-react";
import { IconCopy, IconPlus } from "@tabler/icons-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RegistrationStepHeader } from "@/components/collect/registration-step-header";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import type { PublicCampaign } from "@/types/collect";

export function ConfirmationScreen({
  campaign,
  submittedCount,
  onNewRegistration,
}: {
  campaign: PublicCampaign;
  submittedCount: number | null;
  onNewRegistration: () => void;
}) {
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${process.env.NEXT_PUBLIC_COLLECT_BASE_URL || window.location.origin}/c/${campaign.slug}`
      : "";
  const shareText = `I just registered as a supporter for ${campaign.candidateName} (${campaign.party})! Join here: ${shareUrl}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shareUrl)}&size=200x200`;

  useEffect(() => {
    if (!hasTriggeredConfetti) {
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
  }, [hasTriggeredConfetti]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
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
          description={`Thank you for registering as a supporter. You are supporter #${submittedCount || "—"}.`}
        />
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
        className="border-border/60 bg-card relative overflow-hidden border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]"
      >
        <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

        <div className="space-y-6 p-7 sm:p-10">
          <div className="border-border/40 border-b pb-6">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
                {campaign.candidateName}
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

          <div className="bg-muted/30 border-border rounded-sm border p-5">
            <h3 className="text-foreground mb-3 text-xs font-bold tracking-widest uppercase">
              What Happens Next?
            </h3>
            <ul className="space-y-2 text-xs">
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
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-border/60 bg-card/80 relative overflow-hidden border p-6 backdrop-blur-sm"
      >
        <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

        <div className="space-y-5">
          {/* Share Header */}
          <div className="flex items-center gap-3">
            <div className="border-primary/30 bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border">
              <HiUsers className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-foreground text-sm font-bold tracking-widest uppercase">
                Share & Invite Others
              </h3>
              <p className="text-muted-foreground text-xs font-medium">
                Spread the word with your network
              </p>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button
              variant="outline"
              size="sm"
              aria-label="Share via WhatsApp"
              className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 rounded-sm px-3 text-[10px] font-bold tracking-widest uppercase"
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(shareText)}`,
                  "_blank",
                )
              }
            >
              <FaWhatsapp className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label="Share via SMS"
              className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 rounded-sm px-3 text-[10px] font-bold tracking-widest uppercase"
              onClick={() => {
                window.location.href = `sms:?body=${encodeURIComponent(shareText)}`;
              }}
            >
              <HiPhone className="h-3.5 w-3.5" />
              <span>SMS</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label="Share via Email"
              className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 rounded-sm px-3 text-[10px] font-bold tracking-widest uppercase"
              onClick={() => {
                window.location.href = `mailto:?subject=${encodeURIComponent(`Support ${campaign.candidateName}`)}&body=${encodeURIComponent(shareText)}`;
              }}
            >
              <HiMail className="h-3.5 w-3.5" />
              <span>Email</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label="Copy registration link"
              className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 rounded-sm px-3 text-[10px] font-bold tracking-widest uppercase"
              onClick={handleCopyLink}
            >
              <IconCopy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </Button>
          </div>

          {/* QR Code */}
          <div className="border-border/40 flex flex-col items-center gap-2 border-t pt-5">
            <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Scan to Register
            </p>
            <Image
              src={qrUrl}
              alt="Registration QR Code"
              width={120}
              height={120}
              className="rounded"
            />
            <p className="text-muted-foreground max-w-full truncate text-[10px]">
              {shareUrl}
            </p>
          </div>
        </div>
      </motion.div>

      <TrustIndicators
        items={[
          { icon: <HiShieldCheck />, label: "COMPLETE_REGISTRATION" },
          { icon: <HiLockClosed />, label: "SECURE_DATA" },
          { icon: <HiCheckCircle />, label: "VERIFIED_SUPPORTER" },
        ]}
      />
    </div>
  );
}
