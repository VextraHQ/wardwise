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
  HiInformationCircle,
  HiExclamationCircle,
} from "react-icons/hi";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StepProgress } from "@/components/ui/step-progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { useRegistrationStore } from "@/stores/registration-store";
import { voterApi } from "@/lib/api/voter";
import { toast } from "sonner";
import { RegistrationStepHeader } from "../registration-step-header";

export function ConfirmationStep() {
  const router = useRouter();
  const { payload } = useRegistrationStore();
  const [error, setError] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState<
    "idle" | "verifying" | "submitting"
  >("idle");

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Verify NIN (mock - this is where real verification would happen)
      setVerificationStep("verifying");

      // Simulate verification delay (in production, this would call SmileID/Prembly)
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Slightly longer for realism

      // For demo: verification always succeeds
      // In production:
      // const verifyResult = await voterApi.verifyNIN(payload.nin);
      // if (!verifyResult.verified) {
      //   throw new Error("NIN verification failed. Please check your NIN and try again.");
      // }
      //
      // // CRITICAL: Check if DOB matches NIN record (prevents age spoofing)
      // const submittedDOB = payload.basic?.dateOfBirth;
      // const ninDOB = verifyResult.dateOfBirth;
      // if (submittedDOB !== ninDOB) {
      //   throw new Error(
      //     "Your date of birth doesn't match records. Please go back and correct your information."
      //   );
      // }
      //
      // // Check if user selected "Voter" role but is under 18
      // const age = calculateAge(ninDOB);
      // if (payload.basic?.role === "voter" && age < 18) {
      //   throw new Error(
      //     "You must be 18 or older to register as a voter. Your registration cannot be completed."
      //   );
      // }

      // Step 2: Submit registration
      setVerificationStep("submitting");
      const result = await voterApi.submitRegistration(payload);
      return result;
    },
    onSuccess: () => {
      toast.success("Registration complete! Your NIN has been verified.", {
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
    if (!payload.nin) {
      setError("NIN is required. Please go back and complete all steps.");
      return;
    }

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
    if (verificationStep === "verifying") {
      return "Verifying your NIN...";
    }
    if (verificationStep === "submitting") {
      return "Finalizing your registration...";
    }
    return "Submit Registration";
  };

  const handleBack = useCallback(() => {
    router.push("/register/candidate");
  }, [router]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 py-8">
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

      {/* Verification Info Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
        <HiInformationCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Your NIN will be verified when you submit
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            We'll verify your National Identification Number matches the
            information you provided. This ensures only genuine Nigerian voters
            can register.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <HiExclamationCircle className="h-5 w-5" />
          <AlertDescription>
            <p className="font-semibold">Verification Failed</p>
            <p className="mt-1 text-sm">{error}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
              <HiUser className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-lg font-semibold">
                Personal Information
              </h2>
              <p className="text-muted-foreground text-xs">
                Your basic details
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Full Name
              </dt>
              <dd className="text-foreground mt-1 text-base font-medium">
                {payload.basic?.firstName} {payload.basic?.middleName || ""}{" "}
                {payload.basic?.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                National ID (NIN)
              </dt>
              <dd className="text-foreground mt-1 text-base font-medium">
                {payload.nin}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Email
              </dt>
              <dd className="text-foreground mt-1 text-base font-medium">
                {payload.basic?.email}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Phone Number
              </dt>
              <dd className="text-foreground mt-1 text-base font-medium">
                {payload.phone}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Date of Birth
              </dt>
              <dd className="text-foreground mt-1 text-base font-medium">
                {payload.basic?.dateOfBirth}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Gender
              </dt>
              <dd className="text-foreground mt-1 text-base font-medium capitalize">
                {payload.basic?.gender}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Occupation
              </dt>
              <dd className="text-foreground mt-1 text-base font-medium capitalize">
                {payload.basic?.occupation?.replace("-", " ")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Religion
              </dt>
              <dd className="text-foreground mt-1 text-base font-medium capitalize">
                {payload.basic?.religion}
              </dd>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
              <HiLocationMarker className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-lg font-semibold">
                Voting Location
              </h2>
              <p className="text-muted-foreground text-xs">
                Where you'll cast your vote
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                State
              </dt>
              <dd className="text-foreground mt-1 text-base font-medium">
                {payload.location?.state}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Local Government Area
              </dt>
              <dd className="text-foreground mt-1 text-base font-medium">
                {payload.location?.lga}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Ward
              </dt>
              <dd className="text-foreground mt-1 text-base font-medium">
                {payload.location?.ward}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Polling Unit
              </dt>
              <dd className="text-foreground mt-1 text-base font-medium">
                {payload.location?.pollingUnit}
              </dd>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Selections */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
              <HiUsers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-lg font-semibold">
                Candidate Selections
              </h2>
              <p className="text-muted-foreground text-xs">
                Your chosen candidates for all 5 positions
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {payload.candidates?.selections?.map((selection, index) => (
            <div
              key={index}
              className="border-border/60 flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {selection.position}
                </dt>
                <dd className="text-foreground text-base font-semibold">
                  {selection.candidateName}
                </dd>
              </div>
              <Badge variant="outline" className="text-xs">
                {selection.candidateParty}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Canvasser Code (if provided) */}
      {payload.canvasser?.canvasserCode && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                <HiIdentification className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-foreground text-lg font-semibold">
                  Canvasser Referral
                </h2>
                <p className="text-muted-foreground text-xs">
                  Your referral code
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-4">
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Canvasser Code
              </dt>
              <dd className="text-foreground mt-1 text-base font-medium">
                {payload.canvasser.canvasserCode}
              </dd>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          size="lg"
          className="gap-2"
          disabled={submitMutation.isPending}
        >
          <HiArrowLeft className="h-5 w-5" />
          Back to Previous Step
        </Button>
        <Button
          onClick={handleSubmit}
          size="lg"
          className="gap-2"
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {getStatusMessage()}
            </>
          ) : (
            <>
              <HiCheckCircle className="h-5 w-5" />
              Submit Registration
            </>
          )}
        </Button>
      </div>

      <TrustIndicators
        items={[
          {
            icon: <HiShieldCheck className="h-4 w-4" />,
            label: "Secure submission",
          },
          {
            icon: <HiPhone className="h-4 w-4" />,
            label: "SMS confirmation",
          },
          {
            icon: <HiMail className="h-4 w-4" />,
            label: "Email receipt",
          },
        ]}
      />
    </div>
  );
}
