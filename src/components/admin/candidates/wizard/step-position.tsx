"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import { LgaCheckboxGrid } from "@/components/admin/shared/lga-checkbox-grid";
import { ConstituencyBoundaryAlerts } from "@/components/admin/shared/constituency-boundary-alerts";
import {
  StepCard,
  CardSectionHeader,
  SectionLabel,
  FieldLabel,
  FieldError,
  NavButtons,
} from "@/components/collect/form-ui";
import { IconBuildingCommunity } from "@tabler/icons-react";
import type { CreateCandidateFormValues } from "@/lib/schemas/admin-schemas";
import { nigeriaStates, getLGAsByState } from "@/lib/data/state-lga-locations";
import { useGeoLgas } from "@/hooks/use-geo";
import type { ComboboxSelectGroup } from "@/components/ui/combobox-select";
import {
  positionRequiresLgas,
  autoConstituencyName,
  getConstituencyBoundaryWarnings,
  matchPresetToSeededIds,
  findMatchingPreset,
} from "@/lib/utils/constituency";
import {
  getPresetsForState,
} from "@/lib/data/nigerian-constituencies";
import { IconAlertTriangle } from "@tabler/icons-react";

const POSITIONS = [
  "President",
  "Governor",
  "Senator",
  "House of Representatives",
  "State Assembly",
] as const;

function getConstituencyPlaceholder(position: string) {
  switch (position) {
    case "President":
      return "Federal Republic of Nigeria";
    case "Governor":
      return "e.g., Adamawa State";
    case "Senator":
      return "e.g., Adamawa Central";
    case "House of Representatives":
      return "e.g., Fufore/Song Federal Constituency";
    case "State Assembly":
      return "e.g., Song State Constituency";
    default:
      return "Enter constituency";
  }
}

interface StepPositionProps {
  form: UseFormReturn<CreateCandidateFormValues>;
  onBack: () => void;
  onNext: () => void;
}

