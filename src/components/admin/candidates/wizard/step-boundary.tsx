"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import { LgaCheckboxGrid } from "@/components/admin/shared/lga-checkbox-grid";
import { ConstituencyBoundaryAlerts } from "@/components/admin/shared/constituency-boundary-alerts";
import { OfficialConstituencySelector } from "@/components/admin/shared/official-constituency-selector";
import {
  StepCard,
  CardSectionHeader,
  SectionLabel,
  FieldLabel,
  FieldError,
  NavButtons,
} from "@/components/collect/form-ui";
import { IconMapPin } from "@tabler/icons-react";
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
} from "@/lib/geo/constituency";
import { cn } from "@/lib/utils";
import {
  getPresetsForState,
  getUnsupportedPresetsForState,
} from "@/lib/data/nigerian-constituencies";
import { IconAlertTriangle } from "@tabler/icons-react";

function getConstituencyPlaceholder(position: string) {
  switch (position) {
    case "President":
      return "Federal Republic of Nigeria";
    case "Governor":
      return "Select state above to set this";
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

function isConstituencyLocked(position: string) {
  return position === "President" || position === "Governor";
}

function getConstituencySubtitle(
  position: string,
  showLgaGrid: boolean,
): string {
  if (position === "President") {
    return "Locked — every president represents the federation";
  }
  if (position === "Governor") {
    return "Locked — derived from the state above (governors represent the entire state)";
  }
  if (showLgaGrid) {
    return "Auto-suggested — edit for official names like 'Adamawa Central Senatorial District'";
  }
  return "The electoral constituency the candidate represents";
}

interface StepBoundaryProps {
  form: UseFormReturn<CreateCandidateFormValues>;
  onBack: () => void;
  onNext: () => void;
}

export function StepBoundary({ form, onBack, onNext }: StepBoundaryProps) {
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

  const {
    data: lgaResponse,
    isLoading: lgasLoading,
    isFetching: lgasFetching,
  } = useGeoLgas(showLgaGrid && selectedStateCode ? selectedStateCode : null, {
    pageSize: 200,
  });

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
    showLgaGrid &&
    selectedStateCode &&
    !lgasLoading &&
    !lgasFetching &&
    lgas.length === 0,
  );

  const expectedLgaCount = selectedStateCode
    ? getLGAsByState(selectedStateCode).length
    : 0;
  const hasPartialLgas = Boolean(
    showLgaGrid &&
    selectedStateCode &&
    !lgasLoading &&
    !lgasFetching &&
    lgas.length > 0 &&
    lgas.length < expectedLgaCount,
  );
  const [selectedPresetShortName, setSelectedPresetShortName] = useState<
    string | null
  >(null);
  const [customBoundaryMode, setCustomBoundaryMode] = useState(false);

  const availablePresets = useMemo(
    () =>
      showLgaGrid && selectedPosition && selectedStateCode
        ? getPresetsForState(
            selectedPosition as
              | "Senator"
              | "House of Representatives"
              | "State Assembly",
            selectedStateCode,
          )
        : [],
    [showLgaGrid, selectedPosition, selectedStateCode],
  );
  const hasPresets = availablePresets.length > 0;
  const unsupportedPresets = useMemo(
    () =>
      showLgaGrid &&
      selectedStateCode &&
      (selectedPosition === "House of Representatives" ||
        selectedPosition === "State Assembly")
        ? getUnsupportedPresetsForState(selectedPosition, selectedStateCode)
        : [],
    [showLgaGrid, selectedPosition, selectedStateCode],
  );
  const matchingPreset = useMemo(
    () => findMatchingPreset(constituencyLgaIds, lgas, availablePresets),
    [constituencyLgaIds, lgas, availablePresets],
  );
  const effectivePresetShortName =
    selectedPresetShortName ??
    (matchingPreset && constituency?.trim() === matchingPreset.name
      ? matchingPreset.shortName
      : null);
  const effectivePreset = useMemo(
    () =>
      effectivePresetShortName
        ? (availablePresets.find(
            (preset) => preset.shortName === effectivePresetShortName,
          ) ?? null)
        : null,
    [availablePresets, effectivePresetShortName],
  );
  const activePresetName = effectivePreset?.name;
  const effectiveOfficialPresetName =
    effectivePreset?.name ?? matchingPreset?.name;
  const effectivePresetMatchResult = useMemo(
    () =>
      effectivePreset ? matchPresetToSeededIds(effectivePreset, lgas) : null,
    [effectivePreset, lgas],
  );
  const effectivePresetDeviated = useMemo(() => {
    if (!effectivePresetMatchResult) return false;
    const s1 = [...effectivePresetMatchResult.ids].sort((a, b) => a - b);
    const s2 = [...constituencyLgaIds].sort((a, b) => a - b);
    return JSON.stringify(s1) !== JSON.stringify(s2);
  }, [effectivePresetMatchResult, constituencyLgaIds]);
  const manuallyMatchesPreset =
    !effectivePresetShortName && Boolean(matchingPreset);
  const showBoundaryGrid = Boolean(
    showLgaGrid &&
    selectedStateCode &&
    !lgasFetching &&
    !stateHasNoLgas &&
    (!hasPresets ||
      customBoundaryMode ||
      effectivePresetShortName ||
      constituencyLgaIds.length > 0),
  );
  const boundaryHelperText = effectivePresetShortName
    ? `Loaded ${constituencyLgaIds.length} LGAs from ${effectivePresetShortName}. Adjust the boundary below only if you need a custom variation.`
    : hasPresets && customBoundaryMode
      ? "Custom boundary mode. Select the LGAs that define this constituency."
      : "Select the LGAs that form this constituency's boundary";

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
              activePresetName,
              officialPresetName: effectiveOfficialPresetName,
              isDeviated: effectivePresetDeviated,
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
      effectivePresetDeviated,
      effectiveOfficialPresetName,
      activePresetName,
      manuallyMatchesPreset,
      selectedPosition,
      selectedStateName,
      suggestedConstituency,
    ],
  );
  const lastAutoConstituencyRef = useRef("");

  function handlePresetChange(value: string) {
    if (value === "__custom__" || !value) {
      setSelectedPresetShortName(null);
      setCustomBoundaryMode(true);
      return;
    }
    if (lgasFetching || lgas.length === 0) return;
    const preset = availablePresets.find((p) => p.shortName === value);
    if (!preset) return;
    setSelectedPresetShortName(value);
    setCustomBoundaryMode(false);
    const { ids } = matchPresetToSeededIds(preset, lgas);
    setValue("constituencyLgaIds", ids, { shouldValidate: true });
    lastAutoConstituencyRef.current = preset.name;
    setValue("constituency", preset.name, { shouldValidate: true });
  }

  // Auto-suggest constituency name from selected LGAs
  useEffect(() => {
    if (!showLgaGrid || lgas.length === 0) {
      lastAutoConstituencyRef.current = "";
      return;
    }
    if (effectivePresetShortName) {
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
  }, [
    constituency,
    effectivePresetShortName,
    lgas.length,
    setValue,
    showLgaGrid,
    suggestedConstituency,
  ]);

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

  function handleStateChange(value: string) {
    setValue("stateCode", value, { shouldValidate: true });
    setValue("lga", "");
    setValue("constituencyLgaIds", []);
    setSelectedPresetShortName(null);
    setCustomBoundaryMode(false);
    if (selectedPosition === "Governor") {
      const stateName = nigeriaStates.find((s) => s.code === value)?.name;
      if (stateName)
        setValue("constituency", stateName, {
          shouldValidate: true,
        });
    } else if (selectedPosition !== "President") {
      setValue("constituency", "", { shouldValidate: false });
    }
  }

  return (
    <StepCard>
      <CardSectionHeader
        title="Electoral boundary"
        subtitle="Step 3"
        statusLabel="Candidate Registration"
        icon={<IconMapPin className="size-5" />}
      />

      <div className="space-y-5">
        {!selectedPosition ? (
          <div className="border-border/60 bg-muted/20 rounded-sm border px-3.5 py-3">
            <p className="text-muted-foreground text-xs leading-relaxed">
              Choose an office on the previous step before defining the
              boundary.
            </p>
          </div>
        ) : (
          <div className="border-border/60 bg-muted/20 flex items-center justify-between gap-3 rounded-sm border px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <div className="bg-primary/60 size-1.5 shrink-0 rounded-[1px]" />
              <p className="text-muted-foreground truncate font-mono text-[10px] font-medium tracking-widest uppercase">
                Office <span className="text-primary/40 mx-1">|</span>{" "}
                <span className="text-foreground font-bold">
                  {selectedPosition}
                </span>
              </p>
            </div>
            <p className="text-muted-foreground/70 hidden font-mono text-[10px] tracking-widest uppercase sm:block">
              Use Back to change
            </p>
          </div>
        )}

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
                  : selectedPosition === "Governor"
                    ? "The state that defines this governorship constituency"
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
                <OfficialConstituencySelector
                  value={effectivePresetShortName ?? ""}
                  onValueChange={handlePresetChange}
                  presets={availablePresets}
                  unsupportedPresets={unsupportedPresets}
                  unmatchedNames={effectivePresetMatchResult?.unmatchedNames}
                  position={
                    selectedPosition as
                      | "Senator"
                      | "House of Representatives"
                      | "State Assembly"
                  }
                  disabled={lgasFetching}
                  isLoading={lgasFetching}
                />
              </div>
            )}

            {/* Constituency LGAs */}
            {showBoundaryGrid && (
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
                  helperText={boundaryHelperText}
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
        {selectedPosition && (
          <div className="space-y-3">
            <SectionLabel
              title="Constituency Name"
              subtitle={getConstituencySubtitle(selectedPosition, showLgaGrid)}
            />
            <div className="space-y-1.5">
              <Input
                aria-label="Constituency"
                value={constituency || ""}
                onChange={(e) =>
                  setValue("constituency", e.target.value, {
                    shouldValidate: true,
                  })
                }
                onBlur={(e) =>
                  setValue("constituency", e.target.value.trim(), {
                    shouldValidate: true,
                  })
                }
                readOnly={isConstituencyLocked(selectedPosition)}
                placeholder={getConstituencyPlaceholder(selectedPosition)}
                className={cn(
                  "border-border/60 h-11 rounded-sm",
                  isConstituencyLocked(selectedPosition) &&
                    "bg-muted/30 cursor-not-allowed",
                )}
              />
              <FieldError error={errors.constituency?.message} />
            </div>
          </div>
        )}

        <ConstituencyBoundaryAlerts warnings={boundaryWarnings} />
      </div>

      <div className="mt-4">
        <NavButtons onBack={onBack} onNext={onNext} />
      </div>
    </StepCard>
  );
}
