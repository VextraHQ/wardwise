"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { useCreateCandidate } from "@/hooks/use-admin";
import { track } from "@/lib/analytics/client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { StepProgress } from "@/components/ui/step-progress";

import {
  createCandidateSchema,
  type CreateCandidateFormValues,
} from "@/lib/schemas/admin-schemas";
import { type CreateCandidateResponse } from "@/lib/api/admin";
import { CredentialsDialog } from "./credentials-dialog";
import { StepIdentity } from "./wizard/step-identity";
import { StepPosition } from "./wizard/step-position";
import { StepReview } from "./wizard/step-review";

const STEP_TITLES = ["Identity", "Electoral Position", "Review & Submit"];

// Fields validated at each step
const stepFieldMap: Record<number, (keyof CreateCandidateFormValues)[]> = {
  0: ["name", "email", "party"],
  1: ["position", "constituency", "stateCode", "constituencyLgaIds"],
  2: [],
};

export function CreateCandidateForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [credentialsData, setCredentialsData] =
    useState<CreateCandidateResponse | null>(null);

  const form = useForm<CreateCandidateFormValues>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: {
      name: "",
      email: "",
      party: "",
      position: "",
      constituency: "",
      stateCode: "",
      lga: "",
      constituencyLgaIds: [],
      description: "",
      phone: "",
      title: "",
    },
    mode: "onChange",
  });

  const createMutation = useCreateCandidate();

  async function validateAndNext() {
    const fields = stepFieldMap[step];
    const valid = await form.trigger(fields);
    if (!valid) return;
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step === 0) {
      router.push("/admin/candidates");
    } else {
      setStep((s) => s - 1);
    }
  }

  async function handleSubmit() {
    const valid = await form.trigger();
    if (!valid) {
      toast.error("Please fix the errors before submitting");
      return;
    }
    const data = form.getValues();
    createMutation.mutate(
      {
        name: data.name,
        email: data.email,
        party: data.party,
        position: data.position as
          | "President"
          | "Governor"
          | "Senator"
          | "House of Representatives"
          | "State Assembly",
        constituency: data.constituency,
        constituencyLgaIds: data.constituencyLgaIds,
        stateCode: data.stateCode || undefined,
        lga: data.lga || undefined,
        description: data.description || undefined,
        phone: data.phone || undefined,
        title: data.title || undefined,
      },
      {
        onSuccess: (result) => {
          track("admin_candidate_created", {
            candidate_id: result.candidate.id,
            position: data.position,
          });
          setCredentialsData(result);
        },
        onError: (error: Error) => {
          track("admin_candidate_creation_failed", {
            error_category: "request_failed",
          });
          toast.error(error.message || "Failed to create candidate");
        },
      },
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-xl space-y-6 pb-8">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="text-foreground/90 hover:text-foreground font-mono text-[9px] font-bold tracking-[0.15em] uppercase transition-colors"
              >
                <Link href="/admin/candidates">Candidates</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/70">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground/40 font-mono text-[9px] font-bold tracking-[0.15em] uppercase">
                New Candidate
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Step Progress */}
        <StepProgress
          currentStep={step + 1}
          totalSteps={3}
          stepTitle={STEP_TITLES[step]}
          contextLabel="Candidate Registration"
        />

        {/* Steps */}
        {step === 0 && (
          <StepIdentity form={form} onBack={goBack} onNext={validateAndNext} />
        )}

        {step === 1 && (
          <StepPosition form={form} onBack={goBack} onNext={validateAndNext} />
        )}

        {step === 2 && (
          <StepReview
            form={form}
            isSubmitting={createMutation.isPending}
            onBack={goBack}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* Credentials Dialog */}
      {credentialsData && (
        <CredentialsDialog
          open={!!credentialsData}
          onOpenChange={(open) => {
            if (!open) {
              router.push(`/admin/candidates/${credentialsData.candidate.id}`);
            }
          }}
          candidateName={credentialsData.candidate.name}
          email={credentialsData.candidate.email}
          setupUrl={credentialsData.setupUrl}
          expiresAt={credentialsData.setupExpiresAt}
          deliveryMethod={credentialsData.deliveryMethod}
        />
      )}
    </>
  );
}
