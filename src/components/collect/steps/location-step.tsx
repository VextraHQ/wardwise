"use client";

import { HiLocationMarker, HiShieldCheck } from "react-icons/hi";
import { MapPin } from "lucide-react";
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