export function StepPosition({ form, onBack, onNext }: StepPositionProps) {
  const {
    setValue,
    formState: { errors },
  } = form;

  const selectedPosition = useWatch({
    control: form.control,
    name: "position",
  });
  const selectedStateCode = useWatch({
    control: form.control,
    name: "stateCode",
  });
  const constituency = useWatch({
    control: form.control,
    name: "constituency",
  });
  const rawConstituencyLgaIds = useWatch({
    control: form.control,
    name: "constituencyLgaIds",
  });
  const constituencyLgaIds = useMemo(
    () => rawConstituencyLgaIds ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(rawConstituencyLgaIds)],
  );

  const showStateField = Boolean(selectedPosition);
  const showLgaGrid = Boolean(
    selectedPosition && positionRequiresLgas(selectedPosition),
  );

  const { data: lgaResponse, isLoading: lgasLoading, isFetching: lgasFetching } = useGeoLgas(
    showLgaGrid && selectedStateCode ? selectedStateCode : null,
    { pageSize: 200 },
  );

  const lgas = useMemo(
    () => lgaResponse?.data.map((l) => ({ id: l.id, name: l.name })) ?? [],
    [lgaResponse],
  );
  const selectedStateName = useMemo(
    () =>
      nigeriaStates.find((state) => state.code === selectedStateCode)?.name ??
      selectedStateCode,
    [selectedStateCode],
  );
  const selectedLgaNames = useMemo(
    () =>
      lgas
        .filter((lga) => constituencyLgaIds.includes(lga.id))
        .map((lga) => lga.name),
    [constituencyLgaIds, lgas],
  );
  const suggestedConstituency = useMemo(
    () => autoConstituencyName(selectedLgaNames),
    [selectedLgaNames],
  );

  // True when state is selected, LGAs are needed, query finished, but no data exists
  const stateHasNoLgas = Boolean(
    showLgaGrid && selectedStateCode && !lgasLoading && lgas.length === 0,
  );

  const expectedLgaCount = selectedStateCode
    ? getLGAsByState(selectedStateCode).length
    : 0;
  const hasPartialLgas = Boolean(
    showLgaGrid &&
    selectedStateCode &&
    !lgasLoading &&
    lgas.length > 0 &&
    lgas.length < expectedLgaCount,
  );
  const [selectedPresetShortName, setSelectedPresetShortName] = useState<string | null>(null);

  const availablePresets = useMemo(
    () =>
      showLgaGrid && selectedPosition && selectedStateCode
        ? getPresetsForState(
            selectedPosition as "Senator" | "House of Representatives" | "State Assembly",
            selectedStateCode,
          )
        : [],
    [showLgaGrid, selectedPosition, selectedStateCode],
  );
  const hasPresets = availablePresets.length > 0;

  const presetMatchResult = useMemo(() => {
    if (!selectedPresetShortName) return null;
    const preset = availablePresets.find(
      (p) => p.shortName === selectedPresetShortName,
    );
    return preset ? matchPresetToSeededIds(preset, lgas) : null;
  }, [selectedPresetShortName, availablePresets, lgas]);

  const isPresetDeviated = useMemo(() => {
    if (!selectedPresetShortName || !presetMatchResult) return false;
    const s1 = [...presetMatchResult.ids].sort((a, b) => a - b);
    const s2 = [...constituencyLgaIds].sort((a, b) => a - b);
    return JSON.stringify(s1) !== JSON.stringify(s2);
  }, [selectedPresetShortName, presetMatchResult, constituencyLgaIds]);

  const manuallyMatchesPreset = useMemo(() => {
    if (selectedPresetShortName) return false;
    return findMatchingPreset(constituencyLgaIds, lgas, availablePresets) !== null;
  }, [selectedPresetShortName, constituencyLgaIds, lgas, availablePresets]);

  const boundaryWarnings = useMemo(
    () =>
      getConstituencyBoundaryWarnings({
        position: selectedPosition ?? "",
        stateName: selectedStateName,
        selectedLgaCount: constituencyLgaIds.length,
        expectedLgaCount,
        constituencyName: constituency,
        autoSuggestedName: suggestedConstituency,
        hasPartialGeo: hasPartialLgas,
        presetMismatchInfo: hasPresets
          ? {
              hasPresets,
              activePresetName: selectedPresetShortName ?? undefined,
              isDeviated: isPresetDeviated,
              manuallyMatchesPreset,
            }
          : undefined,
      }),
    [
      constituency,
      constituencyLgaIds.length,
      expectedLgaCount,
      hasPartialLgas,
      hasPresets,
      isPresetDeviated,
      manuallyMatchesPreset,
      selectedPosition,
      selectedPresetShortName,
      selectedStateName,
      suggestedConstituency,
    ],
  );
  const lastAutoConstituencyRef = useRef("");

  function handlePresetChange(value: string) {
    if (value === "__custom__" || !value) {
      setSelectedPresetShortName(null);
      return;
    }
    if (lgasFetching || lgas.length === 0) return;
    const preset = availablePresets.find((p) => p.shortName === value);
    if (!preset) return;
    setSelectedPresetShortName(value);
    const { ids } = matchPresetToSeededIds(preset, lgas);
    setValue("constituencyLgaIds", ids, { shouldValidate: true });
    lastAutoConstituencyRef.current = preset.name;
    setValue("constituency", preset.name, { shouldValidate: false });
  }

  // Auto-suggest constituency name from selected LGAs
  useEffect(() => {
    if (!showLgaGrid || lgas.length === 0) {
      lastAutoConstituencyRef.current = "";
      return;
    }
    const suggested = suggestedConstituency;

    if (!suggested) {
      if (constituency === lastAutoConstituencyRef.current && constituency) {
        lastAutoConstituencyRef.current = "";
        setValue("constituency", "", { shouldValidate: false });
      }
      return;
    }

    const isManualOverride =
      constituency.length > 0 &&
      constituency !== lastAutoConstituencyRef.current;

    if (suggested === constituency) {
      lastAutoConstituencyRef.current = suggested;
      return;
    }

    if (!isManualOverride) {
      lastAutoConstituencyRef.current = suggested;
      setValue("constituency", suggested, { shouldValidate: false });
    }
  }, [constituency, lgas.length, setValue, showLgaGrid, suggestedConstituency]);

  const stateGroups: ComboboxSelectGroup[] = useMemo(() => {
    const zones = [
      "North Central",
      "North East",
      "North West",
      "South East",
      "South South",
      "South West",
    ] as const;
    return zones.map((zone) => ({
      heading: zone,
      options: nigeriaStates
        .filter((s) => s.zone === zone)
        .map((s) => ({
          value: s.code,
          label: s.name,
          description: s.code,
        })),
    }));
  }, []);

  function handlePositionChange(value: string) {
    setValue("position", value, { shouldValidate: true });
    setValue("stateCode", "");
    setValue("lga", "");
    setValue("constituencyLgaIds", []);
    setSelectedPresetShortName(null);
    if (value === "President") {
      setValue("constituency", "Federal Republic of Nigeria", {
        shouldValidate: true,
      });
    } else {
      setValue("constituency", "");
    }
  }

  function handleStateChange(value: string) {
    setValue("stateCode", value, { shouldValidate: true });
    setValue("lga", "");
    setValue("constituencyLgaIds", []);
    setSelectedPresetShortName(null);
    if (selectedPosition === "Governor") {
      const stateName = nigeriaStates.find((s) => s.code === value)?.name;
      if (stateName)
        setValue("constituency", `${stateName} State`, {
          shouldValidate: true,
        });
    }
  }

  return (
    <StepCard>
      <CardSectionHeader
        title="Electoral Position"
        subtitle="Step 2"
        statusLabel="Candidate Registration"
        icon={<IconBuildingCommunity className="size-5" />}
      />

      <div className="space-y-4">
        {/* Position */}
        <div className="space-y-3">
          <SectionLabel
            title="Position"
            subtitle="The office the candidate is contesting for"
          />
          <div className="space-y-1.5">
            <FieldLabel>Position</FieldLabel>
            <Select
              onValueChange={handlePositionChange}
              value={selectedPosition}
            >
              <SelectTrigger className="border-border/60 h-11 rounded-sm">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError error={errors.position?.message} />
          </div>
        </div>

        {/* State & Electoral Boundary */}
        {showStateField && (
          <div className="space-y-3">
            <SectionLabel
              title={
                selectedPosition === "President"
                  ? "Location"
                  : "Electoral Boundary"
              }
              subtitle={
                selectedPosition === "President"
                  ? "Optional home state for informational purposes"
                  : "The state and LGAs that define this constituency"
              }
            />
            <div className="space-y-1.5">
              <FieldLabel optional={selectedPosition === "President"}>
                State
                {selectedPosition === "President" && (
                  <span className="text-muted-foreground ml-1 font-normal tracking-normal normal-case">
                    — home state
                  </span>
                )}
              </FieldLabel>
              <ComboboxSelect
                groups={stateGroups}
                value={selectedStateCode || ""}
                onValueChange={handleStateChange}
                placeholder="Select state..."
                searchPlaceholder="Search states..."
                emptyMessage="No state found."
              />
              <FieldError error={errors.stateCode?.message} />
            </div>

            {/* Official constituency preset selector */}
            {showLgaGrid && selectedStateCode && hasPresets && (
              <div className="space-y-1.5">
                <FieldLabel>Official Constituency</FieldLabel>
                <ComboboxSelect
                  value={selectedPresetShortName ?? ""}
                  onValueChange={handlePresetChange}
                  disabled={lgasFetching}
                  isLoading={lgasFetching}
                  options={[
                    {
                      value: "__custom__",
                      label: "Custom (manual selection)",
                      description: "Skip preset — pick LGAs manually",
                    },
                    ...availablePresets.map((p) => ({
                      value: p.shortName,
                      label: p.shortName,
                      description: p.name,
                    })),
                  ]}
                  placeholder="Select official constituency..."
                  searchPlaceholder="Search constituencies..."
                  emptyMessage="No constituency found."
                />
                {presetMatchResult && presetMatchResult.unmatchedNames.length > 0 && (
                  <p className="text-muted-foreground text-xs">
                    <span className="font-medium text-amber-600 dark:text-amber-500">
                      {presetMatchResult.unmatchedNames.length} LGA
                      {presetMatchResult.unmatchedNames.length > 1 ? "s" : ""} not yet seeded:
                    </span>{" "}
                    {presetMatchResult.unmatchedNames.join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Constituency LGAs */}
            {showLgaGrid && selectedStateCode && !stateHasNoLgas && (
              <div className="space-y-3">
                <LgaCheckboxGrid
                  lgas={lgas}
                  selectedIds={constituencyLgaIds}
                  onToggle={(lgaId) => {
                    const ids = constituencyLgaIds.includes(lgaId)
                      ? constituencyLgaIds.filter((id) => id !== lgaId)
                      : [...constituencyLgaIds, lgaId];
                    setValue("constituencyLgaIds", ids, {
                      shouldValidate: true,
                    });
                  }}
                  onSelectAll={() =>
                    setValue(
                      "constituencyLgaIds",
                      lgas.map((lga) => lga.id),
                      { shouldValidate: true },
                    )
                  }
                  onClearAll={() =>
                    setValue("constituencyLgaIds", [], {
                      shouldValidate: true,
                    })
                  }
                  loading={lgasLoading}
                  label="Constituency LGAs"
                  helperText="Select the LGAs that form this constituency's boundary"
                  stateLabel={selectedStateName}
                  error={errors.constituencyLgaIds?.message}
                />
                {hasPartialLgas && (
                  <p className="text-muted-foreground text-xs">
                    <span className="font-medium text-amber-600 dark:text-amber-500">
                      {lgas.length} of {expectedLgaCount} LGAs available
                    </span>{" "}
                    for {selectedStateName}. Some LGAs have not been seeded yet.
                  </p>
                )}
              </div>
            )}

            {/* Empty-state banner for unseeded states */}
            {stateHasNoLgas && (
              <div className="flex items-start gap-3 rounded-sm border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                <IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-400">
                    No LGA data available for {selectedStateName} yet.
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    You can save this candidate now and add constituency LGAs
                    later by editing their profile. Note: campaigns cannot be
                    created until constituency LGAs are defined.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Constituency */}
        <div className="space-y-3">
          <SectionLabel
            title="Constituency Name"
            subtitle={
              showLgaGrid
                ? "Auto-suggested — edit for official names like 'Adamawa Central Senatorial District'"
                : "The electoral constituency the candidate represents"
            }
          />
          <div className="space-y-1.5">
            <FieldLabel>Constituency</FieldLabel>
            <Input
              value={constituency || ""}
              onChange={(e) =>
                setValue("constituency", e.target.value, {
                  shouldValidate: true,
                })
              }
              placeholder={getConstituencyPlaceholder(selectedPosition)}
              className="border-border/60 h-11 rounded-sm"
            />
            <FieldError error={errors.constituency?.message} />
          </div>
        </div>

        <ConstituencyBoundaryAlerts warnings={boundaryWarnings} />
      </div>

      <div className="mt-4">
        <NavButtons onBack={onBack} onNext={onNext} />
      </div>
    </StepCard>
  );
}
