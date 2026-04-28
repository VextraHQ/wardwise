"use client";

import { useMemo } from "react";
import { HiPhone, HiMail, HiUsers } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { IconCopy } from "@tabler/icons-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/core/metadata";

// Function to collect the campaign registration URL from the environment or the window location
function collectCampaignRegistrationUrl(slug: string): string {
  const explicit = process.env.NEXT_PUBLIC_COLLECT_BASE_URL?.trim();
  if (explicit) {
    const base = explicit.endsWith("/") ? explicit.slice(0, -1) : explicit;
    return `${base}/c/${slug}`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/c/${slug}`;
  }
  return `${getSiteUrl()}/c/${slug}`;
}

function useShareUrl(slug: string) {
  return useMemo(() => collectCampaignRegistrationUrl(slug), [slug]);
}

interface ShareInviteCardProps {
  campaignSlug: string;
  campaignName: string;
  party: string;
  constituency?: string;
  animated?: boolean;
  animationDelay?: number;
  qrSize?: number;
}

export function ShareInviteCard({
  campaignSlug,
  campaignName,
  party,
  constituency,
  animated = false,
  animationDelay = 0,
  qrSize = 120,
}: ShareInviteCardProps) {
  const shareUrl = useShareUrl(campaignSlug);
  const campaignLabel = `${campaignName} (${party})`;
  const locationClause = constituency ? ` in ${constituency}` : "";
  const wardWisePitch =
    "Nigeria's campaign intelligence platform for supporter mobilisation and field insights";
  const shareBody = `Register your support for ${campaignLabel}${locationClause} on WardWise, ${wardWisePitch}.`;
  const shareText = `${shareBody}\n\n${shareUrl}`;
  const emailSubject = `${campaignName} Supporter Registration`;
  const emailBody = `Hello,

${shareBody}

${shareUrl}

Thank you.`;
  const qrUrl = shareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shareUrl)}&size=${qrSize}x${qrSize}`
    : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="border-primary/30 bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border">
          <HiUsers className="text-primary h-4 w-4" />
        </div>
        <div>
          <h3 className="text-foreground text-xs font-bold tracking-widest uppercase">
            Share supporter registration
          </h3>
          <p className="text-muted-foreground text-[10px] font-medium">
            Send the WardWise link so supporters and volunteers can register in
            minutes.
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
            window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
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
      {qrUrl && (
        <div className="border-border/40 flex flex-col items-center gap-2 border-t pt-4">
          <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
            Scan to register
          </p>
          <Image
            src={qrUrl}
            alt={`QR code to register support for ${campaignName} on WardWise`}
            width={qrSize}
            height={qrSize}
            className="rounded"
          />
          <p className="text-muted-foreground max-w-full truncate text-[10px]">
            {shareUrl}
          </p>
        </div>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={animationDelay ? { delay: animationDelay } : undefined}
        className="border-border/60 bg-card/80 relative overflow-hidden border p-6 backdrop-blur-sm"
      >
        <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />
        {content}
      </motion.div>
    );
  }

  return (
    <div className="border-border/60 bg-card/80 relative overflow-hidden rounded-sm border p-5 text-left backdrop-blur-sm">
      {content}
    </div>
  );
}
