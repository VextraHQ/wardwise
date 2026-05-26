"use client";

import { useEffect, useMemo, useState } from "react";
import { HiUser, HiPhone, HiUsers, HiCheckCircle } from "react-icons/hi";
import { motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";
import type { RegistrationFormData } from "@/features/collect/schemas/collect-schemas";
import { Input } from "@/components/ui/input";
import {
  ComboboxSelect,
  type ComboboxSelectOption,
} from "@/components/ui/combobox-select";
import { Separator } from "@/components/ui/separator";
import { normalizeNigerianPhoneInput } from "@/lib/schemas/field-schemas";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { RegistrationStepHeader } from "@/features/collect/components/public/registration-step-header";
import {
  CollectMobilePrivacyNote,
  FieldLabel,
  InputIcon,
  FieldError,
  NavButtons,
  SubmitError,
  StepCard,
  CardSectionHeader,
} from "@/features/collect/components/public/form-ui";
import { sanitizePhoneInputEvent } from "@/features/collect/lib/phone-input-utils";
import { cn } from "@/lib/utils";

type PreloadedCanvasser = { id: string; name: string; phone: string };

function normalizeCanvasserNameForMatch(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function CanvasserStep({
  form,
  hasCanvasser,
  setHasCanvasser,
  selectionError,
  isSubmitting,
  submitError,
  onBack,
  onNext,
  backLabel = "Back",
  nextLabel = "Continue",
  navMobileLayout = "inline",
  backVariant = "outline",
  nextDisabled,
  preloadedCanvassers = [],
}: {
  form: UseFormReturn<RegistrationFormData>;
  hasCanvasser: boolean | null;
  setHasCanvasser: (v: boolean | null) => void;
  selectionError?: string;
  isSubmitting: boolean;
  submitError?: string;
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  navMobileLayout?: "inline" | "stacked";
  backVariant?: "outline" | "ghost";
  nextDisabled?: boolean;
  preloadedCanvassers?: PreloadedCanvasser[];
}) {
  const {
    register,
    setValue,
    clearErrors,
    formState: { errors },
  } = form;
  const { watch } = form;

  const hasPreloaded = preloadedCanvassers.length > 0;
  const currentCanvasserName = watch("canvasserName")?.trim();
  const currentCanvasserPhone = watch("canvasserPhone")?.trim();
  const normalizedCurrentCanvasserName = normalizeCanvasserNameForMatch(
    currentCanvasserName,
  );
  const normalizedCurrentCanvasserPhone = normalizeNigerianPhoneInput(
    currentCanvasserPhone ?? "",
  );
  const [manualCanvasserEntry, setManualCanvasserEntry] = useState(false);
  const matchedCanvasser = useMemo(
    () =>
      preloadedCanvassers.find(
        (canvasser) =>
          normalizeCanvasserNameForMatch(canvasser.name) ===
            normalizedCurrentCanvasserName &&
          normalizeNigerianPhoneInput(canvasser.phone) ===
            normalizedCurrentCanvasserPhone,
      ) || null,
    [
      normalizedCurrentCanvasserName,
      normalizedCurrentCanvasserPhone,
      preloadedCanvassers,
    ],
  );
  const hasTypedCanvasserDetails =
    !!currentCanvasserName || !!currentCanvasserPhone;
  const isOther =
    !!hasCanvasser &&
    hasPreloaded &&
    (manualCanvasserEntry ||
      (!matchedCanvasser && hasTypedCanvasserDetails));
  const selectedCanvasserId = useMemo(() => {
    if (!hasCanvasser || preloadedCanvassers.length === 0) {
      return "";
    }

    if (manualCanvasserEntry || isOther) {
      return "__other__";
    }

    if (matchedCanvasser) {
      return matchedCanvasser.id;
    }

    return "";
  }, [
    hasCanvasser,
    isOther,
    manualCanvasserEntry,
    matchedCanvasser,
    preloadedCanvassers,
  ]);

  useEffect(() => {
    if (!hasCanvasser || !hasPreloaded) {
      setValue("selectedCampaignCanvasserId", undefined);
      return;
    }

    if (manualCanvasserEntry) {
      // "Other" stays a true typed-in/manual path even if the details happen
      // to match a saved canvasser later.
      setValue("selectedCampaignCanvasserId", undefined);
      return;
    }

    if (matchedCanvasser) {
      setValue("selectedCampaignCanvasserId", matchedCanvasser.id);
      return;
    }

    if (hasTypedCanvasserDetails) {
      setValue("selectedCampaignCanvasserId", undefined);
    }
  }, [
    hasCanvasser,
    hasPreloaded,
    hasTypedCanvasserDetails,
    manualCanvasserEntry,
    matchedCanvasser,
    setValue,
  ]);

  const canvasserOptions: ComboboxSelectOption[] = useMemo(
    () => [
      ...preloadedCanvassers.map((c) => ({
        value: c.id,
        label: `${c.name} — ${c.phone}`,
      })),
      { value: "__other__", label: "Other (not listed)" },
    ],
    [preloadedCanvassers],
  );

  const handleCanvasserSelect = (value: string) => {
    if (value === "__other__") {
      setManualCanvasserEntry(true);
      setValue("canvasserName", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("canvasserPhone", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("selectedCampaignCanvasserId", undefined);
      clearErrors(["canvasserName", "canvasserPhone"]);
      return;
    }

    setManualCanvasserEntry(false);

    if (!value) {
      setValue("canvasserName", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("canvasserPhone", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("selectedCampaignCanvasserId", undefined);
      return;
    }

    const canvasser = preloadedCanvassers.find((c) => c.id === value);
    if (canvasser) {
      setValue("canvasserName", canvasser.name, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("canvasserPhone", canvasser.phone, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("selectedCampaignCanvasserId", canvasser.id);
      clearErrors(["canvasserName", "canvasserPhone"]);
    }
  };

  return (
    <div className="space-y-6">
      <RegistrationStepHeader
        title="Canvasser Details"
        description="Were you referred by someone on the campaign team?"
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StepCard>
          <CardSectionHeader
            title="Canvasser Info"
            subtitle="Attribution"
            statusLabel="Optional"
            icon={<HiUsers className="size-4.5" />}
          />

          <div className="space-y-6">
            <div className="space-y-1.5">
              <FieldLabel>Were you referred by a canvasser?</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  role="radio"
                  aria-checked={hasCanvasser === true}
                  aria-label="Yes, I was referred by a canvasser"
                  onClick={() => setHasCanvasser(true)}
                  className={cn(
                    "border-border bg-card hover:border-primary/50 focus-visible:ring-primary flex cursor-pointer items-center justify-center gap-2 rounded-sm border-2 p-3 transition-all focus-visible:ring-2 focus-visible:outline-none",
                    hasCanvasser === true &&
                      "border-primary bg-primary/10 ring-primary/20 ring-2 ring-offset-1",
                  )}
                >
                  <span className="text-sm font-medium">Yes</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={hasCanvasser === false}
                  aria-label="No, I was not referred by a canvasser"
                  onClick={() => {
                    setHasCanvasser(false);
                    setManualCanvasserEntry(false);
                    setValue("canvasserName", "");
                    setValue("canvasserPhone", "");
                    setValue("selectedCampaignCanvasserId", undefined);
                  }}
                  className={cn(
                    "border-border bg-card hover:border-primary/50 focus-visible:ring-primary flex cursor-pointer items-center justify-center gap-2 rounded-sm border-2 p-3 transition-all focus-visible:ring-2 focus-visible:outline-none",
                    hasCanvasser === false &&
                      "border-primary bg-primary/10 ring-primary/20 ring-2 ring-offset-1",
                  )}
                >
                  <span className="text-sm font-medium">No</span>
                </button>
              </div>
              <FieldError error={selectionError} />
            </div>

            {hasCanvasser && hasPreloaded && (
              <div className="space-y-1.5">
                <FieldLabel>Select your canvasser</FieldLabel>
                <ComboboxSelect
                  options={canvasserOptions}
                  value={selectedCanvasserId}
                  onValueChange={handleCanvasserSelect}
                  placeholder="Search for your canvasser..."
                  searchPlaceholder="Type name or phone..."
                  emptyMessage="No matching canvasser found."
                  triggerClassName="border-border/60 bg-muted/5 h-12"
                />
              </div>
            )}

            {hasCanvasser && (!hasPreloaded || isOther) && (
              <div className="space-y-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <FieldLabel>Canvasser Name</FieldLabel>
                    <div className="relative">
                      <InputIcon>
                        <HiUser className="text-muted-foreground size-3.5" />
                      </InputIcon>
                      <Input
                        {...register("canvasserName")}
                        autoComplete="name"
                        placeholder="Canvasser's name"
                        className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-medium transition-all placeholder:text-xs"
                      />
                    </div>
                    <FieldError error={errors.canvasserName?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Canvasser Phone</FieldLabel>
                    <div className="relative">
                      <InputIcon>
                        <HiPhone className="text-muted-foreground size-3.5" />
                      </InputIcon>
                      <Input
                        {...register("canvasserPhone")}
                        placeholder="08012345678"
                        type="tel"
                        inputMode="tel"
                        pattern="[0-9+() .-]*"
                        autoComplete="tel"
                        onInput={sanitizePhoneInputEvent}
                        className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-mono font-medium tracking-wider transition-all placeholder:text-xs"
                      />
                    </div>
                    <FieldError error={errors.canvasserPhone?.message} />
                  </div>
                </div>

                {hasPreloaded && matchedCanvasser ? (
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    This matches{" "}
                    <span className="text-foreground font-medium">
                      {matchedCanvasser.name}
                    </span>{" "}
                    on the public form list, so it will be attributed to that
                    canvasser automatically.
                  </p>
                ) : null}
              </div>
            )}

            <Separator />

            <NavButtons
              onBack={onBack}
              onNext={onNext}
              backLabel={backLabel}
              nextLabel={nextLabel}
              mobileLayout={navMobileLayout}
              backVariant={backVariant}
              isLoading={isSubmitting}
              nextDisabled={nextDisabled}
            />

            <SubmitError error={submitError} />
          </div>
        </StepCard>
      </motion.div>

      <CollectMobilePrivacyNote />

      <TrustIndicators
        items={[
          { icon: <HiUsers />, label: "REFERRAL_FULLY_OPTIONAL" },
          { icon: <HiPhone />, label: "CANVASS_CONTACT_FIELD" },
          { icon: <HiCheckCircle />, label: "AUTHORIZED_FIELD_TEAM" },
        ]}
      />
    </div>
  );
}
