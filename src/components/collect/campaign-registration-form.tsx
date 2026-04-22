"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  useCampaignLgas,
  useWards,
  usePollingUnits,
  useSubmitRegistration,
} from "@/hooks/use-collect";
import { useCollectServiceWorker } from "@/hooks/use-collect-service-worker";
import { useCollectFormPersistence } from "@/hooks/use-collect-form-persistence";
import { useOffline } from "@/hooks/use-offline";
import {
  createAnalyticsId,
  getCollectErrorCategory,
  track,
} from "@/lib/analytics/client";
import { getFailedSubmissionById, queueSubmission } from "@/lib/offline-queue";
import {
  submitRegistrationSchema,
  type RegistrationFormData,
} from "@/lib/schemas/collect-schemas";
import type { PublicCampaign } from "@/types/collect";
import { composeFullName, generateRefCode } from "@/lib/utils";
import { StepProgress } from "@/components/ui/step-progress";
import { FormShell } from "@/components/collect/form-shell";
import { SplashScreen } from "@/components/collect/steps/splash-screen";
import { PersonalDetailsStep } from "@/components/collect/steps/personal-details-step";
import { LocationStep } from "@/components/collect/steps/location-step";
import { PartyInfoStep } from "@/components/collect/steps/party-info-step";
import { RoleStep } from "@/components/collect/steps/role-step";
import { CanvasserStep } from "@/components/collect/steps/canvasser-step";
import { FailedReviewSheet } from "@/components/collect/failed-review-sheet";
import { ConfirmationScreen } from "@/components/collect/steps/confirmation-screen";
import { StepCard, CardSectionHeader } from "@/components/collect/form-ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = { initialCampaign: PublicCampaign };

const STEP_TITLES = [
  "Welcome",
  "Personal Details",
  "Location",
  "Party Information",
  "Your Role",
  "Canvasser",
  "Confirmation",
];

const STEP_KEYS = [
  "welcome",
  "personal_details",
  "location",
  "party_information",
  "role",
  "canvasser",
  "confirmation",
] as const;

function focusFirstFieldError(
  form: UseFormReturn<RegistrationFormData>,
  fields: (keyof RegistrationFormData)[],
) {
  const errs = form.formState.errors;
  for (const f of fields) {
    if (!errs[f]) continue;
    void form.setFocus(f);
    window.requestAnimationFrame(() => {
      document.activeElement?.scrollIntoView?.({
        behavior: "smooth",
        block: "center",
      });
    });
    return;
  }
}

// Party info is always shown now (APC/NIN + VIN are required)
const TOTAL_SCREENS = 7; // 0=splash, 1=personal, 2=location, 3=party, 4=role, 5=canvasser, 6=confirmation

