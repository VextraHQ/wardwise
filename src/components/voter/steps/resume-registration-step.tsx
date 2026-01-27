"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  HiOutlineRefresh,
  HiArrowRight,
  HiClock,
  HiShieldCheck,
  HiLockClosed,
  HiInformationCircle,
  HiCheckCircle,
} from "react-icons/hi";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StepProgress } from "@/components/ui/step-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { cn } from "@/lib/utils";
import { voterApi } from "@/lib/api/voter";
import { orderedSteps } from "@/lib/helpers/registration-helpers";
import { useRegistrationStore } from "@/stores/registration-store";
import { RegistrationStepHeader } from "@/components/voter/registration-step-header";
import type { RegistrationStep } from "@/types/voter";

const stepLabels: Record<RegistrationStep, string> = {
  nin: "NIN Entry",
  role: "Role Selection",
  profile: "Profile Information",
  location: "Voting Location",
  candidate: "Candidate Selection",
  confirm: "Confirmation",
};

const normalizeStep = (step?: string): RegistrationStep =>
  step && orderedSteps.includes(step as RegistrationStep)
    ? (step as RegistrationStep)
    : "nin";

export function ResumeRegistrationStep() {
  const router = useRouter();
  const {
    payload,
    update,
    setStep,
    reset,
    step: currentRegistrationStep,
  } = useRegistrationStore();
  const nin = payload.nin || "";
  const totalSteps = orderedSteps.length;
  const currentRegistrationIndex = Math.max(
    orderedSteps.indexOf(currentRegistrationStep),
    0,
  );
  const fallbackStepNumber = currentRegistrationIndex + 1;

  const { data, isLoading } = useQuery({
    queryKey: ["check-registration", nin],
    queryFn: async () => {
      return await voterApi.checkRegistration(
        nin,
        payload.electionYear || new Date().getFullYear(),
      );
    },
    enabled: !!nin,
  });

  const handleResume = () => {
    if (!data?.voter) return;

    // Load existing voter data into registration store
    const voter = data.voter;
    update({
      nin: voter.nin,
      phone: voter.phoneNumber,
      basic: {
        role: voter.role || "voter",
        firstName: voter.firstName,
        middleName: voter.middleName,
        lastName: voter.lastName,
        email: voter.email || "",
        dateOfBirth: voter.dateOfBirth,
        age: voter.age,
        gender: voter.gender,
        occupation: voter.occupation,
        religion: voter.religion,
        vin: voter.vin,
      },
      location: {
        state: voter.state,
        lga: voter.lga,
        ward: voter.ward,
        pollingUnit: voter.pollingUnit,
      },
      candidates: voter.candidateSelections
        ? { selections: voter.candidateSelections }
        : undefined,
    });

    const safeLastStep = normalizeStep(data.lastStep);
    const lastStepIndex = orderedSteps.indexOf(safeLastStep);
    const resumeStep =
      orderedSteps[Math.min(lastStepIndex + 1, orderedSteps.length - 1)];

    setStep(resumeStep);
    router.push(`/register/${resumeStep}`);
  };

  const handleStartOver = () => {
    reset();
    router.push("/register");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StepProgress
          currentStep={fallbackStepNumber}
          totalSteps={totalSteps}
          stepTitle="RESUME REGISTRATION"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-border/60 bg-card border p-10"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
              <HiOutlineRefresh className="h-6 w-6 animate-spin" />
            </div>
            <div className="space-y-2">
              <p className="text-foreground text-sm font-bold tracking-widest uppercase">
                Checking your saved progress
              </p>
              <p className="text-muted-foreground text-xs">
                Hold on a moment while we load the most recent information.
              </p>
            </div>
            <div className="mt-2 w-full space-y-3">
              <Skeleton className="mx-auto h-3 w-3/4 max-w-md" />
              <Skeleton className="mx-auto h-3 w-2/3 max-w-sm" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!data || data.status !== "incomplete") {
    return (
      <div className="space-y-6">
        <StepProgress
          currentStep={fallbackStepNumber}
          totalSteps={totalSteps}
          stepTitle="RESUME REGISTRATION"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-border/60 bg-card border p-10"
        >
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full">
              <HiCheckCircle className="h-6 w-6" />
            </div>
            <div className="space-y-3">
              <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
                No Saved Registration Found
              </h2>
              <p className="text-muted-foreground text-xs leading-relaxed">
                We couldn’t find an incomplete registration linked to your NIN.
                You can start a new registration anytime.
              </p>
            </div>
            <Button
              onClick={() => router.push("/register")}
              variant="outline"
              className="hover:bg-muted/10 h-11 gap-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
              size="lg"
            >
              Begin Fresh Registration
              <HiArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const safeLastStep = normalizeStep(data.lastStep);
  const lastStepIndex = orderedSteps.indexOf(safeLastStep);
  const resumeStepIndex = Math.min(lastStepIndex + 1, orderedSteps.length - 1);
  const resumeStep = orderedSteps[resumeStepIndex];
  const progress = ((lastStepIndex + 1) / totalSteps) * 100;
  const lastUpdatedLabel = data.voter?.updatedAt
    ? new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(data.voter.updatedAt))
    : "Just now";

  return (
    <div className="space-y-6">
      <StepProgress
        currentStep={resumeStepIndex + 1}
        totalSteps={totalSteps}
        stepTitle={stepLabels[resumeStep]}
      />

      <RegistrationStepHeader
        icon={History}
        badge="Welcome Back"
        title="Resume Your Registration"
        description={`We saved your progress after the ${stepLabels[safeLastStep]} step.`}
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative overflow-hidden border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]"
      >
        {/* Architectural Markers */}
        <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

        <div className="space-y-8 p-7 sm:p-10">
          <div className="border-border/40 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-left">
              <p className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                Last completed
              </p>
              <h2 className="text-foreground text-lg leading-tight font-bold tracking-tight uppercase sm:text-lg">
                {stepLabels[safeLastStep]}
              </h2>
              <p className="text-muted-foreground text-xs font-medium">
                Saved on{" "}
                <span className="text-foreground">{lastUpdatedLabel}</span>
              </p>
            </div>
            <Badge
              variant="outline"
              className="inline-flex max-w-fit items-center gap-2 rounded-md px-2 py-1 text-[9px] font-bold tracking-widest uppercase"
            >
              <HiClock className="h-3 w-3" />
              Incomplete registration
            </Badge>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="text-muted-foreground flex items-center justify-between text-[10px] font-bold tracking-widest uppercase">
                <span>Overall progress</span>
                <span className="text-foreground">
                  {Math.round(progress)}% complete
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            <ol className="space-y-3">
              {orderedSteps.map((step, index) => {
                const status =
                  index <= lastStepIndex
                    ? "done"
                    : index === resumeStepIndex
                      ? "current"
                      : "upcoming";
                return (
                  <motion.li
                    key={step}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className={cn(
                      "flex items-start gap-4 rounded-xl border px-5 py-4 text-left transition-colors duration-200",
                      status === "done" &&
                        "border-emerald-500/20 bg-emerald-500/5",
                      status === "current" &&
                        "border-primary/60 bg-primary/5 shadow-sm",
                      status === "upcoming" &&
                        "border-border/60 bg-muted/20 text-muted-foreground",
                    )}
                  >
                    <div className="flex shrink-0 items-center justify-center pt-0.5">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                          status === "done" &&
                            "scale-110 bg-emerald-500 text-white shadow-sm",
                          status === "current" &&
                            "bg-primary text-primary-foreground ring-primary/10 scale-110 shadow-md ring-4",
                          status === "upcoming" &&
                            "bg-muted text-muted-foreground border-border border",
                        )}
                        aria-hidden={true}
                      >
                        {status === "done" ? (
                          <HiCheckCircle className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 pt-1">
                      <p
                        className={cn(
                          "text-xs font-bold tracking-widest uppercase",
                          status === "upcoming" &&
                            "text-muted-foreground opacity-60",
                        )}
                      >
                        {stepLabels[step]}
                      </p>
                      {status === "current" && (
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          This is your next step. We’ll guide you through it.
                        </p>
                      )}
                      {status === "done" && (
                        <p className="text-xs font-medium text-emerald-600/80">
                          Completed and saved successfully.
                        </p>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ol>

            <div className="flex flex-col gap-3 py-2 sm:flex-row sm:justify-between">
              <Button
                onClick={handleResume}
                className="h-12 flex-1 gap-2 rounded-xl text-xs font-bold tracking-widest uppercase shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all active:scale-95 sm:flex-[0.6]"
              >
                <HiOutlineRefresh className="h-4 w-4" />
                Resume where I stopped
              </Button>
              <Button
                onClick={handleStartOver}
                variant="outline"
                className="hover:bg-muted/10 h-12 flex-1 gap-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all active:scale-95"
              >
                Start fresh
                <HiArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="border-border/60 bg-muted/5 rounded-2xl border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4 text-left">
            <div className="text-primary bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <HiInformationCircle className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-foreground text-sm font-bold tracking-widest uppercase">
                Need a quick refresh?
              </h3>
              <ul className="text-muted-foreground list-disc space-y-1.5 pl-4 text-xs leading-relaxed">
                <li>Your data is securely linked to this saved progress.</li>
                <li>
                  We validate each step when you continue, so nothing is lost.
                </li>
                <li>
                  You can always restart the journey if your details changed.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <TrustIndicators
        items={[
          {
            icon: <HiShieldCheck />,
            label: "DATA_SECURED",
          },
          {
            icon: <HiLockClosed />,
            label: "SECURELY_STORED",
          },
          {
            icon: <HiClock />,
            label: "RESUME_ANYTIME",
          },
        ]}
      />
    </div>
  );
}
