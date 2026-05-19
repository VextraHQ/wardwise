"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  useForm,
  useWatch,
  type UseFormReturn,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import {
  useCampaignLgas,
  useWards,
  usePollingUnits,
  useSubmitRegistration,
} from "@/features/collect/hooks/use-collect";
import { useCollectServiceWorker } from "@/features/collect/hooks/use-collect-service-worker";
import { useCollectFormPersistence } from "@/features/collect/hooks/use-collect-form-persistence";
import { useOffline } from "@/features/collect/hooks/use-offline";
import { useCollectOfflineGeo } from "@/features/collect/hooks/use-collect-offline-geo";
import { useCollectGeoResolution } from "@/features/collect/hooks/use-collect-geo-resolution";
import { useCollectSubmissionLifecycle } from "@/features/collect/hooks/use-collect-submission-lifecycle";
import {
  createAnalyticsId,
  getCollectErrorCategory,
  track,
} from "@/lib/analytics/client";
import { queueSubmission } from "@/features/collect/lib/offline-queue";
import {
  makeSubmitRegistrationSchema,
  type RegistrationFormData,
  type CollectVerificationRequirement,
} from "@/features/collect/schemas/collect-schemas";
import { CollectApiError } from "@/features/collect/api/collect-api";
import {
  COLLECT_CONFIRMATION_SCREEN,
  COLLECT_LAST_INPUT_SCREEN,
  COLLECT_STEP_KEYS,
  COLLECT_STEP_TITLES,
  COLLECT_TOTAL_SCREENS,
  getCollectProgressCurrentStep,
  getCollectScreenFromProgressStep,
  getCollectProgressStepTitles,
  getCollectProgressTotalSteps,
  getCollectScreenFields,
} from "@/features/collect/lib/step-flow";
import type { PublicCampaign } from "@/features/collect/types/collect.types";
import { generateRefCode } from "@/lib/utils";
import { StepProgress } from "@/components/ui/step-progress";
import { FormShell } from "@/features/collect/components/public/form-shell";
import { CampaignAvailabilityScreen } from "@/features/collect/components/public/campaign-availability-screen";
import { SplashScreen } from "@/features/collect/components/public/steps/splash-screen";
import { PersonalDetailsStep } from "@/features/collect/components/public/steps/personal-details-step";
import { LocationStep } from "@/features/collect/components/public/steps/location-step";
import { PartyInfoStep } from "@/features/collect/components/public/steps/party-info-step";
import { RoleStep } from "@/features/collect/components/public/steps/role-step";
import { CanvasserStep } from "@/features/collect/components/public/steps/canvasser-step";
import { ReviewStep } from "@/features/collect/components/public/steps/review-step";
import { CollectConnectivityBanner } from "@/features/collect/components/public/collect-connectivity-banner";
import { FailedReviewSheet } from "@/features/collect/components/public/failed-review-sheet";
import { OfflinePrepSheet } from "@/features/collect/components/public/offline-prep-sheet";
import { ConfirmationScreen } from "@/features/collect/components/public/steps/confirmation-screen";

type Props = { initialCampaign: PublicCampaign };

type ReviewEditSnapshot = {
  values: RegistrationFormData;
  hasCanvasser: boolean | null;
  occupationMode: "select" | "custom";
};

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
    identityType: undefined as unknown as RegistrationFormData["identityType"],
    identityValue: "",
    voterIdNumber: "",
    role: undefined as unknown as RegistrationFormData["role"],
    supportGroupName: "",
    wantsEmailReceipt: false,
    customAnswer1: "",
    customAnswer2: "",
    canvasserName: prefilledCanvasserName,
    canvasserPhone: prefilledCanvasserPhone,
  };
}

