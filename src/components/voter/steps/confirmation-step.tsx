"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  HiCheckCircle,
  HiArrowLeft,
  HiUser,
  HiLocationMarker,
  HiUsers,
  HiIdentification,
  HiShieldCheck,
  HiPhone,
  HiMail,
  HiExclamationCircle,
} from "react-icons/hi";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { StepProgress } from "@/components/ui/step-progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { useRegistrationStore } from "@/stores/registration-store";
import { voterApi } from "@/lib/api/voter";
import { toast } from "sonner";
import { RegistrationStepHeader } from "@/components/voter/registration-step-header";

export function ConfirmationStep() {
  const router = useRouter();
  const { payload } = useRegistrationStore();
  const [error, setError] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState<
    "idle" | "submitting"
  >("idle");

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Submit registration directly (no NIN verification — that's a paid tier feature)
      setVerificationStep("submitting");
      const result = await voterApi.submitRegistration(payload);
      return result;
    },
    onSuccess: () => {
      toast.success("Registration complete! Your data has been saved.", {
        duration: 5000,
      });
      router.push("/register/complete");
    },
    onError: (err: Error) => {
      setError(err.message);
      toast.error(err.message);
      setVerificationStep("idle");
    },
  });

  const handleSubmit = useCallback(() => {
    setError(null);

    // Validate required data before submission
    if (
      !payload.basic?.firstName ||
      !payload.basic?.lastName ||
      !payload.basic?.dateOfBirth
    ) {
      setError(
        "Personal information is incomplete. Please go back and complete your profile.",
      );
      return;
    }

    if (!payload.basic?.role) {
      setError(
        "Role selection is required. Please go back and select your role.",
      );
      return;
    }

    if (
      !payload.location?.state ||
      !payload.location?.lga ||
      !payload.location?.ward ||
      !payload.location?.pollingUnit
    ) {
      setError(
        "Location information is incomplete. Please go back and select your voting location.",
      );
      return;
    }

    if (
      !payload.candidates?.selections ||
      payload.candidates.selections.length === 0
    ) {
      setError(
        "Candidate selection is required. Please go back and select your candidates.",
      );
      return;
    }

    submitMutation.mutate();
  }, [submitMutation, payload]);

  // Get status message based on current step
  const getStatusMessage = () => {
    if (verificationStep === "submitting") {
      return "Finalizing your registration...";
    }
    return "Submit Registration";
  };

  const handleBack = useCallback(() => {
    router.push("/register/candidate");
  }, [router]);

  return (
    <div className="space-y-6">
      <StepProgress
        currentStep={6}
        totalSteps={6}
        stepTitle="Confirm Details"
      />

      <RegistrationStepHeader
        icon={ClipboardCheck}
        badge="Final Review"
        title="Review and Confirm Your Registration"
        description="Please review all your information carefully before submitting."
      />

      {error && (
        <Alert variant="destructive">
          <HiExclamationCircle className="h-5 w-5" />
          <AlertDescription>
            <p className="font-semibold">Verification Failed</p>
            <p className="mt-1 text-sm">{error}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Architectural Review Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative overflow-hidden border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]"
      >
        {/* Architectural Markers */}
        <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

        <div className="space-y-8 p-7 sm:p-10">
          <div className="border-border/40 border-b pb-6">
            <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
              Registration Summary
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <div className="bg-primary/60 size-1.5 rounded-[1px]" />
              <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                Final Review <span className="text-primary/40 mx-1">|</span>{" "}
                <span className="text-foreground font-bold">
                  Pending Submission
                </span>
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/5 text-primary border-primary/20 flex h-8 w-8 items-center justify-center rounded-lg border">
                <HiUser className="h-4 w-4" />
              </div>
              <h3 className="text-foreground text-xs font-bold tracking-widest uppercase">
                Personal Information
              </h3>
            </div>
            <div className="bg-muted/5 border-border/60 grid gap-4 rounded-xl border p-5 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Full Name
                </dt>
                <dd className="text-foreground mt-1 text-sm font-medium">
                  {payload.basic?.firstName} {payload.basic?.middleName || ""}{" "}
                  {payload.basic?.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  NIN (Registration ID)
                </dt>
                <dd className="text-foreground mt-1 font-mono text-sm font-bold tracking-wider">
                  {payload.nin}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Email
                </dt>
                <dd className="text-foreground mt-1 text-sm font-medium">
                  {payload.basic?.email}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Phone Number
                </dt>
                <dd className="text-foreground mt-1 font-mono text-sm font-medium">
                  {payload.phone}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Date of Birth
                </dt>
                <dd className="text-foreground mt-1 text-sm font-medium">
                  {payload.basic?.dateOfBirth}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Gender
                </dt>
                <dd className="text-foreground mt-1 text-sm font-medium capitalize">
                  {payload.basic?.gender}
                </dd>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/5 text-primary border-primary/20 flex h-8 w-8 items-center justify-center rounded-lg border">
                <HiLocationMarker className="h-4 w-4" />
              </div>
              <h3 className="text-foreground text-xs font-bold tracking-widest uppercase">
                Voting Location
              </h3>
            </div>
            <div className="bg-muted/5 border-border/60 grid gap-4 rounded-xl border p-5 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  State
                </dt>
                <dd className="text-foreground mt-1 text-sm font-medium">
                  {payload.location?.state}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Local Government Area
                </dt>
                <dd className="text-foreground mt-1 text-sm font-medium">
                  {payload.location?.lga}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Ward
                </dt>
                <dd className="text-foreground mt-1 text-sm font-medium">
                  {payload.location?.ward}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Polling Unit
                </dt>
                <dd className="text-foreground mt-1 text-sm font-medium">
                  {payload.location?.pollingUnit}
                </dd>
              </div>
            </div>
          </div>

          {/* Candidate Selections */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/5 text-primary border-primary/20 flex h-8 w-8 items-center justify-center rounded-lg border">
                <HiUsers className="h-4 w-4" />
              </div>
              <h3 className="text-foreground text-xs font-bold tracking-widest uppercase">
                Candidate Selections
              </h3>
            </div>
            <div className="bg-muted/5 border-border/60 space-y-3 rounded-xl border p-5">
              {payload.candidates?.selections?.map((selection, index) => (
                <div
                  key={index}
                  className="bg-background border-border/60 flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      {selection.position}
                    </dt>
                    <dd className="text-foreground text-sm font-bold tracking-wide uppercase">
                      {selection.candidateName}
                    </dd>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-muted/20 text-[9px] font-bold tracking-wider uppercase"
                  >
                    {selection.candidateParty}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Canvasser Code (if provided) */}
          {payload.canvasser?.canvasserCode && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/5 text-primary border-primary/20 flex h-8 w-8 items-center justify-center rounded-lg border">
                  <HiIdentification className="h-4 w-4" />
                </div>
                <h3 className="text-foreground text-xs font-bold tracking-widest uppercase">
                  Canvasser Referral
                </h3>
              </div>
              <div className="bg-muted/5 border-border/60 rounded-xl border p-5">
                <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Canvasser Code
                </dt>
                <dd className="text-foreground mt-1 font-mono text-sm font-medium tracking-wider">
                  {payload.canvasser.canvasserCode}
                </dd>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          size="lg"
          className="hover:bg-muted/10 hover:text-foreground h-12 rounded-xl border-2 px-8 text-xs font-bold tracking-widest uppercase"
          disabled={submitMutation.isPending}
        >
          <HiArrowLeft className="mr-2 h-4 w-4" />
          Back to Candidates
        </Button>
        <Button
          onClick={handleSubmit}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/95 h-12 flex-1 rounded-xl text-xs font-bold tracking-widest uppercase shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all active:scale-95"
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {getStatusMessage()}
            </>
          ) : (
            <>
              <HiCheckCircle className="mr-2 h-4 w-4" />
              Submit Registration
            </>
          )}
        </Button>
      </div>

      <TrustIndicators
        items={[
          {
            icon: <HiShieldCheck />,
            label: "SECURE_SUBMISSION",
          },
          {
            icon: <HiPhone />,
            label: "SMS_CONFIRMATION",
          },
          {
            icon: <HiMail />,
            label: "EMAIL_RECEIPT",
          },
        ]}
      />
    </div>
  );
}
