"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  User,
  MapPin,
  Users,
  ClipboardList,
  ShieldCheck,
  Lock,
  CheckCircle,
} from "lucide-react";
import { HiShare, HiClipboardCopy, HiChatAlt } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { HiMail } from "react-icons/hi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRegistration } from "@/hooks/use-registration";
import { cn } from "@/lib/utils";
import { TrustIndicators } from "@/components/ui/trust-indicators";

export function CompletionStep() {
  const router = useRouter();
  const { payload, reset } = useRegistration();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Show confetti animation
    setTimeout(() => setShowConfetti(true), 1000);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const shareUrl =
    typeof window !== "undefined" ? window.location.origin + "/register" : "";
  const shareText = `I just registered with WardWise to participate in Adamawa State elections! Join me in making your voice heard. Register now: ${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleSMSShare = () => {
    const url = `sms:?body=${encodeURIComponent(shareText)}`;
    window.location.href = url;
  };

  const handleEmailShare = () => {
    const subject = "Join WardWise - Register to Vote";
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`;
    window.location.href = url;
  };

  const firstName = payload.basic?.firstName || "Voter";
  const fullName =
    `${payload.basic?.firstName || ""} ${payload.basic?.lastName || ""}`.trim();

  return (
    <div className="space-y-10">
      {/* Success Header */}
      <section aria-live="polite" className="text-center">
        <div className="mx-auto w-fit">
          <div
            className={cn(
              "bg-primary/15 flex h-16 w-16 items-center justify-center rounded-full transition-transform",
              showConfetti && "scale-110",
            )}
          >
            <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full">
              <CheckCircle2 className="text-primary-foreground h-7 w-7" />
            </div>
          </div>
        </div>
        <h1 className="text-foreground mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          You’re all set, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Your registration has been saved securely.
        </p>
      </section>

      {/* Navigation Actions */}
      <nav aria-label="Next steps" className="mx-auto max-w-3xl">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="from-primary to-primary/90 h-11 flex-1 bg-gradient-to-r font-semibold shadow-sm"
          >
            <Link href="/voter/profile" aria-label="View my profile">
              <User className="mr-2 h-4 w-4" />
              View My Profile
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border/60 h-11 flex-1 font-medium"
          >
            <Link href="/" aria-label="Return to home">
              Return Home
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-border/60 h-11 flex-1 font-medium"
            onClick={() => {
              reset();
              router.push("/register");
            }}
            aria-label="Start a new registration"
          >
            New Registration
          </Button>
        </div>
      </nav>

      {/* Summary Card */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-border border-b pb-6">
          <h2 className="text-foreground text-xl font-semibold">
            Your Registration Summary
          </h2>
          <p className="text-muted-foreground text-sm">
            Here's a summary of your registration information
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-3">
            <div className="text-accent flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4" />
              <span>Personal Information</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground text-xs">Full Name</dt>
                  <dd className="text-foreground text-sm font-medium">
                    {fullName || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Age</dt>
                  <dd className="text-foreground text-sm font-medium">
                    {payload.basic?.age || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Gender</dt>
                  <dd className="text-foreground text-sm font-medium capitalize">
                    {payload.basic?.gender || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Phone</dt>
                  <dd className="text-foreground text-sm font-medium">
                    {payload.phone || "Not provided"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            <div className="text-accent flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4" />
              <span>Voting Location</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground text-xs">State</dt>
                  <dd className="text-foreground text-sm font-medium">
                    {payload.location?.state || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">LGA</dt>
                  <dd className="text-foreground text-sm font-medium">
                    {payload.location?.lga || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Ward</dt>
                  <dd className="text-foreground text-sm font-medium">
                    {payload.location?.ward || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    Polling Unit
                  </dt>
                  <dd className="text-foreground text-sm font-medium">
                    {payload.location?.pollingUnit || "Not provided"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <Separator />

          {/* Survey & Candidate */}
          <div className="space-y-3">
            <div className="text-accent flex items-center gap-2 text-sm font-semibold">
              <ClipboardList className="h-4 w-4" />
              <span>Survey & Support</span>
            </div>
            <div className="bg-muted/50 space-y-3 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  Survey Completed
                </span>
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Complete
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  Candidate Selected
                </span>
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  Confirmed
                </Badge>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="border-primary/30 bg-primary/10 rounded-lg border p-4">
            <p className="text-accent text-sm">
              <strong>Important:</strong> You can update your information once
              within 7 days. After that, your registration is locked to maintain
              election integrity.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Share WardWise Card */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="border-primary/30 bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border">
              <HiShare className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-foreground text-base font-semibold">
                Share WardWise
              </h3>
              <p className="text-muted-foreground text-xs">
                Spread the word with your network
              </p>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 px-3"
              onClick={handleWhatsAppShare}
              aria-label="Share on WhatsApp"
            >
              <FaWhatsapp className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 px-3"
              onClick={handleEmailShare}
              aria-label="Share via Email"
            >
              <HiMail className="h-3.5 w-3.5" />
              <span>Email</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 px-3"
              onClick={handleSMSShare}
              aria-label="Share via SMS"
            >
              <HiChatAlt className="h-3.5 w-3.5" />
              <span>SMS</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 px-3"
              onClick={handleCopyLink}
              aria-label="Copy share link"
            >
              <HiClipboardCopy className="h-3.5 w-3.5" />
              <span>Copy link</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subtle Trust Indicators */}
      <TrustIndicators
        items={[
          {
            icon: <ShieldCheck className="h-4 w-4" />,
            label: "Verified Registration",
          },
          { icon: <Lock className="h-4 w-4" />, label: "Secure Data" },
          {
            icon: <CheckCircle className="h-4 w-4" />,
            label: "Ready to Participate",
          },
        ]}
      />
    </div>
  );
}
