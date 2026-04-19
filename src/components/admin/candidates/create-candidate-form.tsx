"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCreateCandidate } from "@/hooks/use-admin";
import { useWizardDraft } from "@/hooks/use-wizard-draft";
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
import { StepBoundary } from "./wizard/step-boundary";
import { StepReview } from "./wizard/step-review";

const STEP_TITLES = [
  "Identity",
  "Electoral office",
  "Electoral boundary",
  "Review & submit",
];

const TOTAL_STEPS = STEP_TITLES.length;

// Fields validated when leaving each step (Continue button)
const stepFieldMap: Record<number, (keyof CreateCandidateFormValues)[]> = {
  0: ["name", "email", "party"],
  1: ["position"],
  2: ["position", "stateCode", "constituency", "constituencyLgaIds"],
  3: [],
};

// Maps form-field name → step index. Used to route submit-time errors back to
// the offending step instead of stranding the user on Review.
const FIELD_TO_STEP: Partial<Record<keyof CreateCandidateFormValues, number>> =
  {
    name: 0,
    email: 0,
    phone: 0,
    title: 0,
    party: 0,
    position: 1,
    stateCode: 2,
    constituency: 2,
    constituencyLgaIds: 2,
    lga: 2,
    description: 3,
  };

const DRAFT_STORAGE_KEY = "wardwise:create-candidate:draft:v1";

const DEFAULT_FORM_VALUES: CreateCandidateFormValues = {
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
};

function isMeaningfulDraft(values: CreateCandidateFormValues): boolean {
  return Boolean(
    values.name?.trim() ||
    values.email?.trim() ||
    values.party?.trim() ||
    values.position?.trim() ||
    values.constituency?.trim() ||
    (values.constituencyLgaIds && values.constituencyLgaIds.length > 0),
  );
}

export function CreateCandidateForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [credentialsData, setCredentialsData] =
    useState<CreateCandidateResponse | null>(null);

  const form = useForm<CreateCandidateFormValues>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const createMutation = useCreateCandidate();
  const stepContentRef = useRef<HTMLDivElement>(null);
  const previousStepRef = useRef<number>(step);

  // Per-step menu subtitles — each is a tiny summary of the values entered for
  // that step. Surfaced inside StepProgress's navigation menu so the menu acts
  // as both a navigator and an at-a-glance recap of progress so far.
  const watchedSummary = useWatch({
    control: form.control,
    name: [
      "title",
      "name",
      "position",
      "stateCode",
      "constituency",
      "constituencyLgaIds",
    ],
  });
  const [wTitle, wName, wPosition, wStateCode, wConstituency, wLgaIds] =
    watchedSummary;
  const stepSubtitles: (string | undefined)[] = [
    [wTitle, wName].filter(Boolean).join(" ").trim() || undefined,
    wPosition || undefined,
    [
      wStateCode,
      wConstituency,
      wLgaIds && wLgaIds.length > 0
        ? `${wLgaIds.length} LGA${wLgaIds.length === 1 ? "" : "s"}`
        : undefined,
    ]
      .filter(Boolean)
      .join(" · ") || undefined,
    undefined,
  ];

  const {
    restoredAt: draftRestoredAt,
    discard: discardDraft,
    clear: clearDraftStorage,
  } = useWizardDraft({
    form,
    step,
    storageKey: DRAFT_STORAGE_KEY,
    defaultValues: DEFAULT_FORM_VALUES,
    isMeaningful: isMeaningfulDraft,
    maxStep: TOTAL_STEPS - 1,
    onRestored: (_savedAt, restoredStep) => {
      setStep(restoredStep);
      track("admin_candidate_wizard_draft_restored", {
        step: restoredStep,
      });
    },
  });

  // Move focus to the active step container whenever the step changes so
  // screen readers announce the new screen and keyboard users land in
  // context. Skip the initial mount.
  useEffect(() => {
    if (previousStepRef.current === step) return;
    previousStepRef.current = step;
    requestAnimationFrame(() => {
      stepContentRef.current?.focus();
    });
  }, [step]);

  const goToStep = useCallback(
    (next: number, reason: "advance" | "back" | "edit" | "stepper") => {
      const clamped = Math.min(Math.max(next, 0), TOTAL_STEPS - 1);
      if (clamped === step) return;
      track("admin_candidate_wizard_step_changed", {
        from_step: step,
        to_step: clamped,
        reason,
      });
      setStep(clamped);
    },
    [step],
  );

  async function validateAndNext() {
    const fields = stepFieldMap[step];
    const valid = await form.trigger(fields);
    if (!valid) return;
    goToStep(step + 1, "advance");
  }

  function goBack() {
    if (step === 0) {
      router.push("/admin/candidates");
      return;
    }
    goToStep(step - 1, "back");
  }

  function handleStepperClick(targetIndex: number) {
    if (targetIndex >= step) return; // forward jumps go through Continue
    goToStep(targetIndex, "stepper");
  }

  function handleEditFromReview(targetIndex: number) {
    goToStep(targetIndex, "edit");
  }

  function handleDiscardDraft() {
    discardDraft();
    setStep(0);
    track("admin_candidate_wizard_draft_discarded", {});
  }

  async function handleSubmit() {
    const valid = await form.trigger();
    if (!valid) {
      const firstErroredField = Object.keys(form.formState.errors)[0] as
        | keyof CreateCandidateFormValues
        | undefined;
      const targetStep =
        firstErroredField && FIELD_TO_STEP[firstErroredField] !== undefined
          ? FIELD_TO_STEP[firstErroredField]!
          : 0;
      toast.error("Please fix the errors before submitting");
      track("admin_candidate_creation_failed", {
        error_category: "client_validation",
      });
      if (targetStep !== step) goToStep(targetStep, "edit");
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
          clearDraftStorage();
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

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === TOTAL_STEPS - 1) {
      void handleSubmit();
    } else {
      void validateAndNext();
    }
  }

  return (
    <>
      <form
        onSubmit={handleFormSubmit}
        className="mx-auto w-full max-w-xl space-y-6 pb-8"
        noValidate
      >
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
                Picking up where you left off (
                {new Date(draftRestoredAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                )
              </span>
            </p>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="border-border/70 bg-card text-foreground/80 hover:bg-muted/60 h-6 shrink-0 rounded-sm border px-2 text-[10px] font-bold tracking-widest uppercase transition-colors"
            >
              Discard
            </button>
          </div>
        )}

        {/* Step Progress */}
        <StepProgress
          currentStep={step + 1}
          totalSteps={TOTAL_STEPS}
          stepTitle={STEP_TITLES[step]}
          stepTitles={STEP_TITLES}
          stepSubtitles={stepSubtitles}
          contextLabel="Candidate Registration"
          onStepClick={handleStepperClick}
        />

        {/* Steps */}
        <div
          ref={stepContentRef}
          tabIndex={-1}
          aria-live="polite"
          className="rounded-sm outline-none"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {step === 0 && (
                <StepIdentity
                  form={form}
                  onBack={goBack}
                  onNext={validateAndNext}
                />
              )}
              {step === 1 && (
                <StepPosition
                  form={form}
                  onBack={goBack}
                  onNext={validateAndNext}
                />
              )}
              {step === 2 && (
                <StepBoundary
                  form={form}
                  onBack={goBack}
                  onNext={validateAndNext}
                />
              )}
              {step === 3 && (
                <StepReview
                  form={form}
                  isSubmitting={createMutation.isPending}
                  onBack={goBack}
                  onSubmit={handleSubmit}
                  onEditStep={handleEditFromReview}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </form>

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
