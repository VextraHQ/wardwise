"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiBadgeCheck,
  HiUser,
  HiShieldCheck,
  HiCheckCircle,
  HiLockClosed,
  HiArrowRight,
  HiInformationCircle,
  HiRefresh,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRegistrationStore } from "@/stores/registration-store";
import { TrustIndicators } from "@/components/ui/trust-indicators";

export function AlreadyRegisteredStep() {
  const router = useRouter();
  const { reset } = useRegistrationStore();

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="mx-auto max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            {/* Outer ring */}
            <div className="border-primary/30 absolute inset-0 animate-ping rounded-full border-2 opacity-20" />
            {/* Icon circle */}
            <div className="bg-primary/10 border-primary relative flex h-20 w-20 items-center justify-center rounded-full border-2 sm:h-24 sm:w-24">
              <HiBadgeCheck className="text-primary h-10 w-10 sm:h-12 sm:w-12" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
            <HiCheckCircle className="h-3.5 w-3.5" />
            <span>Registration Found</span>
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            You're Already Registered!
          </h1>
          <p className="text-muted-foreground mx-auto max-w-lg text-sm sm:text-base">
            We found your registration in our system. Choose an option below to
            continue.
          </p>
        </div>
      </section>

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
