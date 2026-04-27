"use client";

import { HiLocationMarker, HiShieldCheck } from "react-icons/hi";
import { CloudOff, MapPin, RefreshCw, WifiOff } from "lucide-react";
import { motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";
import type { RegistrationFormData } from "@/lib/schemas/collect-schemas";
import type { GeoLga, GeoWard, GeoPollingUnit } from "@/types/collect";
import { Separator } from "@/components/ui/separator";
import {
  ComboboxSelect,
  type ComboboxSelectOption,
} from "@/components/ui/combobox-select";
import { RegistrationStepHeader } from "@/components/collect/registration-step-header";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import {
  CollectMobilePrivacyNote,
  FieldLabel,
  FieldError,
  NavButtons,
  StepCard,
  CardSectionHeader,
} from "@/components/collect/form-ui";
import { formatGeoDisplayName } from "@/lib/geo/display";

export function LocationStep({
  form,
  lgas,
  wards,
  pollingUnits,
  lgasLoading = false,
  wardsLoading = false,
  unitsLoading = false,
  lgasError = false,
  wardsError = false,
  unitsError = false,
  usingLocalData = false,
  isOffline = false,
  offlineBlockReason = null,
  onRetry,
  onBack,
  onNext,
}: {
  form: UseFormReturn<RegistrationFormData>;
  lgas: GeoLga[];
  wards: GeoWard[];
  pollingUnits: GeoPollingUnit[];
  lgasLoading?: boolean;
  wardsLoading?: boolean;
  unitsLoading?: boolean;
  lgasError?: boolean;
  wardsError?: boolean;
  unitsError?: boolean;
  usingLocalData?: boolean;
  isOffline?: boolean;
  offlineBlockReason?: "no-pack" | "scope-invalid" | null;
  onRetry?: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = form;
  const lgaId = watch("lgaId");
  const wardId = watch("wardId");

  const lgaOptions: ComboboxSelectOption[] = lgas.map((l) => ({
    value: String(l.id),
    label: formatGeoDisplayName(l.name),
  }));

  const wardOptions: ComboboxSelectOption[] = wards.map((w) => ({
    value: String(w.id),
    label: formatGeoDisplayName(w.name),
  }));

  const puOptions: ComboboxSelectOption[] = pollingUnits.map((p) => ({
    value: String(p.id),
    label: p.code
      ? `${p.code.padStart(3, "0")} - ${formatGeoDisplayName(p.name)}`
      : formatGeoDisplayName(p.name),
  }));

  if (offlineBlockReason) {
    const isScopeInvalid = offlineBlockReason === "scope-invalid";
    const blockTitle = isScopeInvalid
      ? "Saved areas need a refresh"
      : "Offline Setup Required";
    const blockHeading = isScopeInvalid
      ? "Your offline data is no longer valid for this campaign"
      : "Polling unit data is not available offline";
    const blockBody = isScopeInvalid
      ? "One or more LGAs you saved have been confirmed out of scope for this campaign. Reconnect to the internet and refresh your offline data before continuing — submissions made offline against these areas will be rejected when they sync."
      : "You're offline and no LGA, ward, or polling unit data has been saved on this device. Reconnect to the internet, or open this campaign again with network and prepare offline data first.";
    const tone = isScopeInvalid
      ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
      : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";

    return (
      <div className="space-y-6">
        <RegistrationStepHeader
          icon={MapPin}
          badge="Finding Your Location"
          title="Where Do You Vote?"
          description="Help us find your exact polling unit location"
        />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StepCard>
            <CardSectionHeader
              title={blockTitle}
              subtitle="Location Finder"
              statusLabel="Offline"
              icon={
                isScopeInvalid ? (
                  <RefreshCw className="size-4.5" />
                ) : (
                  <CloudOff className="size-4.5" />
                )
              }
            />
            <div className="space-y-4 py-6 text-center">
              <div
                className={`mx-auto flex size-12 items-center justify-center rounded-full border ${tone}`}
              >
                {isScopeInvalid ? (
                  <RefreshCw className="size-5" />
                ) : (
                  <WifiOff className="size-5" />
                )}
              </div>
              <h3 className="text-foreground text-base font-semibold">
                {blockHeading}
              </h3>
              <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
                {blockBody}
              </p>
              <Separator className="my-4" />
              <NavButtons onBack={onBack} onNext={onNext} nextDisabled />
            </div>
          </StepCard>
        </motion.div>

        <CollectMobilePrivacyNote />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RegistrationStepHeader
        icon={MapPin}
        badge="Finding Your Location"
        title="Where Do You Vote?"
        description="Help us find your exact polling unit location"
      />

      {usingLocalData ? (
        isOffline ? (
          // Happy path: user is offline by design and has a prepared pack.
          // Calm note, no Retry — refetching can't succeed while offline.
          <div className="mx-auto flex items-start gap-2 overflow-hidden rounded-sm border border-dashed border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <CloudOff className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-0.5">
              <p className="font-mono text-[10px] font-bold tracking-widest text-emerald-700 uppercase dark:text-emerald-400">
                Using offline data
              </p>
              <p className="text-muted-foreground text-xs">
                Showing locations from the offline pack saved on this device.
              </p>
            </div>
          </div>
        ) : (
          // Online but the live geo query failed — fall back to pack with a
          // visible warning + retry. This is the unhappy path.
          <div className="mx-auto flex flex-col gap-2 overflow-hidden rounded-sm border border-dashed border-amber-500/30 bg-amber-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              <RefreshCw className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-0.5">
                <p className="font-mono text-[10px] font-bold tracking-widest text-amber-700 uppercase dark:text-amber-400">
                  Network issue — using saved data
                </p>
                <p className="text-muted-foreground text-xs">
                  Showing locations from your offline pack while we
                  couldn&apos;t reach the server.
                </p>
              </div>
            </div>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 self-start rounded-sm border border-amber-500/30 bg-amber-500/10 px-3 font-mono text-[10px] font-bold tracking-widest text-amber-700 uppercase transition-colors hover:bg-amber-500/20 sm:self-center dark:text-amber-400"
              >
                <RefreshCw className="size-3" />
                Retry
              </button>
            ) : null}
          </div>
        )
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StepCard>
          <CardSectionHeader
            title="Polling Unit Location"
            subtitle="Location Finder"
            statusLabel="Active"
            icon={<HiLocationMarker className="size-4.5" />}
          />

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <FieldLabel>Local Government Area (LGA)</FieldLabel>
                <ComboboxSelect
                  options={lgaOptions}
                  value={lgaId ? String(lgaId) : ""}
                  onValueChange={(v) => {
                    const id = parseInt(v, 10);
                    const lga = lgas.find((l) => l.id === id);
                    setValue("lgaId", id);
                    setValue("lgaName", lga?.name || "");
                  }}
                  placeholder="Select LGA"
                  searchPlaceholder="Search LGAs..."
                  emptyMessage={
                    lgasError
                      ? "Failed to load LGAs. Please refresh the page."
                      : "No LGAs found."
                  }
                  isLoading={lgasLoading}
                />
                <FieldError error={errors.lgaId?.message} />
              </div>

              <div className="space-y-1.5">
                <FieldLabel>Ward</FieldLabel>
                <ComboboxSelect
                  options={wardOptions}
                  value={wardId ? String(wardId) : ""}
                  onValueChange={(v) => {
                    const id = parseInt(v, 10);
                    const ward = wards.find((w) => w.id === id);
                    setValue("wardId", id);
                    setValue("wardName", ward?.name || "");
                  }}
                  placeholder={lgaId ? "Select Ward" : "Select LGA first"}
                  searchPlaceholder="Search wards..."
                  emptyMessage={
                    wardsError
                      ? "Failed to load wards. Please try again."
                      : "No wards found."
                  }
                  disabled={!lgaId}
                  isLoading={wardsLoading}
                />
                <FieldError error={errors.wardId?.message} />
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel>Polling Unit</FieldLabel>
              <ComboboxSelect
                options={puOptions}
                value={
                  watch("pollingUnitId") ? String(watch("pollingUnitId")) : ""
                }
                onValueChange={(v) => {
                  const id = parseInt(v, 10);
                  const pu = pollingUnits.find((p) => p.id === id);
                  setValue("pollingUnitId", id);
                  setValue("pollingUnitName", pu?.name || "");
                }}
                placeholder={
                  wardId ? "Select Polling Unit" : "Select Ward first"
                }
                searchPlaceholder="Search polling units..."
                emptyMessage={
                  unitsError
                    ? "Failed to load polling units. Please try again."
                    : "No polling units found."
                }
                disabled={!wardId}
                isLoading={unitsLoading}
              />
              <FieldError error={errors.pollingUnitId?.message} />
            </div>

            <Separator />
            <NavButtons onBack={onBack} onNext={onNext} />
          </div>
        </StepCard>
      </motion.div>

      <CollectMobilePrivacyNote />

      <TrustIndicators
        items={[
          { icon: <HiLocationMarker />, label: "OFFICIAL_GEO_SOURCE" },
          {
            icon: <MapPin className="size-3.5" />,
            label: "POLLING_UNIT_ACCURATE",
          },
          { icon: <HiShieldCheck />, label: "AREA_SELECTION_SECURE" },
        ]}
      />
    </div>
  );
}
