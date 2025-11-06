"use client";

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
import {
  HiShare,
  HiClipboardCopy,
  HiChatAlt,
  HiHome,
  HiUser,
  HiUserAdd,
  HiMail,
  HiCheckCircle,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRegistration } from "@/hooks/use-registration";
import { TrustIndicators } from "@/components/ui/trust-indicators";

export function CompletionStep() {
  const router = useRouter();
  const { payload, reset } = useRegistration();

  // Share URL and text
  const shareUrl =
    typeof window !== "undefined" ? window.location.origin + "/register" : "";
  const shareText = `I just registered with WardWise to participate in Adamawa State elections! Join me in making your voice heard. Register now: ${shareUrl}`;

  // Copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  // Share on WhatsApp
  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  // Share via SMS
  const handleSMSShare = () => {
    const url = `sms:?body=${encodeURIComponent(shareText)}`;
    window.location.href = url;
  };

  // Share via Email
  const handleEmailShare = () => {
    const subject = "Join WardWise - Register to Vote";
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`;
    window.location.href = url;
  };

  // First name and full name
  const firstName = payload.basic?.firstName || "Voter";
  const fullName =
    `${payload.basic?.firstName || ""} ${payload.basic?.lastName || ""}`.trim();

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <section aria-live="polite" className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="border-primary/30 bg-primary/10 text-accent mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
            <HiCheckCircle className="h-3.5 w-3.5" />
            <span>Registration Complete</span>
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            You're all set, {firstName}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-lg text-sm sm:text-base">
            Your registration has been saved securely
          </p>
        </div>
      </section>

      {/* Navigation Actions */}
      <nav aria-label="Next steps" className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <Button
            asChild
            size="default"
            variant="outline"
            className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 h-10 px-5 text-sm font-medium transition-colors"
          >
            <Link href="/voter/profile" aria-label="View my profile">
              <HiUser className="h-3.5 w-3.5" />
              View My Profile
            </Link>
          </Button>
          <Button
            asChild
            size="default"
            variant="outline"
            className="border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10 gap-1.5 px-4 text-sm font-normal transition-colors"
          >
            <Link href="/" aria-label="Return to home">
              <HiHome className="h-3.5 w-3.5" />
              Return Home
            </Link>
          </Button>
          <Button
            size="default"
            variant="outline"
            className="border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10 gap-1.5 px-4 text-sm font-normal transition-colors"
            onClick={() => {
              reset();
              router.push("/register");
            }}
            aria-label="Start a new registration"
          >
            <HiUserAdd className="h-3.5 w-3.5" />
            New Registration
          </Button>
        </div>
      </nav>

      {/* Summary Card */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-border border-b">
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
                  <dt className="text-muted-foreground text-xs">Occupation</dt>
                  <dd className="text-foreground text-sm font-medium capitalize">
                    {payload.basic?.occupation
                      ? payload.basic.occupation.replace(/-/g, " ")
                      : "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Religion</dt>
                  <dd className="text-foreground text-sm font-medium capitalize">
                    {payload.basic?.religion || "Not provided"}
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
        <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
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