function focusFirstFieldError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<RegistrationFormData, any, any>,
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
  const [returnToReview, setReturnToReview] = useState(false);

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

  const formSchema = makeSubmitRegistrationSchema({
    identityRequirement: (campaign.identityRequirement ||
      "required") as CollectVerificationRequirement,
    voterIdRequirement: (campaign.voterIdRequirement ||
      "required") as CollectVerificationRequirement,
  });

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(formSchema) as Resolver<RegistrationFormData>,
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
  const reviewEditSnapshotRef = useRef<ReviewEditSnapshot | null>(null);

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
  const emailValue = useWatch({ control: form.control, name: "email" });
  const showReceiptOptIn =
    Boolean(campaign.receiptEmailAvailable) &&
    typeof emailValue === "string" &&
    emailValue.includes("@") &&
    emailValue.length > 3;
  const isEditingFromReview =
    returnToReview && screen > 0 && screen < COLLECT_LAST_INPUT_SCREEN;

  useEffect(() => {
    if (!showReceiptOptIn) {
      setValue("wantsEmailReceipt", false, { shouldDirty: false });
    }
  }, [setValue, showReceiptOptIn]);

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
        setReturnToReview(false);
        reviewEditSnapshotRef.current = null;
        track("collect_submission_succeeded", {
          ...submissionProperties,
          submission_source: "online",
        });
        setScreen(COLLECT_CONFIRMATION_SCREEN);
      },
      onError: (error) => {
        const msg = error.message || "";
        const reason =
          error instanceof CollectApiError ? error.reason : undefined;
        track("collect_submission_failed", {
          analytics_id: analyticsId,
          error_category: getCollectErrorCategory(msg),
          submission_source: "online",
          reason: reason ?? "unknown",
        });
        if (reason === "identity_required") {
          setScreen(3);
          form.setError("identityType", {
            message: "Please complete your identity verification.",
          });
          toast.error("Verification Required", {
            description:
              "This form now requires identity verification. Please fill in the fields.",
            duration: 6000,
          });
        } else if (reason === "identity_incomplete") {
          const identityType = form.getValues("identityType");
          const identityValue = form.getValues("identityValue")?.trim();
          const hasType = Boolean(identityType);
          const hasValue = Boolean(identityValue);

          setScreen(3);

          if (hasType && !hasValue) {
            form.setError("identityValue", {
              message:
                'Enter the number for the selected method, or use "Leave blank instead" to skip this optional section.',
            });
          } else if (!hasType && hasValue) {
            form.setError("identityType", {
              message:
                "Choose a verification method for this number, or clear it to skip this optional section.",
            });
          } else {
            form.setError("identityType", {
              message:
                'Complete this optional section, or use "Leave blank instead" to skip it.',
            });
          }

          toast.error("Complete this section or leave it blank", {
            description:
              'You selected a verification method. Enter the number, or use "Leave blank instead" to skip this optional section.',
            duration: 6000,
          });
        } else if (reason === "vin_required") {
          setScreen(3);
          form.setError("voterIdNumber", {
            message: "Voter ID (VIN) is required for this campaign.",
          });
          toast.error("Voter ID Required", {
            description: "This form now requires your Voter ID number.",
            duration: 6000,
          });
        } else if (reason === "invalid_vin_format") {
          setScreen(3);
          form.setError("voterIdNumber", {
            message:
              "Voter ID must be exactly 19 alphanumeric characters. Please check your PVC.",
          });
          toast.error("Invalid Voter ID", {
            description:
              "Please re-enter your Voter ID — it must be exactly 19 characters.",
            duration: 6000,
          });
        } else if (msg.includes("already registered")) {
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
    setReturnToReview(false);
    reviewEditSnapshotRef.current = null;
    lastTrackedStepRef.current = null;
    clearProgress();
  };

  const beginReviewEdit = (targetScreen: number) => {
    reviewEditSnapshotRef.current = {
      values: form.getValues(),
      hasCanvasser,
      occupationMode,
    };
    setReturnToReview(true);
    setScreen(targetScreen);
  };

  const finishReviewEdit = (targetScreen = COLLECT_LAST_INPUT_SCREEN) => {
    setReturnToReview(false);
    reviewEditSnapshotRef.current = null;
    setScreen(targetScreen);
  };

  const cancelReviewEdit = () => {
    const snapshot = reviewEditSnapshotRef.current;
    if (snapshot) {
      skipLocationResetRef.current = true;
      pendingRestoreRef.current = {
        wardId: snapshot.values.wardId,
        wardName: snapshot.values.wardName,
        pollingUnitId: snapshot.values.pollingUnitId,
        pollingUnitName: snapshot.values.pollingUnitName,
      };
      form.reset(snapshot.values);
      setHasCanvasser(snapshot.hasCanvasser);
      setOccupationMode(snapshot.occupationMode);
      window.setTimeout(() => {
        skipLocationResetRef.current = false;
      }, 0);
    }
    setCanvasserStepError("");
    setReturnToReview(false);
    reviewEditSnapshotRef.current = null;
    setScreen(COLLECT_LAST_INPUT_SCREEN);
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

    if (returnToReview && (screen === 1 || screen === 2 || screen === 3)) {
      finishReviewEdit();
      return;
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

      if (returnToReview) {
        finishReviewEdit();
        return;
      }
    }

    // Role step: if role is "canvasser", skip canvasser step and go straight to review
    if (screen === 4 && skipCanvasserStep) {
      setHasCanvasser(false);
      setValue("canvasserName", "");
      setValue("canvasserPhone", "");
      if (returnToReview) {
        finishReviewEdit();
        return;
      }
      setScreen(COLLECT_LAST_INPUT_SCREEN);
      return;
    }

    if (screen === 4 && returnToReview) {
      setScreen(5);
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
      if (isEditingFromReview) {
        cancelReviewEdit();
        return;
      }
      if (screen === COLLECT_LAST_INPUT_SCREEN && skipCanvasserStep) {
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
    setReturnToReview(false);
    reviewEditSnapshotRef.current = null;
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
    setReturnToReview(false);
    reviewEditSnapshotRef.current = null;
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
              // Step index is 0-based over the progress-bar slice. We map it
              // back to the actual screen index, collapsing the canvasser step
              // when the selected role skips it.
              const targetScreen = getCollectScreenFromProgressStep(
                index,
                skipCanvasserStep,
              );
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
            backLabel={isEditingFromReview ? "Return to review" : "Back"}
            nextLabel={isEditingFromReview ? "Save & return" : "Continue"}
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
            backLabel={isEditingFromReview ? "Return to review" : "Back"}
            nextLabel={isEditingFromReview ? "Save & return" : "Continue"}
          />
        )}

        {screen === 3 && (
          <PartyInfoStep
            party={campaign.party}
            form={form}
            onBack={goBack}
            onNext={validateAndNext}
            identityRequirement={
              (campaign.identityRequirement || "required") as
                | "required"
                | "optional"
            }
            voterIdRequirement={
              (campaign.voterIdRequirement || "required") as
                | "required"
                | "optional"
            }
            backLabel={isEditingFromReview ? "Return to review" : "Back"}
            nextLabel={isEditingFromReview ? "Save & return" : "Continue"}
          />
        )}

        {screen === 4 && (
          <RoleStep
            form={form}
            onBack={goBack}
            onNext={validateAndNext}
            supportGroupFieldMode={
              (campaign.supportGroupFieldMode || "off") as "off" | "optional"
            }
            supportGroupFieldLabel={campaign.supportGroupFieldLabel}
            backLabel={isEditingFromReview ? "Return to review" : "Back"}
            nextLabel={
              isEditingFromReview && skipCanvasserStep
                ? "Save & return"
                : "Continue"
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
            backLabel={isEditingFromReview ? "Return to review" : "Back"}
            nextLabel={isEditingFromReview ? "Save & return" : "Continue"}
            nextDisabled={hasCanvasser === null}
            preloadedCanvassers={campaign.campaignCanvassers}
          />
        )}

        {screen === COLLECT_LAST_INPUT_SCREEN && (
          <ReviewStep
            campaign={campaign}
            form={form}
            hasCanvasser={hasCanvasser}
            onBack={goBack}
            onSubmit={validateAndNext}
            onEditStep={beginReviewEdit}
            showReceiptOptIn={showReceiptOptIn}
            isSubmitting={submitMutation.isPending}
            submitError={submitMutation.error?.message}
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
