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
import { motion } from "motion/react";
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
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative overflow-hidden rounded-4xl border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]"
      >
        {/* Architectural Markers */}
        <div className="border-primary/30 absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary/30 absolute top-0 right-0 size-5 border-t border-r" />

        <div className="border-border/40 border-b px-7 pt-7 pb-4 sm:p-10">
          <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
            Quick Actions
          </h2>
        </div>

        <div className="space-y-4 p-7 sm:p-10">
          {/* View Profile */}
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/95 shadow-primary/10 h-auto w-full justify-start gap-5 rounded-2xl p-5 shadow-lg transition-all active:scale-[0.98]"
          >
            <Link href="/voter/profile" className="flex items-center gap-5">
              <div className="border-primary-foreground/20 bg-primary-foreground/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-inner">
                <HiUser className="text-primary-foreground h-6 w-6" />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <div className="text-primary-foreground text-sm font-bold tracking-widest uppercase">
                  View My Profile
                </div>
                <div className="text-primary-foreground/70 text-xs font-medium">
                  See your registration details and status
                </div>
              </div>
              <HiArrowRight className="text-primary-foreground/70 h-5 w-5 shrink-0" />
            </Link>
          </Button>

          {/* Switch Candidate */}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border/60 hover:bg-muted/30 h-auto w-full justify-start gap-5 rounded-2xl p-5 transition-all active:scale-[0.98]"
          >
            <Link
              href="/register/candidate"
              className="flex items-center gap-5"
            >
              <div className="border-border/60 bg-muted/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
                <HiRefresh className="text-muted-foreground h-6 w-6" />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <div className="text-foreground text-sm font-bold tracking-widest uppercase">
                  Switch Candidate
                </div>
                <div className="text-muted-foreground text-xs font-medium">
                  Change your candidate selection
                </div>
              </div>
              <HiArrowRight className="text-muted-foreground h-5 w-5 shrink-0" />
            </Link>
          </Button>

          {/* Start New Registration */}
          <Button
            size="lg"
            variant="outline"
            className="border-border/60 hover:bg-muted/30 h-auto w-full justify-start gap-5 rounded-2xl p-5 transition-all active:scale-[0.98]"
            onClick={() => {
              reset();
              router.push("/register");
            }}
          >
            <div className="flex w-full items-center gap-5">
              <div className="border-border/60 bg-muted/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
                <HiArrowRight className="text-muted-foreground h-6 w-6" />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <div className="text-foreground text-sm font-bold tracking-widest uppercase">
                  Start New Registration
                </div>
                <div className="text-muted-foreground text-xs font-medium">
                  Clear current session and begin fresh
                </div>
              </div>
            </div>
          </Button>
        </div>
      </motion.div>

      {/* Info Box */}
      <div className="border-border/60 bg-muted/5 rounded-2xl border p-6">
        <div className="flex items-start gap-4">
          <div className="text-primary bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <HiInformationCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <h3 className="text-foreground text-sm font-bold tracking-widest uppercase">
              Update Window
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              You can update your information once within 7 days of
              registration. After that, your data is locked to maintain election
              integrity.
            </p>
          </div>
        </div>
      </div>

      {/* Subtle Trust Indicators */}
      <TrustIndicators
        items={[
          {
            icon: <HiShieldCheck className="h-4 w-4" />,
            label: "VERIFIED_ACCOUNT",
          },
          {
            icon: <HiCheckCircle className="h-4 w-4" />,
            label: "ACTIVE_REGISTRATION",
          },
          {
            icon: <HiLockClosed className="h-4 w-4" />,
            label: "DATA_PROTECTED",
          },
        ]}
      />
    </div>
  );
}
