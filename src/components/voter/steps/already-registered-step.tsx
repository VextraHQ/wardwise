"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiUser,
  HiShieldCheck,
  HiCheckCircle,
  HiLockClosed,
  HiArrowRight,
  HiInformationCircle,
  HiRefresh,
} from "react-icons/hi";
import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRegistrationStore } from "@/stores/registration-store";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { RegistrationStepHeader } from "../registration-step-header";

export function AlreadyRegisteredStep() {
  const router = useRouter();
  const { reset } = useRegistrationStore();

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <RegistrationStepHeader
        icon={UserCheck}
        badge="Registration Found"
        title="You're Already Registered!"
        description="We found your registration in our system. Choose an option below to continue."
      />

      {/* Main Card */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-border border-b">
          <h2 className="text-foreground text-lg font-semibold">
            Quick Actions
          </h2>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* View Profile */}
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 h-auto w-full justify-start gap-4 p-4"
          >
            <Link href="/voter/profile" className="flex items-center gap-4">
              <div className="border-primary-foreground/20 bg-primary-foreground/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                <HiUser className="text-primary-foreground h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-primary-foreground font-semibold">
                  View My Profile
                </div>
                <div className="text-primary-foreground/80 mt-0.5 text-xs">
                  See your registration details and status
                </div>
              </div>
              <HiArrowRight className="text-primary-foreground/70 h-4 w-4 shrink-0" />
            </Link>
          </Button>

          {/* Switch Candidate */}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border/60 hover:bg-muted/50 h-auto w-full justify-start gap-4 p-4"
          >
            <Link
              href="/register/candidate"
              className="flex items-center gap-4"
            >
              <div className="border-border/60 bg-muted/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                <HiRefresh className="text-muted-foreground h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Switch Candidate</div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  Change your candidate selection
                </div>
              </div>
              <HiArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
            </Link>
          </Button>

          {/* Start New Registration */}
          <Button
            size="lg"
            variant="outline"
            className="border-border/60 hover:bg-muted/50 h-auto w-full justify-start gap-4 p-4"
            onClick={() => {
              reset();
              router.push("/register");
            }}
          >
            <div className="flex w-full items-center gap-4">
              <div className="border-border/60 bg-muted/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                <HiArrowRight className="text-muted-foreground h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Start New Registration</div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  Clear current session and begin fresh
                </div>
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-border bg-muted/30">
        <CardContent className="flex items-start gap-3">
          <HiInformationCircle className="text-primary mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-foreground text-sm font-semibold">
              Update Window
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              You can update your information once within 7 days of
              registration. After that, your data is locked to maintain election
              integrity.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subtle Trust Indicators */}
      <TrustIndicators
        items={[
          {
            icon: <HiShieldCheck className="h-4 w-4" />,
            label: "Verified Account",
          },
          {
            icon: <HiCheckCircle className="h-4 w-4" />,
            label: "Active Registration",
          },
          {
            icon: <HiLockClosed className="h-4 w-4" />,
            label: "Data Protected",
          },
        ]}
      />
    </div>
  );
}
