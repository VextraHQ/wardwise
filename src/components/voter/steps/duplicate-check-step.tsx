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
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/ui/step-progress";
import { useRegistrationStore } from "@/stores/registration-store";
import { voterApi } from "@/lib/api/voter";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { DemoIndicator } from "@/components/ui/demo-indicator";
import { RegistrationStepHeader } from "@/components/voter/registration-step-header";

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

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative overflow-hidden border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]"
      >
        {/* Architectural Markers */}
        <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-8 p-10">
          {isLoading && (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center justify-center gap-6 text-center"
            >
              <div className="border-primary/20 bg-primary/5 relative flex h-20 w-20 items-center justify-center rounded-full border">
                <PiSpinnerGapBold className="text-primary h-10 w-10 animate-spin" />
              </div>
              <div className="space-y-2">
                <p className="text-foreground text-sm font-bold tracking-widest uppercase">
                  Checking registration status...
                </p>
                <p className="text-muted-foreground text-xs">
                  This will only take a moment
                </p>
                <DemoIndicator variant="inline" />
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex flex-col items-center gap-6 text-center"
            >
              <div className="bg-destructive/10 text-destructive border-destructive/20 flex h-20 w-20 items-center justify-center rounded-full border">
                <HiExclamationCircle className="h-10 w-10" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-foreground text-base font-bold tracking-tight uppercase">
                    Something went wrong
                  </p>
                  <p className="text-muted-foreground text-xs">
                    We couldn't check your registration status. Please try
                    again.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/register")}
                  variant="outline"
                  className="hover:bg-muted/10 h-11 gap-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Try Again
                  <HiArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {data && data.status === "new" && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="bg-primary/5 text-primary border-primary/20 flex h-20 w-20 items-center justify-center rounded-full border shadow-sm">
                <HiCheckCircle className="h-10 w-10" />
              </div>
              <div className="space-y-3">
                <p className="text-foreground text-lg font-bold tracking-tight uppercase">
                  All clear! Let's continue
                </p>
                <p className="text-muted-foreground mx-auto max-w-md text-xs leading-relaxed">
                  No existing registration found. You can proceed with
                  registration.
                </p>
              </div>
              <Button
                onClick={handleContinue}
                size="lg"
                className="h-12 gap-2 rounded-xl text-xs font-bold tracking-widest uppercase shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all active:scale-95"
              >
                Continue Registration
                <HiArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {data && data.status === "complete" && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="bg-primary/5 text-primary border-primary/20 flex h-20 w-20 items-center justify-center rounded-full border shadow-sm">
                <HiCheckCircle className="h-10 w-10" />
              </div>
              <div className="space-y-3">
                <p className="text-foreground text-lg font-bold tracking-tight uppercase">
                  Registration Found
                </p>
                <p className="text-muted-foreground mx-auto max-w-md text-xs leading-relaxed">
                  We found a complete registration in our system. You can view
                  your profile or switch your candidate selection.
                </p>
              </div>
              <Button
                onClick={handleContinue}
                size="lg"
                className="h-12 gap-2 rounded-xl text-xs font-bold tracking-widest uppercase shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all active:scale-95"
              >
                View Options
                <HiArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {data && data.status === "incomplete" && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-sm">
                <HiExclamationCircle className="h-10 w-10" />
              </div>
              <div className="space-y-3">
                <p className="text-foreground text-lg font-bold tracking-tight uppercase">
                  Incomplete Registration Found
                </p>
                <p className="text-muted-foreground mx-auto max-w-md text-xs leading-relaxed">
                  You have an ongoing registration. You can resume from where
                  you left off or start over.
                </p>
              </div>
              <Button
                onClick={handleContinue}
                size="lg"
                className="h-12 gap-2 rounded-xl text-xs font-bold tracking-widest uppercase shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all active:scale-95"
              >
                Resume Registration
                <HiArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Subtle Trust Indicators */}
      <TrustIndicators
        items={[
          { icon: <HiShieldCheck className="h-4 w-4" />, label: "FRAUD_CHECK" },
          { icon: <HiDatabase className="h-4 w-4" />, label: "DE_DUPLICATION" },
          {
            icon: <HiOutlineClock className="h-4 w-4" />,
            label: "QUICK_&_PRIVATE",
          },
        ]}
      />
    </div>
  );
}
