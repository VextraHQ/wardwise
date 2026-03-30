"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";

import { useCreateCampaign } from "@/hooks/use-collect";
import { useGeoLgas } from "@/hooks/use-geo";
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
import { StepCoverageRequirements } from "./step-coverage-requirements";
import { StepQuestionsReview } from "./step-questions-review";

type Candidate = {
  id: string;
  name: string;
  party: string;
  position: string;
  constituency: string;
  stateCode: string;
  lga: string;
};

const STEP_TITLES = ["Select Candidate", "LGA Coverage", "Questions & Review"];

const stepFieldMap: Record<number, (keyof CreateCampaignData)[]> = {
  0: [
    "candidateId",
    "candidateName",
    "slug",
    "party",
    "constituency",
    "constituencyType",
  ],
  1: ["enabledLgaIds"],
  2: [],
};

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function positionToConstituencyType(
  position: string,
): "federal" | "state" | undefined {
  switch (position) {
    case "House of Representatives":
    case "Senator":
    case "President":
      return "federal";
    case "Governor":
    case "State Assembly":
      return "state";
    default:
      return undefined;
  }
}

export function CampaignWizard() {
  const router = useRouter();
  const createCampaign = useCreateCampaign();
  const [step, setStep] = useState(0);
  const [candidateState, setCandidateState] = useState<string>("");
  const prevStateCodeRef = useRef<string | null>(null);

  const form = useForm<CreateCampaignData>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      candidateId: "",
      candidateName: "",
      candidateTitle: "",
      party: "",
      slug: "",
      constituency: "",
      constituencyType: undefined,
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

  // candidateState already holds the stateCode directly
  const stateCode = candidateState || null;

  // Fetch LGAs filtered by state
  const { data: lgaResponse, isLoading: lgasLoading } = useGeoLgas(stateCode, {
    pageSize: 100,
  });

  // Map GeoLga[] to simple { id, name }[]
  const lgas = useMemo(
    () => lgaResponse?.data.map((l) => ({ id: l.id, name: l.name })),
    [lgaResponse],
  );

  // Auto-select all LGAs when they load and none are selected yet
  useEffect(() => {
    if (!lgas || lgas.length === 0) return;
    const currentIds = form.getValues("enabledLgaIds");
    if (currentIds.length === 0) {
      form.setValue(
        "enabledLgaIds",
        lgas.map((l) => l.id),
        { shouldValidate: true },
      );
    }
  }, [lgas, form]);

  // Clear enabledLgaIds when stateCode changes (candidate switched)
  useEffect(() => {
    if (
      prevStateCodeRef.current !== null &&
      prevStateCodeRef.current !== stateCode
    ) {
      form.setValue("enabledLgaIds", [], { shouldValidate: true });
    }
    prevStateCodeRef.current = stateCode;
  }, [stateCode, form]);

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
    form.setValue("candidateName", candidate.name);
    form.setValue("party", candidate.party);
    form.setValue("slug", toSlug(candidate.name), { shouldValidate: true });
    form.setValue("constituency", candidate.constituency || "", {
      shouldValidate: true,
    });

    const derivedType = positionToConstituencyType(candidate.position);
    if (derivedType) {
      form.setValue("constituencyType", derivedType, { shouldValidate: true });
    }

    setCandidateState(candidate.stateCode || "");
  }

  async function validateAndNext() {
    const fields = stepFieldMap[step];
    // Skip LGA validation when step is skipped
    const fieldsToValidate = step === 1 && skipLgaStep ? [] : fields;
    const valid = await form.trigger(fieldsToValidate);
    if (!valid) return;

    // Manual LGA validation for constituency-level positions
    if (step === 1 && !skipLgaStep) {
      const ids = form.getValues("enabledLgaIds");
      if (ids.length === 0) {
        form.setError("enabledLgaIds", {
          message: "Select at least one LGA",
        });
        return;
      }
    }

    if (step === 0 && skipLgaStep) {
      // Skip step 1 (LGA Coverage) — clear enabledLgaIds for scope-based resolution
      form.setValue("enabledLgaIds", []);
      setStep(2);
    } else {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (step === 0) {
      router.push("/admin/collect");
    } else if (step === 2 && skipLgaStep) {
      setStep(0);
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
        candidateName: data.candidateName.trim(),
        candidateTitle: data.candidateTitle?.trim() || null,
        party: data.party,
        slug: data.slug.trim(),
        constituency: data.constituency.trim(),
        constituencyType: data.constituencyType,
        enabledLgaIds: data.enabledLgaIds,
        customQuestion1: data.customQuestion1?.trim() || null,
        customQuestion2: data.customQuestion2?.trim() || null,
      });
      toast.success("Campaign created successfully");
      router.push(`/admin/collect/campaigns/${result.campaign.id}`);
    } catch {
      toast.error("Failed to create campaign. Please try again.");
    }
  }

  // Get selected candidate for summary card
  const candidateId = useWatch({ control: form.control, name: "candidateId" });
  const selectedCandidate = useMemo(
    () => candidates?.find((c) => c.id === candidateId),
    [candidates, candidateId],
  );

  // President and Governor don't need LGA selection — scope is implicit
  const skipLgaStep =
    selectedCandidate?.position === "President" ||
    selectedCandidate?.position === "Governor";

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
        totalSteps={3}
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
        <StepCoverageRequirements
          form={form}
          lgas={lgas}
          lgasLoading={lgasLoading}
          candidateState={candidateState}
          onBack={goBack}
          onNext={validateAndNext}
        />
      )}

      {step === 2 && (
        <StepQuestionsReview
          form={form}
          lgas={lgas}
          isSubmitting={createCampaign.isPending}
          candidatePosition={selectedCandidate?.position}
          candidateState={candidateState}
          onBack={goBack}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
