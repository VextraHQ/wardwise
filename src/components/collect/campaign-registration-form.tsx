"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { queueSubmission } from "@/lib/offline-queue";
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
import { ConfirmationScreen } from "@/components/collect/steps/confirmation-screen";
import { StepCard, CardSectionHeader } from "@/components/collect/form-ui";

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
  const [occupationMode, setOccupationMode] = useState<"select" | "custom">(
    "select",
  );

  const {
    isOffline,
    pendingCount,
    isSyncing,
    trySync,
    refreshPendingCount,
    lastSyncResult,
    clearLastSyncResult,
  } = useOffline();

  // Register / manage service worker lifecycle
  useCollectServiceWorker();

  // Surface auto-sync results (from reconnect) as toasts
  useEffect(() => {
    if (!lastSyncResult) return;
    if (lastSyncResult.synced > 0) {
      toast.success(`${lastSyncResult.synced} submission(s) synced`);
    }
    for (const f of lastSyncResult.failed) {
      toast.error("Queued submission rejected", {
        description: f.error,
        duration: 8000,
      });
    }
    clearLastSyncResult();
  }, [lastSyncResult, clearLastSyncResult]);

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

  const { setValue, trigger } = form;
  const lgaId = useWatch({ control: form.control, name: "lgaId" });
  const wardId = useWatch({ control: form.control, name: "wardId" });
  const skipLocationResetRef = useRef(false);

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

  const doSubmit = async () => {
    const values = form.getValues();
    saveProgress(values);
    const payload = { ...values, campaignSlug: campaign.slug };

    // Offline: queue in IndexedDB
    if (isOffline) {
      try {
        await queueSubmission(payload);
        await refreshPendingCount();
        clearProgress();
        toast.success("Saved offline", {
          description:
            "Your registration will be submitted automatically when you reconnect.",
        });
        setScreen(TOTAL_SCREENS - 1);
      } catch {
        toast.error("Failed to save offline");
      }
      return;
    }

    submitMutation.mutate(payload, {
      onSuccess: (result) => {
        setSubmittedCount(result.count);
        setSubmissionId(result.submission.id);
        clearProgress();

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
    setHasCanvasser(prefilledCanvasserName ? true : null);
    setCanvasserStepError("");
    setOccupationMode("select");
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

  const validateAndNext = async () => {
    const fields = screenFieldMap[screen];
    if (fields) {
      const valid = await trigger(fields);
      if (!valid) return;
    }

    // Extra guardrail: ComboboxSelect fields set via setValue may not
    // trigger zod's min(1) rule properly through trigger() alone.
    // Explicitly check required select-based fields for each screen.
    if (screen === 1) {
      const vals = form.getValues();
      if (!vals.occupation || vals.occupation.trim() === "") {
        form.setError("occupation", { message: "Occupation is required" });
        return;
      }
      if (!vals.sex) {
        form.setError("sex", { message: "Please select your sex" });
        return;
      }
      if (!vals.maritalStatus) {
        form.setError("maritalStatus", { message: "Select marital status" });
        return;
      }
    }

    if (screen === 2) {
      const vals = form.getValues();
      if (!vals.lgaId) {
        form.setError("lgaId", { message: "Select your LGA" });
        return;
      }
      if (!vals.wardId) {
        form.setError("wardId", { message: "Select your ward" });
        return;
      }
      if (!vals.pollingUnitId) {
        form.setError("pollingUnitId", { message: "Select your polling unit" });
        return;
      }
    }

    // Canvasser validation: if "Yes" selected, require both name and phone
    if (screen === 5) {
      if (hasCanvasser === null) {
        setCanvasserStepError("Please select Yes or No before submitting.");
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
      {/* Offline / Sync banners */}
      {isOffline && (
        <div className="mb-4 overflow-hidden rounded-sm border border-amber-500/30 border-dashed bg-amber-500/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="size-1.5 animate-pulse rounded-full bg-amber-500 shrink-0" />
            <p className="text-amber-700 dark:text-amber-400 font-mono text-[10px] font-bold tracking-widest uppercase">
              Connection Lost
            </p>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            You're currently offline. Any submissions will be secured locally and queued for when you reconnect.
          </p>
        </div>
      )}
      {!isOffline && pendingCount > 0 && (
        <div className="mb-4 flex flex-col justify-between gap-3 overflow-hidden rounded-sm border border-emerald-500/30 border-dashed bg-emerald-500/5 px-4 py-3 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
              <p className="text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold tracking-widest uppercase">
                Ready to Sync
              </p>
            </div>
            <p className="text-muted-foreground text-xs">
              {pendingCount} offline submission{pendingCount !== 1 ? "s" : ""} waiting to be uploaded.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
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
          className="mb-6"
        />
      )}

      {screen === 0 && (
        <SplashScreen
          campaign={campaign}
          hasSavedProgress={hasSavedProgress}
          deviceSubmission={deviceSubmission}
          onStart={() => setScreen(1)}
          onStartFresh={() => resetToFreshRegistration(1)}
          onRestore={restoreProgress}
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

      {screen === 6 && (
        <>
          {submittedCount === null && (
            <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
              <p className="font-bold">Saved offline</p>
              <p className="mt-1 text-xs">
                Your registration has been queued and will be submitted
                automatically when you reconnect to the internet.
              </p>
            </div>
          )}
          <ConfirmationScreen
            campaign={campaign}
            submittedCount={submittedCount}
            refCode={submissionId ? generateRefCode(submissionId) : null}
            onNewRegistration={handleNewRegistration}
          />
        </>
      )}
    </FormShell>
  );
}
