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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StepProgress } from "@/components/ui/step-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { cn } from "@/lib/utils";
import { voterApi } from "@/lib/api/voter";
import {
  orderedSteps,
  useRegistrationStore,
} from "@/stores/registration-store";
import type { RegistrationStep } from "@/types/voter";

const stepLabels: Record<RegistrationStep, string> = {
  nin: "NIN Verification",
  profile: "Profile Information",
  location: "Voting Location",
  candidate: "Candidate Selection",
  survey: "Voter Survey",
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
        firstName: voter.firstName,
        lastName: voter.lastName,
        dateOfBirth: voter.dateOfBirth,
        age: voter.age,
        gender: voter.gender,
        occupation: voter.occupation,
        religion: voter.religion,
      },
      location: {
        state: voter.state,
        lga: voter.lga,
        ward: voter.ward,
        pollingUnit: voter.pollingUnit,
      },
      candidate: voter.candidateId
        ? { candidateId: voter.candidateId }
        : undefined,
      survey: {
        surveyId: "",
        answers: voter.surveyAnswers || {},
      },
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
          stepTitle="Resume Registration"
        />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
              <HiOutlineRefresh className="h-6 w-6 animate-spin" />
            </div>
            <div className="space-y-2">
              <p className="text-foreground text-base font-medium">
                Checking your saved progress
              </p>
              <p className="text-muted-foreground text-sm">
                Hold on a moment while we load the most recent information.
              </p>
            </div>
            <div className="mt-2 w-full space-y-3">
              <Skeleton className="mx-auto h-3 w-3/4 max-w-md" />
              <Skeleton className="mx-auto h-3 w-2/3 max-w-sm" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.status !== "incomplete") {
    return (
      <div className="space-y-6">
        <StepProgress
          currentStep={fallbackStepNumber}
          totalSteps={totalSteps}
          stepTitle="Resume Registration"
        />
        <Card>
          <CardContent className="flex flex-col items-center gap-5 text-center">
            <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full">
              <HiCheckCircle className="h-6 w-6" />
            </div>
            <div className="space-y-3">
              <h2 className="text-foreground text-xl font-semibold">
                No Saved Registration Found
              </h2>
              <p className="text-muted-foreground text-sm">
                We couldn’t find an incomplete registration linked to your NIN.
                You can start a new registration anytime.
              </p>
            </div>
            <Button
              onClick={() => router.push("/register")}
              variant="outline"
              className="gap-2"
              size="lg"
            >
              Begin Fresh Registration
              <HiArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
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

      <div className="space-y-3 text-center sm:space-y-4">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back, let’s pick up where you left off
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          We saved your progress after the{" "}
          <span className="text-foreground font-medium">
            {stepLabels[safeLastStep]}
          </span>{" "}
          step. You’re ready to continue with{" "}
          <span className="text-foreground font-medium">
            {stepLabels[resumeStep]}
          </span>
          .
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-left">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Last completed
              </p>
              <h2 className="text-foreground text-lg font-semibold">
                {stepLabels[safeLastStep]}
              </h2>
              <div className="text-muted-foreground text-xs">
                Saved on {lastUpdatedLabel}
              </div>
            </div>
            <Badge variant="outline" className="inline-flex items-center gap-2">
              <HiClock className="h-4 w-4" />
              Incomplete registration
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>Overall progress</span>
              <span className="text-foreground font-medium">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
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
                    "flex items-start gap-3 rounded-lg border px-4 py-3 text-left",
                    status === "done" && "border-emerald-200 bg-emerald-50",
                    status === "current" && "border-primary/60 bg-primary/5",
                    status === "upcoming" &&
                      "border-border/60 bg-muted/40 text-muted-foreground",
                  )}
                >
                  <div className="flex shrink-0 items-center justify-center">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                        status === "done" && "bg-emerald-500 text-white",
                        status === "current" &&
                          "bg-primary text-primary-foreground",
                        status === "upcoming" &&
                          "bg-muted text-muted-foreground",
                      )}
                      aria-hidden="true"
                    >
                      {status === "done" ? (
                        <HiCheckCircle className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        status === "upcoming" && "text-muted-foreground",
                      )}
                    >
                      {stepLabels[step]}
                    </p>
                    {status === "current" && (
                      <p className="text-muted-foreground text-xs">
                        This is your next step. We’ll guide you through it.
                      </p>
                    )}
                    {status === "done" && (
                      <p className="text-muted-foreground text-xs">
                        Completed and saved successfully.
                      </p>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ol>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              onClick={handleResume}
              size="lg"
              className="flex-1 gap-2 sm:flex-[0.6]"
            >
              <HiOutlineRefresh className="h-5 w-5" />
              Resume where I stopped
            </Button>
            <Button
              onClick={handleStartOver}
              size="lg"
              variant="outline"
              className="flex-1 gap-2"
            >
              Start fresh
              <HiArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 text-left">
            <div className="text-primary">
              <HiInformationCircle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-foreground text-base font-semibold">
                Need a quick refresh?
              </h3>
              <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                <li>Your NIN is securely linked to this saved progress.</li>
                <li>
                  We validate each step when you continue, so nothing is lost.
                </li>
                <li>
                  You can always restart the journey if your details changed.
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <TrustIndicators
        items={[
          {
            icon: <HiShieldCheck className="h-4 w-4" />,
            label: "Identity verified",
          },
          {
            icon: <HiLockClosed className="h-4 w-4" />,
            label: "Securely stored",
          },
          {
            icon: <HiClock className="h-4 w-4" />,
            label: "Resume anytime",
          },
        ]}
      />
    </div>
  );
}