export function CampaignRegistrationForm({ initialCampaign }: Props) {
  const campaign = initialCampaign;
  const searchParams = useSearchParams();
  const prefilledCanvasserName = searchParams.get("canvasser")?.trim() || "";
  const prefilledCanvasserPhone = searchParams.get("cphone")?.trim() || "";
  const [screen, setScreen] = useState(0);
  const [submittedCount, setSubmittedCount] = useState<number | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [hasCanvasser, setHasCanvasser] = useState<boolean | null>(
    prefilledCanvasserName ? true : null,
  );
  const [canvasserStepError, setCanvasserStepError] = useState<string>("");
  const [syncSource, setSyncSource] = useState<"automatic" | "manual">(
    "automatic",
  );
  const [occupationMode, setOccupationMode] = useState<"select" | "custom">(
    "select",
  );
  const [validationFlashNonce, setValidationFlashNonce] = useState(0);
  const [queuedAnalyticsId, setQueuedAnalyticsId] = useState<string | null>(
    null,
  );
  const [queuedSyncError, setQueuedSyncError] = useState<string | null>(null);
  const [failedReviewOpen, setFailedReviewOpen] = useState(false);
  const failedRehydrateAppliedRef = useRef(false);

  const {
    isOffline,
    pendingCount,
    failedCount,
    isSyncing,
    trySync,
    refreshQueueCounts,
    clearFailedSubmissions,
    listFailedSubmissions,
    dismissFailedSubmission,
    lastSyncResult,
    clearLastSyncResult,
  } = useOffline();

  const clearActiveFailedPointer = useCallback(() => {
    try {
      localStorage.removeItem(`collect-active-failed-${campaign.slug}`);
    } catch {
      /* ignore */
    }
  }, [campaign.slug]);

  const clearFailedNotices = useCallback(async () => {
    track("collect_failed_notice_dismissed", {
      cleared_count: failedCount,
    });
    await clearFailedSubmissions();
    clearActiveFailedPointer();
    setQueuedSyncError(null);
  }, [failedCount, clearFailedSubmissions, clearActiveFailedPointer]);

  const handleDismissFailedRow = useCallback(
    async (id: number) => {
      await dismissFailedSubmission(id);
      try {
        const raw = localStorage.getItem(
          `collect-active-failed-${campaign.slug}`,
        );
        const parsed = raw ? (JSON.parse(raw) as { id?: unknown }) : null;
        if (parsed?.id === id) {
          localStorage.removeItem(`collect-active-failed-${campaign.slug}`);
          setQueuedSyncError(null);
        }
      } catch {
        /* ignore */
      }
    },
    [campaign.slug, dismissFailedSubmission],
  );

  useEffect(() => {
    failedRehydrateAppliedRef.current = false;
    if (typeof window === "undefined") return;
    const key = `collect-active-failed-${campaign.slug}`;
    let cancelled = false;
    void (async () => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const parsed = JSON.parse(raw) as { id?: unknown };
        if (typeof parsed.id !== "number") return;
        const row = await getFailedSubmissionById(parsed.id);
        if (cancelled) return;
        if (!row) {
          try {
            localStorage.removeItem(key);
          } catch {
            /* ignore */
          }
          return;
        }
        const err =
          row.lastError ?? "This registration was not added to the campaign.";
        queueMicrotask(() => {
          if (failedRehydrateAppliedRef.current) return;
          failedRehydrateAppliedRef.current = true;
          setQueuedSyncError(err);
          setQueuedAnalyticsId(null);
          setSubmittedCount(null);
          setSubmissionId(null);
          setScreen(TOTAL_SCREENS - 1);
          track("collect_failed_active_rehydrated", {
            has_last_error: Boolean(row.lastError),
            error_category: getCollectErrorCategory(row.lastError ?? err),
          });
        });
      } catch {
        /* ignore corrupt pointer */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaign.slug]);

  // Register / manage service worker lifecycle
  useCollectServiceWorker();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(submitRegistrationSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      phone: "",
      email: "",
      sex: undefined,
      age: undefined as unknown as number,
      occupation: "",
      maritalStatus: undefined,
      lgaId: undefined as unknown as number,
      lgaName: "",
      wardId: undefined as unknown as number,
      wardName: "",
      pollingUnitId: undefined as unknown as number,
      pollingUnitName: "",
      apcRegNumber: "",
      voterIdNumber: "",
      role: undefined,
      customAnswer1: "",
      customAnswer2: "",
      canvasserName: prefilledCanvasserName,
      canvasserPhone: prefilledCanvasserPhone,
    },
  });

  // Surface auto-sync results (from reconnect) as toasts; flip queued confirmation when this submission syncs
  useEffect(() => {
    if (!lastSyncResult) return;

    // Match any queued->confirmed flip first so we can tell the failed branch
    // below whether this specific record already transitioned to confirmed.
    let flippedToConfirmed = false;
    if (
      screen === TOTAL_SCREENS - 1 &&
      submittedCount === null &&
      queuedAnalyticsId &&
      lastSyncResult.syncedEntries.length > 0
    ) {
      const match = lastSyncResult.syncedEntries.find(
        (e) => e.analyticsId === queuedAnalyticsId,
      );
      if (match) {
        flippedToConfirmed = true;
        const submissionId = match.submissionId;
        const count = match.count;
        const slug = campaign.slug;
        const formValues = form.getValues();
        queueMicrotask(() => {
          setSubmittedCount(count);
          setSubmissionId(submissionId);
          setQueuedAnalyticsId(null);
          try {
            localStorage.removeItem(`collect-active-failed-${slug}`);
          } catch {
            /* ignore */
          }

          const refCode = generateRefCode(submissionId);
          localStorage.setItem(
            `collect-submitted-${slug}`,
            JSON.stringify({
              name: composeFullName(formValues),
              count,
              submittedAt: new Date().toISOString(),
              refCode,
            }),
          );
        });
      }
    }

    // Flip the active queued confirmation to "failed" when the currently-shown
    // submission was permanently rejected by the server during this sync.
    const activeFailedMatch =
      screen === TOTAL_SCREENS - 1 &&
      submittedCount === null &&
      queuedAnalyticsId &&
      !flippedToConfirmed
        ? lastSyncResult.failed.find((e) => e.analyticsId === queuedAnalyticsId)
        : undefined;
    if (activeFailedMatch) {
      const errorMessage = activeFailedMatch.error;
      const failedRowId = activeFailedMatch.id;
      queueMicrotask(() => {
        setQueuedSyncError(errorMessage);
        setQueuedAnalyticsId(null);
        try {
          localStorage.setItem(
            `collect-active-failed-${campaign.slug}`,
            JSON.stringify({ id: failedRowId }),
          );
        } catch {
          /* ignore */
        }
      });
    }

    track("collect_sync_completed", {
      source: syncSource,
      synced_count: lastSyncResult.synced,
      failed_count: lastSyncResult.failed.length,
    });

    for (const entry of lastSyncResult.syncedEntries) {
      track("collect_submission_succeeded", {
        analytics_id: entry.analyticsId,
        submission_source: "offline_queue",
      });
    }

    for (const entry of lastSyncResult.failed) {
      track("collect_submission_failed", {
        analytics_id: entry.analyticsId,
        error_category: getCollectErrorCategory(entry.error),
        submission_source: "offline_queue",
      });
    }

    if (lastSyncResult.synced > 0) {
      toast.success(`${lastSyncResult.synced} submission(s) synced`);
    }
    for (const f of lastSyncResult.failed) {
      // Suppress the toast for the entry already rendered inline as "failed"
      // so we don't double-notify for the same record.
      if (activeFailedMatch && f.id === activeFailedMatch.id) continue;
      toast.error("Queued submission rejected", {
        description: f.error,
        duration: 8000,
      });
    }
    window.setTimeout(() => {
      setSyncSource("automatic");
    }, 0);
    clearLastSyncResult();
  }, [
    clearLastSyncResult,
    lastSyncResult,
    syncSource,
    screen,
    submittedCount,
    queuedAnalyticsId,
    campaign.slug,
    form,
  ]);

  const { setValue, trigger } = form;
  const lgaId = useWatch({ control: form.control, name: "lgaId" });
  const wardId = useWatch({ control: form.control, name: "wardId" });
  const skipLocationResetRef = useRef(false);
  const lastTrackedStepRef = useRef<string | null>(null);

  // Holds pending location values that need to be re-applied once query data loads
  const pendingRestoreRef = useRef<{
    wardId?: number;
    wardName?: string;
    pollingUnitId?: number;
    pollingUnitName?: string;
  } | null>(null);

  // ── Form persistence ──
  const {
    hasSavedProgress,
    deviceSubmission,
    restoreProgress,
    saveProgress,
    clearProgress,
  } = useCollectFormPersistence({
    form,
    campaignSlug: campaign.slug,
    screen,
    totalScreens: TOTAL_SCREENS,
    uiState: { hasCanvasser, occupationMode },
    skipLocationResetRef,
    pendingRestoreRef,
    setHasCanvasser,
    setOccupationMode,
    setScreen,
  });

  // Geo dropdowns
  const {
    data: lgas = [],
    isLoading: lgasLoading,
    isError: lgasError,
  } = useCampaignLgas(campaign.slug);
  const {
    data: wards = [],
    isLoading: wardsLoading,
    isError: wardsError,
  } = useWards(lgaId);
  const {
    data: pollingUnits = [],
    isLoading: unitsLoading,
    isError: unitsError,
  } = usePollingUnits(wardId);

  // Reset cascading dropdowns (skip during restore)
  useEffect(() => {
    if (skipLocationResetRef.current) return;
    setValue("wardId", undefined as unknown as number);
    setValue("wardName", "");
    setValue("pollingUnitId", undefined as unknown as number);
    setValue("pollingUnitName", "");
  }, [lgaId, setValue]);

  useEffect(() => {
    if (skipLocationResetRef.current) return;
    setValue("pollingUnitId", undefined as unknown as number);
    setValue("pollingUnitName", "");
  }, [wardId, setValue]);

  // Re-apply saved ward once wards query finishes loading
  useEffect(() => {
    if (!pendingRestoreRef.current) return;
    if (wardsLoading || !wards.length) return;
    const pending = pendingRestoreRef.current;
    if (pending.wardId && wards.some((w) => w.id === pending.wardId)) {
      skipLocationResetRef.current = true;
      setValue("wardId", pending.wardId);
      setValue("wardName", pending.wardName || "");
      // Keep pending for pollingUnit — it will be set by the next effect
      // but remove the ward part so this effect doesn't re-fire
      pendingRestoreRef.current = {
        pollingUnitId: pending.pollingUnitId,
        pollingUnitName: pending.pollingUnitName,
      };
      // Release the skip guard after React processes the setValue
      window.setTimeout(() => {
        skipLocationResetRef.current = false;
      }, 0);
    }
  }, [wards, wardsLoading, setValue]);

  // Re-apply saved polling unit once pollingUnits query finishes loading
  useEffect(() => {
    if (!pendingRestoreRef.current) return;
    if (unitsLoading || !pollingUnits.length) return;
    const pending = pendingRestoreRef.current;
    if (
      pending.pollingUnitId &&
      pollingUnits.some((p) => p.id === pending.pollingUnitId)
    ) {
      setValue("pollingUnitId", pending.pollingUnitId);
      setValue("pollingUnitName", pending.pollingUnitName || "");
      pendingRestoreRef.current = null; // fully restored
    }
  }, [pollingUnits, unitsLoading, setValue]);

  // Canvasser URL params
  useEffect(() => {
    if (prefilledCanvasserName) {
      setValue("canvasserName", prefilledCanvasserName);
    }
    if (prefilledCanvasserPhone)
      setValue("canvasserPhone", prefilledCanvasserPhone);
  }, [prefilledCanvasserName, prefilledCanvasserPhone, setValue]);

  const submitMutation = useSubmitRegistration();

  const screenFieldMap: Record<number, (keyof RegistrationFormData)[]> = {
    1: [
      "firstName",
      "middleName",
      "lastName",
      "phone",
      "email",
      "sex",
      "age",
      "occupation",
      "maritalStatus",
    ],
    2: [
      "lgaId",
      "lgaName",
      "wardId",
      "wardName",
      "pollingUnitId",
      "pollingUnitName",
    ],
    3: ["apcRegNumber", "voterIdNumber"],
    4: ["role"],
    5: ["canvasserName", "canvasserPhone"],
  };

  const role = useWatch({ control: form.control, name: "role" });
  const skipCanvasserStep = role === "canvasser";

  useEffect(() => {
    if (screen <= 0 || screen >= TOTAL_SCREENS - 1) return;

    const stepViewKey = `${screen}:${skipCanvasserStep ? "skip" : "full"}`;
    if (lastTrackedStepRef.current === stepViewKey) return;

    track("collect_step_viewed", {
      step_index: screen,
      step_key: STEP_KEYS[screen],
      skips_canvasser_step: skipCanvasserStep,
    });
    lastTrackedStepRef.current = stepViewKey;
  }, [screen, skipCanvasserStep]);

  useEffect(() => {
    const onPageHide = () => {
      if (screen <= 0 || screen >= TOTAL_SCREENS - 1) return;
      track("collect_flow_abandoned", {
        step_index: screen,
        step_key: STEP_KEYS[screen] ?? "unknown",
      });
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [screen]);

  const doSubmit = async () => {
    const values = form.getValues();
    const analyticsId = createAnalyticsId();
    saveProgress(values);
    const payload = { ...values, campaignSlug: campaign.slug };
    const submissionProperties = {
      analytics_id: analyticsId,
      has_canvasser: Boolean(values.canvasserName || values.canvasserPhone),
      has_custom_questions: Boolean(
        campaign.customQuestion1 || campaign.customQuestion2,
      ),
      role: values.role,
    };

    // Offline: queue in IndexedDB
    if (isOffline) {
      try {
        await queueSubmission(payload, { analyticsId });
        await refreshQueueCounts();
        clearProgress();
        track("collect_submission_queued_offline", submissionProperties);
        toast.success("Saved offline", {
          description:
            "Your registration will be submitted automatically when you reconnect.",
        });
        setQueuedAnalyticsId(analyticsId);
        setScreen(TOTAL_SCREENS - 1);
      } catch {
        toast.error("Failed to save offline");
      }
      return;
    }

    const submitStarted = performance.now();
    submitMutation.reset();

    submitMutation.mutate(payload, {
      onSuccess: (result) => {
        const elapsed = performance.now() - submitStarted;
        if (elapsed > 8000) {
          track("collect_submit_slow", {
            duration_ms: Math.round(elapsed),
          });
        }
        setSubmittedCount(result.count);
        setSubmissionId(result.submission.id);
        clearProgress();
        track("collect_submission_succeeded", {
          ...submissionProperties,
          submission_source: "online",
        });

        // Persist submission for returning visitor recognition
        const refCode = generateRefCode(result.submission.id);
        localStorage.setItem(
          `collect-submitted-${campaign.slug}`,
          JSON.stringify({
            name: composeFullName(form.getValues()),
            count: result.count,
            submittedAt: new Date().toISOString(),
            refCode,
          }),
        );

        setScreen(TOTAL_SCREENS - 1); // confirmation
      },
      onError: (error) => {
        const msg = error.message || "";
        track("collect_submission_failed", {
          analytics_id: analyticsId,
          error_category: getCollectErrorCategory(msg),
          submission_source: "online",
        });
        if (msg.includes("already registered")) {
          toast.error("Duplicate Registration", {
            description:
              "This phone number or VIN has already been registered for this campaign.",
            duration: 6000,
          });
        } else {
          toast.error("Submission Failed", {
            description: msg || "Please try again.",
          });
        }
      },
    });
  };

  const resetToFreshRegistration = (nextScreen = 1) => {
    form.reset({
      firstName: "",
      middleName: "",
      lastName: "",
      phone: "",
      email: "",
      sex: undefined as unknown as "male" | "female",
      age: undefined as unknown as number,
      occupation: "",
      maritalStatus: undefined as unknown as
        | "single"
        | "married"
        | "divorced"
        | "widowed",
      lgaId: undefined as unknown as number,
      lgaName: "",
      wardId: undefined as unknown as number,
      wardName: "",
      pollingUnitId: undefined as unknown as number,
      pollingUnitName: "",
      apcRegNumber: "",
      voterIdNumber: "",
      role: undefined as unknown as "volunteer" | "member" | "canvasser",
      customAnswer1: "",
      customAnswer2: "",
      canvasserName: prefilledCanvasserName,
      canvasserPhone: prefilledCanvasserPhone,
    });
    setScreen(nextScreen);
    setSubmittedCount(null);
    setSubmissionId(null);
    setQueuedAnalyticsId(null);
    setQueuedSyncError(null);
    clearActiveFailedPointer();
    setHasCanvasser(prefilledCanvasserName ? true : null);
    setCanvasserStepError("");
    setOccupationMode("select");
    lastTrackedStepRef.current = null;
    clearProgress();
  };

  const handleCopyLastReference = async () => {
    if (!deviceSubmission?.refCode) return;

    try {
      await navigator.clipboard.writeText(deviceSubmission.refCode);
      toast.success("Reference code copied");
    } catch {
      toast.error("Could not copy reference code");
    }
  };

  const recordValidationFailure = (failedFieldKeys: string[]) => {
    track("collect_validation_failed", {
      step_index: screen,
      step_key: STEP_KEYS[screen] ?? "unknown",
      failed_fields: failedFieldKeys.slice(0, 24).join(","),
      failed_count: failedFieldKeys.length,
    });
    setValidationFlashNonce((n) => n + 1);
  };

  const validateAndNext = async () => {
    const fields = screenFieldMap[screen];
    if (fields) {
      const valid = await trigger(fields);
      if (!valid) {
        const errs = form.formState.errors;
        const failed = fields.filter((f) => Boolean(errs[f]));
        recordValidationFailure(failed.map(String));
        focusFirstFieldError(form, fields);
        return;
      }
    }

    // Extra guardrail: ComboboxSelect fields set via setValue may not
    // trigger zod's min(1) rule properly through trigger() alone.
    // Explicitly check required select-based fields for each screen.
    if (screen === 1) {
      const vals = form.getValues();
      if (!vals.occupation || vals.occupation.trim() === "") {
        form.setError("occupation", { message: "Occupation is required" });
        recordValidationFailure(["occupation"]);
        focusFirstFieldError(form, screenFieldMap[1]);
        return;
      }
      if (!vals.sex) {
        form.setError("sex", { message: "Please select your sex" });
        recordValidationFailure(["sex"]);
        focusFirstFieldError(form, screenFieldMap[1]);
        return;
      }
      if (!vals.maritalStatus) {
        form.setError("maritalStatus", { message: "Select marital status" });
        recordValidationFailure(["maritalStatus"]);
        focusFirstFieldError(form, screenFieldMap[1]);
        return;
      }
    }

    if (screen === 2) {
      const vals = form.getValues();
      if (!vals.lgaId) {
        form.setError("lgaId", { message: "Select your LGA" });
        recordValidationFailure(["lgaId"]);
        focusFirstFieldError(form, screenFieldMap[2]);
        return;
      }
      if (!vals.wardId) {
        form.setError("wardId", { message: "Select your ward" });
        recordValidationFailure(["wardId"]);
        focusFirstFieldError(form, screenFieldMap[2]);
        return;
      }
      if (!vals.pollingUnitId) {
        form.setError("pollingUnitId", { message: "Select your polling unit" });
        recordValidationFailure(["pollingUnitId"]);
        focusFirstFieldError(form, screenFieldMap[2]);
        return;
      }
    }

    // Canvasser validation: if "Yes" selected, require both name and phone
    if (screen === 5) {
      if (hasCanvasser === null) {
        setCanvasserStepError("Please select Yes or No before submitting.");
        recordValidationFailure(["canvasser_yes_no"]);
        return;
      }

      setCanvasserStepError("");

      if (!hasCanvasser) {
        setValue("canvasserName", "");
        setValue("canvasserPhone", "");
      } else {
        const trimmedName = form.getValues("canvasserName")?.trim();
        const trimmedPhone = form.getValues("canvasserPhone")?.trim();

        if (!trimmedName || !trimmedPhone) {
          if (campaign.campaignCanvassers?.length) {
            setCanvasserStepError(
              "Please choose a canvasser or select Other (not listed).",
            );
          }

          if (!trimmedName) {
            form.setError("canvasserName", {
              message: "Canvasser name is required",
            });
          }
          if (!trimmedPhone) {
            form.setError("canvasserPhone", {
              message: "Canvasser phone is required",
            });
          }
          const failed: string[] = [];
          if (!trimmedName) failed.push("canvasserName");
          if (!trimmedPhone) failed.push("canvasserPhone");
          recordValidationFailure(failed);
          focusFirstFieldError(form, ["canvasserName", "canvasserPhone"]);
          return;
        }
      }
    }

    // Role step: if role is "canvasser", skip canvasser step and submit directly
    if (screen === 4 && skipCanvasserStep) {
      setHasCanvasser(false);
      setValue("canvasserName", "");
      setValue("canvasserPhone", "");
      doSubmit();
      return;
    }

    // Submit on the last input screen (canvasser = screen before confirmation)
    if (screen === TOTAL_SCREENS - 2) {
      doSubmit();
      return;
    }

    setScreen(screen + 1);
  };

  const goBack = () => {
    if (screen > 0) {
      // Skip canvasser step when going back from confirmation
      if (screen === TOTAL_SCREENS - 1 && skipCanvasserStep) {
        setScreen(4); // go back to role step
        return;
      }
      setScreen(screen - 1);
    }
  };

  const handleNewRegistration = () => {
    resetToFreshRegistration(1);
  };

  const handleStart = () => {
    track("collect_started", {
      source: "new",
      has_saved_progress: hasSavedProgress,
      has_prefilled_canvasser: Boolean(prefilledCanvasserName),
    });
    lastTrackedStepRef.current = null;
    setScreen(1);
  };

  const handleStartFresh = () => {
    track("collect_started", {
      source: "fresh",
      has_saved_progress: hasSavedProgress,
      has_prefilled_canvasser: Boolean(prefilledCanvasserName),
    });
    resetToFreshRegistration(1);
  };

  const handleRestoreProgress = () => {
    track("collect_progress_restored", {
      has_saved_progress: hasSavedProgress,
    });
    lastTrackedStepRef.current = null;
    restoreProgress();
  };

  // Paused/Closed states
  if (campaign.status === "paused") {
    return (
      <FormShell campaign={campaign}>
        <div className="w-full">
          <StepCard>
            <CardSectionHeader
              title="System Paused"
              subtitle="Registration Protocol"
              statusLabel="Offline"
              icon={<div className="h-2 w-2 rounded-full bg-orange-500" />}
            />
            <div className="space-y-4 py-8 text-center">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                <div className="h-4 w-4 animate-pulse rounded-full bg-orange-500" />
              </div>
              <h2 className="text-foreground text-xl font-bold tracking-tight">
                Registration Currently Paused
              </h2>
              <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                This registration campaign is currently on hold. Field
                operations have been temporarily suspended. Please check back
                later.
              </p>
            </div>
          </StepCard>
        </div>
      </FormShell>
    );
  }

  if (campaign.status === "closed") {
    return (
      <FormShell campaign={campaign}>
        <div className="w-full">
          <StepCard>
            <CardSectionHeader
              title="Campaign Concluded"
              subtitle="Registration Protocol"
              statusLabel="Terminated"
              icon={<div className="bg-destructive h-2 w-2 rounded-full" />}
            />
            <div className="space-y-4 py-8 text-center">
              <div className="bg-destructive/10 mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full">
                <div className="bg-destructive h-4 w-4 rounded-full" />
              </div>
              <h2 className="text-foreground text-xl font-bold tracking-tight">
                Registration Closed
              </h2>
              <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                This registration campaign has successfully ended its collection
                phase. Thank you to all field operators and supporters.
              </p>
            </div>
          </StepCard>
        </div>
      </FormShell>
    );
  }

  return (
    <FormShell campaign={campaign}>
      <div>
        {/* Persistent failed queue banner — survives reloads via IndexedDB */}
        {failedCount > 0 && (
          <div
            role="alert"
            className="mb-4 flex flex-col gap-3 overflow-hidden rounded-sm border border-dashed border-red-500/30 bg-red-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="size-1.5 shrink-0 rounded-full bg-red-500" />
                <p className="font-mono text-[10px] font-bold tracking-widest text-red-700 uppercase dark:text-red-400">
                  Needs Attention
                </p>
              </div>
              <p className="text-muted-foreground text-xs">
                {failedCount === 1
                  ? "1 registration needs attention. It was not uploaded. Start a fresh registration with corrected details."
                  : `${failedCount} registrations were not uploaded. Start fresh registrations with corrected details.`}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => {
                  track("collect_failed_review_opened", {
                    failed_count: failedCount,
                  });
                  setFailedReviewOpen(true);
                }}
                className="flex h-8 shrink-0 items-center justify-center rounded-sm border border-red-500/30 bg-red-500/10 px-3 font-mono text-[10px] font-bold tracking-widest text-red-700 uppercase transition-colors hover:bg-red-500/20 dark:text-red-400"
              >
                Review
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="flex h-8 shrink-0 items-center justify-center rounded-sm border border-red-500/30 bg-red-500/10 px-3 font-mono text-[10px] font-bold tracking-widest text-red-700 uppercase transition-colors hover:bg-red-500/20 dark:text-red-400"
                  >
                    Clear failed notice
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Clear failed upload notices?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This clears failed local upload records from this device.
                      It does not delete any submitted campaign record.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep notices</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => void clearFailedNotices()}
                    >
                      Clear notices
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
        {/* Offline / Sync banners */}
        {isOffline && (
          <div className="mb-4 overflow-hidden rounded-sm border border-dashed border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="size-1.5 shrink-0 animate-pulse rounded-full bg-amber-500" />
              <p className="font-mono text-[10px] font-bold tracking-widest text-amber-700 uppercase dark:text-amber-400">
                Connection Lost
              </p>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              You're currently offline. Any submissions will be secured locally
              and queued for when you reconnect.
            </p>
          </div>
        )}
        {!isOffline && pendingCount > 0 && (
          <div className="mb-4 flex flex-col justify-between gap-3 overflow-hidden rounded-sm border border-dashed border-emerald-500/30 bg-emerald-500/5 px-4 py-3 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                <p className="font-mono text-[10px] font-bold tracking-widest text-emerald-700 uppercase dark:text-emerald-400">
                  Ready to Sync
                </p>
              </div>
              <p className="text-muted-foreground text-xs">
                {pendingCount} offline submission{pendingCount !== 1 ? "s" : ""}{" "}
                waiting to be uploaded.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                track("collect_sync_requested", {
                  pending_count: pendingCount,
                  source: "manual",
                });
                setSyncSource("manual");
                const result = await trySync();
                if (result) {
                  if (result.synced > 0) {
                    toast.success(`${result.synced} submission(s) synced`);
                  }
                  for (const f of result.failed) {
                    toast.error("Submission rejected", {
                      description: f.error,
                      duration: 8000,
                    });
                  }
                }
              }}
              disabled={isSyncing}
              className="flex h-8 items-center justify-center rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-3 font-mono text-[10px] font-bold tracking-widest text-emerald-700 uppercase transition-colors hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-400"
            >
              {isSyncing ? "Syncing..." : "Sync Now"}
            </button>
          </div>
        )}

        {/* Progress Bar — hide on splash and confirmation */}
        {screen > 0 && screen < TOTAL_SCREENS - 1 && (
          <StepProgress
            currentStep={skipCanvasserStep && screen > 4 ? screen - 1 : screen}
            totalSteps={TOTAL_SCREENS - 2 - (skipCanvasserStep ? 1 : 0)}
            stepTitle={STEP_TITLES[screen] || ""}
            stepTitles={
              skipCanvasserStep
                ? STEP_TITLES.slice(1, 5)
                : STEP_TITLES.slice(1, 6)
            }
            onStepClick={(index) => {
              // StepProgress only invokes this for completed segments.
              // Step index is 0-based over the progress-bar slice; +1 maps
              // it back to the form's screen index (since screen 0 is the
              // splash which the bar never represents).
              const targetScreen = index + 1;
              if (targetScreen < screen) setScreen(targetScreen);
            }}
            validationFlashNonce={validationFlashNonce}
            className="mb-6"
          />
        )}

        {screen === 0 && (
          <SplashScreen
            campaign={campaign}
            hasSavedProgress={hasSavedProgress}
            deviceSubmission={deviceSubmission}
            onStart={handleStart}
            onStartFresh={handleStartFresh}
            onRestore={handleRestoreProgress}
            onCopyReference={handleCopyLastReference}
          />
        )}

        {screen === 1 && (
          <PersonalDetailsStep
            form={form}
            campaign={campaign}
            occupationMode={occupationMode}
            setOccupationMode={setOccupationMode}
            onBack={goBack}
            onNext={validateAndNext}
          />
        )}

        {screen === 2 && (
          <LocationStep
            form={form}
            lgas={lgas}
            wards={wards}
            pollingUnits={pollingUnits}
            lgasLoading={lgasLoading}
            wardsLoading={wardsLoading}
            unitsLoading={unitsLoading}
            lgasError={lgasError}
            wardsError={wardsError}
            unitsError={unitsError}
            onBack={goBack}
            onNext={validateAndNext}
          />
        )}

        {screen === 3 && (
          <PartyInfoStep form={form} onBack={goBack} onNext={validateAndNext} />
        )}

        {screen === 4 && (
          <RoleStep
            form={form}
            onBack={goBack}
            onNext={validateAndNext}
            isSubmitting={skipCanvasserStep && submitMutation.isPending}
            submitError={
              skipCanvasserStep ? submitMutation.error?.message : undefined
            }
          />
        )}

        {screen === 5 && (
          <CanvasserStep
            form={form}
            hasCanvasser={hasCanvasser}
            setHasCanvasser={(value) => {
              setHasCanvasser(value);
              setCanvasserStepError("");
            }}
            selectionError={canvasserStepError}
            isSubmitting={submitMutation.isPending}
            submitError={submitMutation.error?.message}
            onBack={goBack}
            onNext={validateAndNext}
            nextDisabled={hasCanvasser === null}
            preloadedCanvassers={campaign.campaignCanvassers}
          />
        )}

        {screen === 6 &&
          (submittedCount !== null && submissionId !== null ? (
            <ConfirmationScreen
              state="confirmed"
              campaign={campaign}
              submittedCount={submittedCount}
              refCode={generateRefCode(submissionId)}
              onNewRegistration={handleNewRegistration}
            />
          ) : queuedSyncError !== null ? (
            <ConfirmationScreen
              state="failed"
              campaign={campaign}
              error={queuedSyncError}
              onNewRegistration={handleNewRegistration}
            />
          ) : (
            <ConfirmationScreen
              state="queued"
              campaign={campaign}
              pendingCount={pendingCount}
              isOnline={!isOffline}
              isSyncing={isSyncing}
              onSyncNow={async () => {
                track("collect_sync_requested", {
                  pending_count: pendingCount,
                  source: "manual",
                });
                setSyncSource("manual");
                await trySync();
              }}
              onNewRegistration={handleNewRegistration}
            />
          ))}

        <FailedReviewSheet
          open={failedReviewOpen}
          onOpenChange={setFailedReviewOpen}
          failedCount={failedCount}
          listFailedSubmissions={listFailedSubmissions}
          onDismissRow={handleDismissFailedRow}
          onBulkClear={clearFailedNotices}
        />
      </div>
    </FormShell>
  );
}
