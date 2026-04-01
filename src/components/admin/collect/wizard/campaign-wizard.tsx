"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";

import { useCreateCampaign } from "@/hooks/use-collect";
import {
  createCampaignSchema,
  type CreateCampaignData,
} from "@/lib/schemas/collect-schemas";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { StepProgress } from "@/components/ui/step-progress";
import { StepCandidateSetup } from "./step-candidate-setup";
import { StepQuestionsReview } from "./step-questions-review";

type Candidate = {
  id: string;
  name: string;
  party: string;
  position: string;
  constituency: string;
  stateCode: string;
  lga: string;
  constituencyLgaIds: number[];
};

const STEP_TITLES = ["Select Candidate", "Questions & Review"];

const stepFieldMap: Record<number, (keyof CreateCampaignData)[]> = {
  0: ["candidateId", "slug"],
  1: [],
};

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function CampaignWizard() {
  const router = useRouter();
  const createCampaign = useCreateCampaign();
  const [step, setStep] = useState(0);

  const form = useForm<CreateCampaignData>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      candidateId: "",
      slug: "",
      enabledLgaIds: [],
      customQuestion1: "",
      customQuestion2: "",
    },
  });

  const { data: candidates, isLoading: candidatesLoading } = useQuery<
    Candidate[]
  >({
    queryKey: ["admin-candidates"],
    queryFn: async () => {
      const res = await fetch("/api/admin/candidates");
      if (!res.ok) throw new Error("Failed to fetch candidates");
      const json = await res.json();
      return json.candidates;
    },
    staleTime: 1000 * 60 * 5,
  });

  const candidateOptions = useMemo(
    () =>
      candidates?.map((c) => ({
        value: c.id,
        label: c.name,
        description: `${c.party} — ${c.constituency || c.position || "N/A"}`,
      })) ?? [],
    [candidates],
  );

  function handleCandidateSelect(candidateId: string) {
    const candidate = candidates?.find((c) => c.id === candidateId);
    if (!candidate) return;

    form.setValue("candidateId", candidate.id, { shouldValidate: true });
    form.setValue("slug", toSlug(candidate.name), { shouldValidate: true });
  }

  async function validateAndNext() {
    const fields = stepFieldMap[step];
    const valid = await form.trigger(fields);
    if (!valid) return;
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step === 0) {
      router.push("/admin/collect");
    } else {
      setStep((s) => s - 1);
    }
  }

  async function handleSubmit() {
    const valid = await form.trigger();
    if (!valid) return;
    try {
      const data = form.getValues();
      const result = await createCampaign.mutateAsync({
        candidateId: data.candidateId,
        slug: data.slug.trim(),
        enabledLgaIds: data.enabledLgaIds,
        customQuestion1: data.customQuestion1?.trim() || null,
        customQuestion2: data.customQuestion2?.trim() || null,
      });
      toast.success("Campaign created successfully");
      router.push(`/admin/collect/campaigns/${result.campaign.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create campaign. Please try again.",
      );
    }
  }

  // Get selected candidate for summary card
  const candidateId = useWatch({ control: form.control, name: "candidateId" });
  const selectedCandidate = useMemo(
    () => candidates?.find((c) => c.id === candidateId),
    [candidates, candidateId],
  );

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 pb-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              asChild
              className="text-foreground/60 hover:text-foreground font-mono text-[9px] font-bold tracking-[0.15em] uppercase transition-colors"
            >
              <Link href="/admin/collect">Campaigns</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-muted-foreground/30">
            /
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground/30 font-mono text-[9px] font-bold tracking-[0.15em] uppercase">
              New Campaign
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Step Progress */}
      <StepProgress
        currentStep={step + 1}
        totalSteps={2}
        stepTitle={STEP_TITLES[step]}
        contextLabel="Campaign Setup"
      />

      {/* Steps */}
      {step === 0 && (
        <StepCandidateSetup
          form={form}
          candidateOptions={candidateOptions}
          candidatesLoading={candidatesLoading}
          selectedCandidate={selectedCandidate}
          onCandidateSelect={handleCandidateSelect}
          onBack={goBack}
          onNext={validateAndNext}
        />
      )}

      {step === 1 && (
        <StepQuestionsReview
          form={form}
          isSubmitting={createCampaign.isPending}
          selectedCandidate={selectedCandidate}
          onBack={goBack}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
