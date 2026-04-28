"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import {
  useCampaignLgas,
  useWards,
  usePollingUnits,
  useSubmitRegistration,
} from "@/hooks/use-collect";
import { useCollectServiceWorker } from "@/hooks/use-collect-service-worker";
import { useCollectFormPersistence } from "@/hooks/use-collect-form-persistence";
import { useOffline } from "@/hooks/use-offline";
import { useCollectOfflineGeo } from "@/hooks/use-collect-offline-geo";
import { useCollectGeoResolution } from "@/hooks/use-collect-geo-resolution";
import { useCollectSubmissionLifecycle } from "@/hooks/use-collect-submission-lifecycle";
import {
  createAnalyticsId,
  getCollectErrorCategory,
  track,
} from "@/lib/analytics/client";
import { queueSubmission } from "@/lib/offline-queue";
import {
  submitRegistrationSchema,
  type RegistrationFormData,
} from "@/lib/schemas/collect-schemas";
import {
  COLLECT_CONFIRMATION_SCREEN,
  COLLECT_LAST_INPUT_SCREEN,
  COLLECT_STEP_KEYS,
  COLLECT_STEP_TITLES,
  COLLECT_TOTAL_SCREENS,
  getCollectProgressCurrentStep,
  getCollectProgressStepTitles,
  getCollectProgressTotalSteps,
  getCollectScreenFields,
} from "@/lib/collect/step-flow";
import type { PublicCampaign } from "@/types/collect";
import { generateRefCode } from "@/lib/utils";
import { StepProgress } from "@/components/ui/step-progress";
import { FormShell } from "@/components/collect/form-shell";
import { CampaignAvailabilityScreen } from "@/components/collect/campaign-availability-screen";
import { SplashScreen } from "@/components/collect/steps/splash-screen";
import { PersonalDetailsStep } from "@/components/collect/steps/personal-details-step";
import { LocationStep } from "@/components/collect/steps/location-step";
import { PartyInfoStep } from "@/components/collect/steps/party-info-step";
import { RoleStep } from "@/components/collect/steps/role-step";
import { CanvasserStep } from "@/components/collect/steps/canvasser-step";
import { CollectConnectivityBanner } from "@/components/collect/collect-connectivity-banner";
import { FailedReviewSheet } from "@/components/collect/failed-review-sheet";
import { OfflinePrepSheet } from "@/components/collect/offline-prep-sheet";
import { ConfirmationScreen } from "@/components/collect/steps/confirmation-screen";

type Props = { initialCampaign: PublicCampaign };

function createCollectDefaultValues({
  prefilledCanvasserName,
  prefilledCanvasserPhone,
}: {
  prefilledCanvasserName: string;
  prefilledCanvasserPhone: string;
}): RegistrationFormData {
  return {
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    email: "",
    sex: undefined as unknown as RegistrationFormData["sex"],
    age: undefined as unknown as number,
    occupation: "",
    maritalStatus:
      undefined as unknown as RegistrationFormData["maritalStatus"],
    lgaId: undefined as unknown as number,
    lgaName: "",
    wardId: undefined as unknown as number,
    wardName: "",
    pollingUnitId: undefined as unknown as number,
    pollingUnitName: "",
    apcRegNumber: "",
    voterIdNumber: "",
    role: undefined as unknown as RegistrationFormData["role"],
    customAnswer1: "",
    customAnswer2: "",
    canvasserName: prefilledCanvasserName,
    canvasserPhone: prefilledCanvasserPhone,
  };
}

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

