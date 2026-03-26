"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  submitRegistrationSchema,
  type RegistrationFormData,
} from "@/lib/schemas/collect-schemas";
import type { PublicCampaign } from "@/types/collect";
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
  const [screen, setScreen] = useState(0);
  const [submittedCount, setSubmittedCount] = useState<number | null>(null);
  const [hasCanvasser, setHasCanvasser] = useState<boolean | null>(null);
  const [occupationMode, setOccupationMode] = useState<"select" | "custom">(
    "select",
  );

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(submitRegistrationSchema),
    defaultValues: {
      fullName: "",
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
      canvasserName: searchParams.get("canvasser") || "",
      canvasserPhone: searchParams.get("cphone") || "",
    },
  });

  const { setValue, trigger } = form;
  const lgaId = useWatch({ control: form.control, name: "lgaId" });
  const wardId = useWatch({ control: form.control, name: "wardId" });

  // Geo dropdowns
  const { data: lgas = [] } = useCampaignLgas(campaign.slug);
  const { data: wards = [] } = useWards(lgaId);
  const { data: pollingUnits = [] } = usePollingUnits(wardId);

  // Reset cascading dropdowns
  useEffect(() => {
    setValue("wardId", undefined as unknown as number);
    setValue("wardName", "");
    setValue("pollingUnitId", undefined as unknown as number);
    setValue("pollingUnitName", "");
  }, [lgaId, setValue]);

  useEffect(() => {
    setValue("pollingUnitId", undefined as unknown as number);
    setValue("pollingUnitName", "");
  }, [wardId, setValue]);

  // Canvasser URL params
  useEffect(() => {
    const canvasserValue = searchParams.get("canvasser")?.trim();
    const cphone = searchParams.get("cphone")?.trim();
    if (canvasserValue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasCanvasser(true);
      setValue("canvasserName", canvasserValue);
    }
    if (cphone) setValue("canvasserPhone", cphone);
  }, [searchParams, setValue]);

  // localStorage persistence
  const storageKey = `collect-form-${campaign.slug}`;

  const saveProgress = useCallback(() => {
    if (typeof window === "undefined") return;
    const data = form.getValues();
    localStorage.setItem(storageKey, JSON.stringify({ screen, data }));
  }, [form, screen, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined" || screen === 0) return;
    saveProgress();
  }, [screen, saveProgress]);

  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  // Restore on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(storageKey);
    if (saved && screen === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasSavedProgress(true);
      try {
        const { screen: savedScreen } = JSON.parse(saved);
        if (savedScreen > 0) {
          // Don't auto-restore, just keep splash — user can click "Continue"
        }
      } catch {
        /* ignore */
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const restoreProgress = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { screen: savedScreen, data } = JSON.parse(saved);
        Object.entries(data).forEach(([key, value]) => {
          setValue(key as keyof RegistrationFormData, value as string | number);
        });
        setScreen(savedScreen);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  };

  const submitMutation = useSubmitRegistration();

  const screenFieldMap: Record<number, (keyof RegistrationFormData)[]> = {
    1: [
      "fullName",
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

  const validateAndNext = async () => {
    const fields = screenFieldMap[screen];
    if (fields) {
      const valid = await trigger(fields);
      if (!valid) return;
    }

    // Canvasser validation: if "Yes" selected, require both name and phone
    if (screen === 5 && hasCanvasser) {
      const trimmedName = form.getValues("canvasserName")?.trim();
      const trimmedPhone = form.getValues("canvasserPhone")?.trim();
      if (!trimmedName || !trimmedPhone) {
        if (!trimmedName)
          form.setError("canvasserName", {
            message: "Canvasser name is required",
          });
        if (!trimmedPhone)
          form.setError("canvasserPhone", {
            message: "Canvasser phone is required",
          });
        return;
      }
    }

    // Submit on the last input screen (canvasser = screen before confirmation)
    if (screen === TOTAL_SCREENS - 2) {
      saveProgress();
      const values = form.getValues();
      submitMutation.mutate(
        { ...values, campaignSlug: campaign.slug },
        {
          onSuccess: (result) => {
            setSubmittedCount(result.count);
            localStorage.removeItem(storageKey);
            setScreen(screen + 1);
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
        },
      );
      return;
    }

    setScreen(screen + 1);
  };

  const goBack = () => {
    if (screen > 0) setScreen(screen - 1);
  };

  const handleNewRegistration = () => {
    form.reset();
    setScreen(0);
    setSubmittedCount(null);
    setHasCanvasser(null);
    setOccupationMode("select");
    localStorage.removeItem(storageKey);
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
      {/* Progress Bar — hide on splash and confirmation */}
      {screen > 0 && screen < TOTAL_SCREENS - 1 && (
        <StepProgress
          currentStep={screen}
          totalSteps={TOTAL_SCREENS - 2}
          stepTitle={STEP_TITLES[screen] || ""}
          className="mb-6"
        />
      )}

      {screen === 0 && (
        <SplashScreen
          campaign={campaign}
          hasSavedProgress={hasSavedProgress}
          onStart={() => setScreen(1)}
          onRestore={restoreProgress}
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
          onBack={goBack}
          onNext={validateAndNext}
        />
      )}

      {screen === 3 && (
        <PartyInfoStep form={form} onBack={goBack} onNext={validateAndNext} />
      )}

      {screen === 4 && (
        <RoleStep form={form} onBack={goBack} onNext={validateAndNext} />
      )}

      {screen === 5 && (
        <CanvasserStep
          form={form}
          hasCanvasser={hasCanvasser}
          setHasCanvasser={setHasCanvasser}
          isSubmitting={submitMutation.isPending}
          submitError={submitMutation.error?.message}
          onBack={goBack}
          onNext={validateAndNext}
        />
      )}

      {screen === 6 && (
        <ConfirmationScreen
          campaign={campaign}
          submittedCount={submittedCount}
          onNewRegistration={handleNewRegistration}
        />
      )}
    </FormShell>
  );
}
