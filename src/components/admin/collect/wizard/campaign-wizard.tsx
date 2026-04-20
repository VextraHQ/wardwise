"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";

import { track } from "@/lib/analytics/client";
import { useCreateCampaign } from "@/hooks/use-collect";
import { useWizardDraft } from "@/hooks/use-wizard-draft";
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
import { StepCampaignCollectConfig } from "./step-campaign-collect-config";
import { StepCampaignReview } from "./step-campaign-review";

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

const STEP_TITLES = ["Select Candidate", "Collect setup", "Review & create"];

/** Bumped when wizard step shape changes so stale drafts are not mis-applied. */
const DRAFT_STORAGE_KEY = "wardwise:campaign-wizard:draft:v2";

const DEFAULT_CAMPAIGN_FORM_VALUES: CreateCampaignData = {
  candidateId: "",
  slug: "",
  brandingType: "candidate",
  displayName: "",
  enabledLgaIds: [],
  customQuestion1: "",
  customQuestion2: "",
};

function isMeaningfulCampaignDraft(values: CreateCampaignData): boolean {
  return Boolean(
    values.candidateId?.trim() ||
    values.slug?.trim() ||
    values.displayName?.trim() ||
    values.customQuestion1?.trim() ||
    values.customQuestion2?.trim() ||
    (values.enabledLgaIds && values.enabledLgaIds.length > 0),
  );
}

const stepFieldMap: Record<number, (keyof CreateCampaignData)[]> = {
  0: ["candidateId", "slug", "brandingType", "displayName"],
  1: [],
  2: [],
};

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function CampaignWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createCampaign = useCreateCampaign();
  const [step, setStep] = useState(0);

  const form = useForm<CreateCampaignData>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: DEFAULT_CAMPAIGN_FORM_VALUES,
  });

  const {
    restoredAt: draftRestoredAt,
    discard: discardDraft,
    clear: clearDraftStorage,
  } = useWizardDraft({
    form,
    step,
    storageKey: DRAFT_STORAGE_KEY,
    defaultValues: DEFAULT_CAMPAIGN_FORM_VALUES,
    isMeaningful: isMeaningfulCampaignDraft,
    maxStep: STEP_TITLES.length - 1,
    onRestored: (_savedAt, restoredStep) => {
      setStep(restoredStep);
      track("admin_campaign_wizard_draft_restored", { step: restoredStep });
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

  function handleDiscardCampaignDraft() {
    discardDraft();
    setStep(0);
    track("admin_campaign_wizard_draft_discarded", {});
  }

  // URL preselect runs after candidates load; skips when a candidate is already
  // chosen (including from a restored `useWizardDraft` snapshot).
  useEffect(() => {
    const candidateId = searchParams.get("candidateId");
    if (!candidateId || !candidates || form.getValues("candidateId")) return;
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;
    form.setValue("candidateId", candidate.id, { shouldValidate: true });
    form.setValue("slug", toSlug(candidate.name), { shouldValidate: true });
  }, [candidates, form, searchParams]);

  async function validateAndNext() {
    const fields = stepFieldMap[step];
    const valid = await form.trigger(fields);
    if (!valid) return;
    setStep((s) => s + 1);
  }

  function advanceToReview() {
    setStep(2);
  }

  function goBack() {
    if (step === 0) {
      router.push("/admin/collect");
    } else {
      setStep((s) => s - 1);
    }
  }

  function handleEditFromReview(targetIndex: number) {
    setStep(targetIndex);
  }

  async function handleSubmit() {
    const valid = await form.trigger();
    if (!valid) return;
    try {
      const data = form.getValues();
      const result = await createCampaign.mutateAsync({
        candidateId: data.candidateId,
        slug: data.slug.trim(),
        brandingType: data.brandingType,
        displayName: data.displayName?.trim() || null,
        enabledLgaIds: data.enabledLgaIds,
        customQuestion1: data.customQuestion1?.trim() || null,
        customQuestion2: data.customQuestion2?.trim() || null,
      });
      track("admin_campaign_created", {
        campaign_id: result.campaign.id,
        candidate_id: data.candidateId,
      });
      clearDraftStorage();
      toast.success("Campaign created successfully");
      router.push(`/admin/collect/campaigns/${result.campaign.id}`);
    } catch (err) {
      track("admin_campaign_creation_failed", {
        error_category: "request_failed",
      });
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create campaign. Please try again.",
      );
    }
  }

  const candidateId = useWatch({ control: form.control, name: "candidateId" });
  const watchedForm = useWatch({ control: form.control });
  const selectedCandidate = useMemo(
    () => candidates?.find((c) => c.id === candidateId),
    [candidates, candidateId],
  );

  const stepSubtitles = useMemo((): (string | undefined)[] => {
    const v = watchedForm as CreateCampaignData;
    const anchor =
      selectedCandidate?.name?.trim() || v?.candidateId?.trim() || undefined;
    const slugLine = v?.slug?.trim() ? `/c/${v.slug.trim()}` : undefined;
    const q1 = v?.customQuestion1?.trim();
    const q2 = v?.customQuestion2?.trim();
    const qBits = [q1, q2].filter(Boolean);
    return [
      [anchor, slugLine].filter(Boolean).join(" · ") || undefined,
      qBits.length
        ? `${qBits.length} custom question${qBits.length === 1 ? "" : "s"}`
        : undefined,
      anchor ? "Ready to create" : undefined,
    ];
  }, [watchedForm, selectedCandidate?.name]);

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 pb-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              asChild
              className="text-foreground/90 hover:text-foreground font-mono text-[9px] font-bold tracking-[0.15em] uppercase transition-colors"
            >
              <Link href="/admin/collect">Campaigns</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-muted-foreground/70">
            /
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground/40 font-mono text-[9px] font-bold tracking-[0.15em] uppercase">
              New Campaign
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {draftRestoredAt && (
        <div
          className="border-border/60 bg-primary/5 flex items-center justify-between gap-3 rounded-sm border px-3 py-2"
          role="status"
          aria-live="polite"
        >
          <p className="text-muted-foreground text-xs">
            <span className="text-primary font-mono text-[10px] font-bold tracking-widest uppercase">
              Draft restored
            </span>{" "}
            <span className="ml-1">
              Campaign setup resumed (
              {new Date(draftRestoredAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              )
            </span>
          </p>
          <button
            type="button"
            onClick={handleDiscardCampaignDraft}
            className="border-border/70 bg-card text-foreground/80 hover:bg-muted/60 h-6 shrink-0 rounded-sm border px-2 text-[10px] font-bold tracking-widest uppercase transition-colors"
          >
            Discard
          </button>
        </div>
      )}

      <StepProgress
        currentStep={step + 1}
        totalSteps={STEP_TITLES.length}
        stepTitle={STEP_TITLES[step]}
        stepTitles={STEP_TITLES}
        stepSubtitles={stepSubtitles}
        contextLabel="Campaign Setup"
        onStepClick={(index) => {
          if (index < step) setStep(index);
        }}
      />

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
        <StepCampaignCollectConfig
          key={candidateId || "pending"}
          form={form}
          selectedCandidate={selectedCandidate}
          onBack={goBack}
          onNext={advanceToReview}
        />
      )}

      {step === 2 && (
        <StepCampaignReview
          form={form}
          isSubmitting={createCampaign.isPending}
          selectedCandidate={selectedCandidate}
          onBack={goBack}
          onSubmit={handleSubmit}
          onEditStep={handleEditFromReview}
        />
      )}
    </div>
  );
}