export function CampaignRegistrationForm({ initialCampaign }: Props) {
  const campaign = initialCampaign;
  const searchParams = useSearchParams();
  const prefilledCanvasserName = searchParams.get("canvasser")?.trim() || "";
  const prefilledCanvasserPhone = searchParams.get("cphone")?.trim() || "";
  const [screen, setScreen] = useState(0);
  const [hasCanvasser, setHasCanvasser] = useState<boolean | null>(
    prefilledCanvasserName ? true : null,
  );
  const [canvasserStepError, setCanvasserStepError] = useState<string>("");
  const [occupationMode, setOccupationMode] = useState<"select" | "custom">(
    "select",
  );
  const [validationFlashNonce, setValidationFlashNonce] = useState(0);
  const [failedReviewOpen, setFailedReviewOpen] = useState(false);
  const [offlinePrepOpen, setOfflinePrepOpen] = useState(false);

  const offlineGeo = useCollectOfflineGeo(campaign);

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

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(submitRegistrationSchema),
    defaultValues: createCollectDefaultValues({
      prefilledCanvasserName,
      prefilledCanvasserPhone,
    }),
  });

  const {
    submittedCount,
    submissionId,
    queuedSyncError,
    clearQueuedFailureState,
    markManualSyncRequested,
    resetSubmissionState,
    showConfirmedSubmission,
    showQueuedSubmission,
  } = useCollectSubmissionLifecycle({
    campaignSlug: campaign.slug,
    form,
    screen,
    confirmationScreen: COLLECT_CONFIRMATION_SCREEN,
    lastSyncResult,
    clearLastSyncResult,
    onShowConfirmationScreen: () => setScreen(COLLECT_CONFIRMATION_SCREEN),
  });

  const clearFailedNotices = useCallback(async () => {
    track("collect_failed_notice_dismissed", {
      cleared_count: failedCount,
    });
    await clearFailedSubmissions();
    clearQueuedFailureState();
  }, [clearFailedSubmissions, clearQueuedFailureState, failedCount]);

  const handleOpenFailedReview = () => {
    track("collect_failed_review_opened", {
      failed_count: failedCount,
    });
    setFailedReviewOpen(true);
  };

  const handleSyncNow = useCallback(() => {
    void (async () => {
      track("collect_sync_requested", {
        pending_count: pendingCount,
        source: "manual",
      });
      markManualSyncRequested();
      await trySync();
    })();
  }, [markManualSyncRequested, pendingCount, trySync]);

  const handleDismissFailedRow = useCallback(
    async (id: number) => {
      await dismissFailedSubmission(id);
      try {
        const raw = localStorage.getItem(
          `collect-active-failed-${campaign.slug}`,
        );
        const parsed = raw ? (JSON.parse(raw) as { id?: unknown }) : null;
        if (parsed?.id === id) {
          clearQueuedFailureState();
        }
      } catch {
        /* ignore */
      }
    },
    [campaign.slug, dismissFailedSubmission, clearQueuedFailureState],
  );

  // Register / manage service worker lifecycle
  useCollectServiceWorker();

  // Lifecycle cleanup: if this campaign is closed and we have a stored
  // offline pack, drop it on next online open. Last-known data is fine for
  // but the splash screen shouldn't keep showing "offline ready" for a campaign that's done.
  const closedCleanupRef = useRef(false);
  useEffect(() => {
    if (closedCleanupRef.current) return;
    if (isOffline) return;
    if (campaign.status !== "closed") return;
    if (!offlineGeo.isPrepared) return;
    closedCleanupRef.current = true;
    void offlineGeo.clear();
  }, [campaign.status, isOffline, offlineGeo]);

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
    totalScreens: COLLECT_TOTAL_SCREENS,
    uiState: { hasCanvasser, occupationMode },
    skipLocationResetRef,
    pendingRestoreRef,
    setHasCanvasser,
    setOccupationMode,
    setScreen,
  });

  // Geo dropdowns (live queries — actual data source resolution happens in
  // useCollectGeoResolution below, which decides between live and pack data).
  const {
    data: lgas = [],
    isLoading: lgasLoading,
    isError: lgasError,
    refetch: refetchLgas,
  } = useCampaignLgas(campaign.slug);
  const {
    data: wards = [],
    isLoading: wardsLoading,
    isError: wardsError,
    refetch: refetchWards,
  } = useWards(lgaId);
  const {
    data: pollingUnits = [],
    isLoading: unitsLoading,
    isError: unitsError,
    refetch: refetchUnits,
  } = usePollingUnits(wardId);

  const geo = useCollectGeoResolution({
    lgaId,
    wardId,
    isOffline,
    offlineGeo,
    liveLgas: lgas,
    liveWards: wards,
    livePollingUnits: pollingUnits,
    liveLgasLoading: lgasLoading,
    liveWardsLoading: wardsLoading,
    liveUnitsLoading: unitsLoading,
    liveLgasError: lgasError,
    liveWardsError: wardsError,
    liveUnitsError: unitsError,
    refetchLgas: () => void refetchLgas(),
    refetchWards: () => void refetchWards(),
    refetchUnits: () => void refetchUnits(),
  });

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

  // Re-apply saved ward once data is available — from the live query OR
  // the offline pack, whichever resolves first.
  useEffect(() => {
    if (!pendingRestoreRef.current) return;
    if (!geo.resolvedWards.length) return;
    const pending = pendingRestoreRef.current;
    if (
      pending.wardId &&
      geo.resolvedWards.some((w) => w.id === pending.wardId)
    ) {
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
  }, [geo.resolvedWards, setValue]);

  // Re-apply saved polling unit once data is available.
  useEffect(() => {
    if (!pendingRestoreRef.current) return;
    if (!geo.resolvedPollingUnits.length) return;
    const pending = pendingRestoreRef.current;
    if (
      pending.pollingUnitId &&
      geo.resolvedPollingUnits.some((p) => p.id === pending.pollingUnitId)
    ) {
      setValue("pollingUnitId", pending.pollingUnitId);
      setValue("pollingUnitName", pending.pollingUnitName || "");
      pendingRestoreRef.current = null; // fully restored
    }
  }, [geo.resolvedPollingUnits, setValue]);

  // Canvasser URL params
  useEffect(() => {
    if (prefilledCanvasserName) {
      setValue("canvasserName", prefilledCanvasserName);
    }
    if (prefilledCanvasserPhone)
      setValue("canvasserPhone", prefilledCanvasserPhone);
  }, [prefilledCanvasserName, prefilledCanvasserPhone, setValue]);

  const submitMutation = useSubmitRegistration();

  const role = useWatch({ control: form.control, name: "role" });
  const skipCanvasserStep = role === "canvasser";

  useEffect(() => {
    if (screen <= 0 || screen >= COLLECT_CONFIRMATION_SCREEN) return;

    const stepViewKey = `${screen}:${skipCanvasserStep ? "skip" : "full"}`;
    if (lastTrackedStepRef.current === stepViewKey) return;

    track("collect_step_viewed", {
      step_index: screen,
      step_key: COLLECT_STEP_KEYS[screen],
      skips_canvasser_step: skipCanvasserStep,
    });
    lastTrackedStepRef.current = stepViewKey;
  }, [screen, skipCanvasserStep]);

  useEffect(() => {
    const onPageHide = () => {
      if (screen <= 0 || screen >= COLLECT_CONFIRMATION_SCREEN) return;
      track("collect_flow_abandoned", {
        step_index: screen,
        step_key: COLLECT_STEP_KEYS[screen] ?? "unknown",
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
        showQueuedSubmission(analyticsId);
        setScreen(COLLECT_CONFIRMATION_SCREEN);
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
        showConfirmedSubmission(result.submission.id, result.count);
        clearProgress();
        track("collect_submission_succeeded", {
          ...submissionProperties,
          submission_source: "online",
        });
        setScreen(COLLECT_CONFIRMATION_SCREEN);
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
    form.reset(
      createCollectDefaultValues({
        prefilledCanvasserName,
        prefilledCanvasserPhone,
      }),
    );
    setScreen(nextScreen);
    resetSubmissionState();
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
      step_key: COLLECT_STEP_KEYS[screen] ?? "unknown",
      failed_fields: failedFieldKeys.slice(0, 24).join(","),
      failed_count: failedFieldKeys.length,
    });
    setValidationFlashNonce((n) => n + 1);
  };

  const validateAndNext = async () => {
    const fields = getCollectScreenFields(screen);
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

    if (screen === 1) {
      const vals = form.getValues();
      if (!vals.occupation || vals.occupation.trim() === "") {
        form.setError("occupation", { message: "Occupation is required" });
        recordValidationFailure(["occupation"]);
        focusFirstFieldError(form, getCollectScreenFields(1) ?? []);
        return;
      }
      if (!vals.sex) {
        form.setError("sex", { message: "Please select your sex" });
        recordValidationFailure(["sex"]);
        focusFirstFieldError(form, getCollectScreenFields(1) ?? []);
        return;
      }
      if (!vals.maritalStatus) {
        form.setError("maritalStatus", { message: "Select marital status" });
        recordValidationFailure(["maritalStatus"]);
        focusFirstFieldError(form, getCollectScreenFields(1) ?? []);
        return;
      }
    }

    if (screen === 2) {
      const vals = form.getValues();
      if (!vals.lgaId) {
        form.setError("lgaId", { message: "Select your LGA" });
        recordValidationFailure(["lgaId"]);
        focusFirstFieldError(form, getCollectScreenFields(2) ?? []);
        return;
      }
      if (!vals.wardId) {
        form.setError("wardId", { message: "Select your ward" });
        recordValidationFailure(["wardId"]);
        focusFirstFieldError(form, getCollectScreenFields(2) ?? []);
        return;
      }
      if (!vals.pollingUnitId) {
        form.setError("pollingUnitId", { message: "Select your polling unit" });
        recordValidationFailure(["pollingUnitId"]);
        focusFirstFieldError(form, getCollectScreenFields(2) ?? []);
        return;
      }
    }

    // Canvasser validation: if "Yes" selected, require both name and phone
    if (screen === 5) {
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
    if (screen === COLLECT_LAST_INPUT_SCREEN) {
      doSubmit();
      return;
    }

    setScreen(screen + 1);
  };

  const goBack = () => {
    if (screen > 0) {
      // Skip canvasser step when going back from confirmation
      if (screen === COLLECT_CONFIRMATION_SCREEN && skipCanvasserStep) {
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

  if (campaign.status === "paused" || campaign.status === "closed") {
    return (
      <CampaignAvailabilityScreen
        campaign={campaign}
        status={campaign.status}
      />
    );
  }

  return (
    <FormShell
      campaign={campaign}
      statusBanner={
        <CollectConnectivityBanner
          isOffline={isOffline}
          pendingCount={pendingCount}
          isSyncing={isSyncing}
          needsRefresh={offlineGeo.health === "scope_invalid"}
          onSyncNow={handleSyncNow}
        />
      }
      headerActions={
        failedCount > 0 ? (
          <button
            type="button"
            onClick={handleOpenFailedReview}
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-red-500/25 bg-red-500/6 px-2.5 text-left text-red-700 transition-colors hover:bg-red-500/10 sm:px-3 dark:text-red-300"
            aria-label="Review saved registrations that need attention"
          >
            <AlertTriangle className="size-4 shrink-0" />
            <span className="hidden text-[11px] font-bold tracking-wide sm:inline">
              Needs attention
            </span>
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-current/10 px-1.5 py-0.5 text-[10px] leading-none font-black">
              {failedCount}
            </span>
          </button>
        ) : undefined
      }
    >
      <div>
        {/* Progress Bar — hide on splash and confirmation */}
        {screen > 0 && screen < COLLECT_CONFIRMATION_SCREEN && (
          <StepProgress
            currentStep={getCollectProgressCurrentStep(
              screen,
              skipCanvasserStep,
            )}
            totalSteps={getCollectProgressTotalSteps(skipCanvasserStep)}
            stepTitle={COLLECT_STEP_TITLES[screen] || ""}
            stepTitles={getCollectProgressStepTitles(skipCanvasserStep)}
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
            offlineHealth={offlineGeo.health}
            isOffline={isOffline}
            preparedLgaCount={offlineGeo.preparedLgaIds.length}
            preparedAt={offlineGeo.preparedAt}
            onStart={handleStart}
            onStartFresh={handleStartFresh}
            onRestore={handleRestoreProgress}
            onCopyReference={handleCopyLastReference}
            onOpenPrepSheet={() => setOfflinePrepOpen(true)}
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
            lgas={geo.resolvedLgas}
            wards={geo.resolvedWards}
            pollingUnits={geo.resolvedPollingUnits}
            lgasLoading={geo.lgasLoading}
            wardsLoading={geo.wardsLoading}
            unitsLoading={geo.unitsLoading}
            lgasError={geo.lgasError}
            wardsError={geo.wardsError}
            unitsError={geo.unitsError}
            usingLocalData={geo.usingLocalData}
            isOffline={isOffline}
            offlineBlockReason={geo.offlineBlockReason}
            onRetry={geo.retryGeo}
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

        {screen === COLLECT_CONFIRMATION_SCREEN &&
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
              onSyncNow={handleSyncNow}
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

        <OfflinePrepSheet
          open={offlinePrepOpen}
          onOpenChange={setOfflinePrepOpen}
          campaignSlug={campaign.slug}
          preparedLgaIds={offlineGeo.preparedLgaIds}
          isPreparing={offlineGeo.isPreparing}
          hasExistingPack={offlineGeo.isPrepared}
          isOffline={isOffline}
          onPrepare={offlineGeo.prepare}
          onClear={offlineGeo.clear}
        />
      </div>
    </FormShell>
  );
}
