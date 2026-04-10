"use client";

import { useState, useEffect } from "react";
import { HiPhone, HiMail, HiUsers } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { IconCopy } from "@tabler/icons-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/** Avoid hydration mismatch — window.location is only available on the client */
function useShareUrl(slug: string) {
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => {
    const base =
      process.env.NEXT_PUBLIC_COLLECT_BASE_URL || window.location.origin;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShareUrl(`${base}/c/${slug}`);
  }, [slug]);
  return shareUrl;
}

interface ShareInviteCardProps {
  /** Campaign slug used to build the share URL */
  campaignSlug: string;
  /** Effective campaign name for share text */
  campaignName: string;
  /** Party name for share text */
  party: string;
  /** Wrap in motion.div with fade-in animation? */
  animated?: boolean;
  /** Delay for the animation (seconds) */
  animationDelay?: number;
  /** Optional QR code size in px */
  qrSize?: number;
}

export function ShareInviteCard({
  campaignSlug,
  campaignName,
  party,
  animated = false,
  animationDelay = 0,
  qrSize = 120,
}: ShareInviteCardProps) {
  const shareUrl = useShareUrl(campaignSlug);
  const campaignLabel = `${campaignName} (${party})`;
  const shareText = `Join ${campaignLabel} on WardWise. Complete your supporter registration here: ${shareUrl}`;
  const emailSubject = `${campaignName} Supporter Registration`;
  const emailBody = `Hello,

You can register your support for ${campaignLabel} on WardWise here:
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
            Share Registration Link
          </h3>
          <p className="text-muted-foreground text-[10px] font-medium">
            Send the campaign form to supporters and volunteers
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
            Scan to Register
          </p>
          <Image
            src={qrUrl}
            alt="Registration QR Code"
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
