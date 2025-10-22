"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Share2,
  User,
  MapPin,
  Users,
  ClipboardList,
  Copy,
  MessageCircle,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRegistration } from "@/hooks/use-registration";
import { cn } from "@/lib/utils";

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
    <div className="space-y-8">
      {/* Success Animation */}
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="relative">
          <div
            className={cn(
              "bg-primary/20 flex h-24 w-24 items-center justify-center rounded-full transition-all duration-500",
              showConfetti && "scale-110",
            )}
          >
            <div className="bg-primary flex h-20 w-20 items-center justify-center rounded-full">
              <CheckCircle2 className="text-primary-foreground h-12 w-12" />
            </div>
          </div>
          {showConfetti && (
            <div className="absolute inset-0 animate-ping">
              <div className="bg-primary/30 h-24 w-24 rounded-full" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Registration Complete!
          </h1>
          <p className="text-muted-foreground text-lg">
            Thank you, {firstName}! Your voice will be heard.
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
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

      {/* Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Button
          asChild
          size="lg"
          className="from-primary to-primary/90 h-12 bg-gradient-to-r"
        >
          <Link href="/voter/profile">
            <User className="mr-2 h-5 w-5" />
            View My Profile
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12">
          <Link href="/">Return to Home</Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12"
          onClick={() => {
            reset();
            router.push("/register");
          }}
        >
          <User className="mr-2 h-5 w-5" />
          New Registration
        </Button>
      </div>

      {/* Share Section */}
      <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="border-border border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/15 flex h-10 w-10 items-center justify-center rounded-full">
              <Share2 className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-semibold">
                Share WardWise
              </h2>
              <p className="text-muted-foreground text-sm">
                Help others register and make their voices heard
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="h-12 gap-2"
              onClick={handleWhatsAppShare}
            >
              <MessageCircle className="h-5 w-5 text-green-600" />
              Share on WhatsApp
            </Button>
            <Button
              variant="outline"
              className="h-12 gap-2"
              onClick={handleSMSShare}
            >
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Share via SMS
            </Button>
            <Button
              variant="outline"
              className="h-12 gap-2"
              onClick={handleEmailShare}
            >
              <Mail className="h-5 w-5 text-red-600" />
              Share via Email
            </Button>
            <Button
              variant="outline"
              className="h-12 gap-2"
              onClick={handleCopyLink}
            >
              <Copy className="h-5 w-5" />
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
