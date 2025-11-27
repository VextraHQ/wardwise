"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiShieldCheck,
  HiDatabase,
  HiOutlineClock,
  HiArrowRight,
} from "react-icons/hi";
import { Search } from "lucide-react";
import { PiSpinnerGapBold } from "react-icons/pi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/ui/step-progress";
import { useRegistrationStore } from "@/stores/registration-store";
import { voterApi } from "@/lib/api/voter";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { DemoIndicator } from "@/components/ui/demo-indicator";
import { RegistrationStepHeader } from "../registration-step-header";

export function DuplicateCheckStep() {
  const router = useRouter();
  const { payload } = useRegistrationStore();
  const nin = payload.nin || "";
  const electionYear = payload.electionYear || new Date().getFullYear();

  useEffect(() => {
    if (!nin) {
      router.push("/register");
    }
  }, [nin, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["check-registration", nin, electionYear],
    queryFn: async () => {
      // Use mock API for demo
      return await voterApi.checkRegistration(nin, electionYear);
    },
    enabled: !!nin,
  });

  // Handle navigation based on status (no auto-redirect - show UI first)
  const handleContinue = () => {
    if (!data) return;

    if (data.status === "complete") {
      router.push("/register/already-registered");
    } else if (data.status === "incomplete") {
      router.push("/register/resume");
    } else {
      // New registration
      router.push("/register/profile");
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <StepProgress
        currentStep={2}
        totalSteps={6}
        stepTitle="Registration Check"
      />

      {/* Hero Section */}
      <RegistrationStepHeader
        icon={Search}
        badge="Verification in Progress"
        title="Checking Your Registration"
        description="Verifying if you're already registered in our system"
      />

      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          {isLoading && (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center justify-center gap-4 text-center"
            >
              <PiSpinnerGapBold className="text-primary h-12 w-12 animate-spin sm:h-14 sm:w-14" />
              <div className="space-y-2">
                <p className="text-foreground text-base font-semibold sm:text-lg">
                  Checking registration status...
                </p>
                <p className="text-muted-foreground text-sm">
                  This will only take a moment
                </p>
                <DemoIndicator variant="inline" />
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="bg-destructive/10 text-destructive flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20">
                <HiExclamationCircle className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-foreground text-base font-semibold sm:text-lg">
                    Something went wrong
                  </p>
                  <p className="text-muted-foreground text-sm">
                    We couldn't check your registration status. Please try
                    again.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/register")}
                  variant="outline"
                  className="gap-2"
                >
                  Try Again
                  <HiArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {data && data.status === "new" && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20">
                <HiCheckCircle className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div className="space-y-3">
                <p className="text-foreground text-base font-semibold sm:text-lg">
                  All clear! Let's continue
                </p>
                <p className="text-muted-foreground mx-auto max-w-md text-sm">
                  No existing registration found. You can proceed with
                  registration.
                </p>
              </div>
              <Button onClick={handleContinue} size="lg" className="gap-2">
                Continue Registration
                <HiArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {data && data.status === "complete" && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20">
                <HiCheckCircle className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div className="space-y-3">
                <p className="text-foreground text-base font-semibold sm:text-lg">
                  Registration Found
                </p>
                <p className="text-muted-foreground mx-auto max-w-md text-sm">
                  We found a complete registration in our system. You can view
                  your profile or switch your candidate selection.
                </p>
              </div>
              <Button onClick={handleContinue} size="lg" className="gap-2">
                View Options
                <HiArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {data && data.status === "incomplete" && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20">
                <HiExclamationCircle className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div className="space-y-3">
                <p className="text-foreground text-base font-semibold sm:text-lg">
                  Incomplete Registration Found
                </p>
                <p className="text-muted-foreground mx-auto max-w-md text-sm">
                  You have an ongoing registration. You can resume from where
                  you left off or start over.
                </p>
              </div>
              <Button onClick={handleContinue} size="lg" className="gap-2">
                Resume Registration
                <HiArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subtle Trust Indicators */}
      <TrustIndicators
        items={[
          { icon: <HiShieldCheck className="h-4 w-4" />, label: "Fraud Check" },
          { icon: <HiDatabase className="h-4 w-4" />, label: "De-duplication" },
          {
            icon: <HiOutlineClock className="h-4 w-4" />,
            label: "Quick & Private",
          },
        ]}
      />
    </div>
  );
}
