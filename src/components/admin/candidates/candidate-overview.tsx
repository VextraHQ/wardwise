"use client";

import { useState, useRef } from "react";
import { useUpdateCandidate } from "@/hooks/use-admin";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { CandidateWithUser } from "@/lib/api/admin";
import {
  updateCandidateSchema,
  type UpdateCandidateFormValues,
} from "@/lib/schemas/admin-schemas";
import { nigeriaStates, getLGAsByState } from "@/lib/data/state-lga-locations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useGeoLgas } from "@/hooks/use-geo";
import {
  NIGERIAN_PARTIES,
  CANDIDATE_TITLES,
  CANDIDATE_PARTY_OTHER_OPTION,
  CANDIDATE_TITLE_OTHER_OPTION,
} from "@/lib/data/nigerian-parties";
import { ListOrCustomField } from "@/components/admin/shared/list-or-custom-field";
import {
  IconEdit,
  IconX,
  IconDeviceFloppy,
  IconUsers,
  IconBuildingCommunity,
  IconClipboardList,
} from "@tabler/icons-react";
import { useMemo, useEffect } from "react";
import { LgaCheckboxGrid } from "@/components/admin/shared/lga-checkbox-grid";
import { ConstituencyBoundaryAlerts } from "@/components/admin/shared/constituency-boundary-alerts";
import { OfficialConstituencySelector } from "@/components/admin/shared/official-constituency-selector";
import {
  positionRequiresLgas,
  autoConstituencyName,
  getConstituencyBoundaryWarnings,
  matchPresetToSeededIds,
  findMatchingPreset,
} from "@/lib/geo/constituency";
import {
  getPresetsForState,
  getUnsupportedPresetsForState,
} from "@/lib/data/nigerian-constituencies";
import { cn } from "@/lib/utils";

function resolveStateName(stateCode: string | null): string {
  if (!stateCode) return "—";
  return nigeriaStates.find((s) => s.code === stateCode)?.name ?? stateCode;
}

const POSITIONS = [
  "President",
  "Governor",
  "Senator",
  "House of Representatives",
  "State Assembly",
] as const;

const PARTY_OPTIONS_WITH_OTHER = [
  ...NIGERIAN_PARTIES,
  CANDIDATE_PARTY_OTHER_OPTION,
];
const TITLE_OPTIONS_WITH_OTHER = [
  ...CANDIDATE_TITLES,
  CANDIDATE_TITLE_OTHER_OPTION,
];

interface CandidateOverviewProps {
  candidate: CandidateWithUser;
}

export function CandidateOverview({ candidate }: CandidateOverviewProps) {
  const [editing, setEditing] = useState(false);
  const campaignCount =
    (candidate as CandidateWithUser & { _count?: { campaigns?: number } })
      ._count?.campaigns ?? 0;
  const canvasserCount =
    (candidate as CandidateWithUser & { _count?: { canvassers?: number } })
      ._count?.canvassers ?? 0;
  const supporterCount = candidate.supporterCount ?? 0;

  const form = useForm<UpdateCandidateFormValues>({
    resolver: zodResolver(updateCandidateSchema),
    defaultValues: {
      id: candidate.id,
      name: candidate.name,
      email: candidate.user?.email ?? "",
      party: candidate.party,
      position: candidate.position,
      constituency: candidate.constituency ?? "",
      stateCode: candidate.stateCode ?? "",
      lga: candidate.lga ?? "",
      constituencyLgaIds: candidate.constituencyLgaIds ?? [],
      description: candidate.description ?? "",
      phone: candidate.phone ?? "",
      title: candidate.title ?? "",
    },
  });

  const selectedPosition = useWatch({
    control: form.control,
    name: "position",
  });
  const selectedStateCode = useWatch({
    control: form.control,
    name: "stateCode",
  });
  const rawConstituencyLgaIds = useWatch({
    control: form.control,
    name: "constituencyLgaIds",
  });
  const constituency = useWatch({
    control: form.control,
    name: "constituency",
  });
  const constituencyValue = constituency ?? "";
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
  } = useGeoLgas(
    editing
      ? showLgaGrid && selectedStateCode
        ? selectedStateCode
        : null
      : positionRequiresLgas(candidate.position) && candidate.stateCode
        ? candidate.stateCode
        : null,
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
  const initialPartyMode: "list" | "custom" =
    candidate.party &&
    !NIGERIAN_PARTIES.some((option) => option.value === candidate.party)
      ? "custom"
      : "list";
  const initialTitleMode: "list" | "custom" =
    candidate.title &&
    !CANDIDATE_TITLES.some((option) => option.value === candidate.title)
      ? "custom"
      : "list";

  const availablePresets = useMemo(
    () =>
      editing && showLgaGrid && selectedPosition && selectedStateCode
        ? getPresetsForState(
            selectedPosition as
              | "Senator"
              | "House of Representatives"
              | "State Assembly",
            selectedStateCode,
          )
        : [],
    [editing, showLgaGrid, selectedPosition, selectedStateCode],
  );
  const hasPresets = availablePresets.length > 0;
  const unsupportedPresets = useMemo(
    () =>
      editing &&
      showLgaGrid &&
      selectedStateCode &&
      (selectedPosition === "House of Representatives" ||
        selectedPosition === "State Assembly")
        ? getUnsupportedPresetsForState(selectedPosition, selectedStateCode)
        : [],
    [editing, showLgaGrid, selectedPosition, selectedStateCode],
  );
  const matchingPreset = useMemo(
    () => findMatchingPreset(constituencyLgaIds, lgas, availablePresets),
    [constituencyLgaIds, lgas, availablePresets],
  );
  const effectivePresetShortName =
    selectedPresetShortName ??
    (matchingPreset && constituencyValue.trim() === matchingPreset.name
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
    editing &&
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

  const editBoundaryWarnings = useMemo(
    () =>
      getConstituencyBoundaryWarnings({
        position: selectedPosition ?? "",
        stateName: selectedStateName,
        selectedLgaCount: constituencyLgaIds.length,
        expectedLgaCount,
        constituencyName: constituencyValue,
        autoSuggestedName: suggestedConstituency,
        hasPartialGeo: hasPartialLgas,
        hasExistingCampaigns: campaignCount > 0,
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
      campaignCount,
      constituencyLgaIds.length,
      constituencyValue,
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
  const summaryBoundaryWarnings = useMemo(() => {
    const summaryPresets =
      candidate.stateCode && positionRequiresLgas(candidate.position)
        ? getPresetsForState(
            candidate.position as
              | "Senator"
              | "House of Representatives"
              | "State Assembly",
            candidate.stateCode,
          )
        : [];
    const summaryMatchingPreset = findMatchingPreset(
      candidate.constituencyLgaIds,
      lgas,
      summaryPresets,
    );

    return getConstituencyBoundaryWarnings({
      position: candidate.position,
      stateName: resolveStateName(candidate.stateCode),
      selectedLgaCount: candidate.constituencyLgaIds.length,
      expectedLgaCount: candidate.stateCode
        ? getLGAsByState(candidate.stateCode).length
        : 0,
      constituencyName: candidate.constituency,
      presetMismatchInfo: summaryMatchingPreset
        ? {
            hasPresets: true,
            activePresetName:
              candidate.constituency === summaryMatchingPreset.name
                ? summaryMatchingPreset.name
                : undefined,
            officialPresetName: summaryMatchingPreset.name,
            isDeviated: false,
            manuallyMatchesPreset: true,
          }
        : undefined,
    });
  }, [
    candidate.constituency,
    candidate.constituencyLgaIds,
    candidate.position,
    candidate.stateCode,
    lgas,
  ]);
  const showCampaignBoundaryReviewNote =
    campaignCount > 0 &&
    (positionRequiresLgas(candidate.position) ||
      candidate.position === "Governor");
  const lastAutoConstituencyRef = useRef("");

  // Auto-suggest constituency from selected LGAs when editing
  useEffect(() => {
    if (!editing || !showLgaGrid || lgas.length === 0) {
      lastAutoConstituencyRef.current = "";
      return;
    }
    if (effectivePresetShortName) {
      return;
    }
    const suggested = suggestedConstituency;

    if (!suggested) {
      if (
        constituencyValue === lastAutoConstituencyRef.current &&
        constituencyValue
      ) {
        lastAutoConstituencyRef.current = "";
        form.setValue("constituency", "", { shouldValidate: false });
      }
      return;
    }

    const isManualOverride =
      constituencyValue.length > 0 &&
      constituencyValue !== lastAutoConstituencyRef.current;

    if (suggested === constituencyValue) {
      lastAutoConstituencyRef.current = suggested;
      return;
    }

    if (!isManualOverride) {
      lastAutoConstituencyRef.current = suggested;
      form.setValue("constituency", suggested, { shouldValidate: false });
    }
  }, [
    constituencyValue,
    editing,
    effectivePresetShortName,
    form,
    lgas.length,
    showLgaGrid,
    suggestedConstituency,
  ]);

  useEffect(() => {
    if (!editing) {
      setSelectedPresetShortName(null);
      setCustomBoundaryMode(false);
    }
  }, [editing]);

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
    form.setValue("constituencyLgaIds", ids, { shouldValidate: true });
    lastAutoConstituencyRef.current = preset.name;
    form.setValue("constituency", preset.name, { shouldValidate: true });
  }

  const stateGroups = useMemo(() => {
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
        .map((s) => ({ value: s.code, label: s.name, description: s.code })),
    }));
  }, []);

  const updateMutation = useUpdateCandidate();

  function onSubmit(data: UpdateCandidateFormValues) {
    updateMutation.mutate(
      {
        id: candidate.id,
        name: data.name,
        email: data.email,
        party: data.party,
        position: data.position as (typeof POSITIONS)[number],
        constituency: data.constituency,
        constituencyLgaIds: data.constituencyLgaIds,
        stateCode: data.stateCode || undefined,
        lga: data.lga || undefined,
        description: data.description || undefined,
        phone: data.phone || undefined,
        title: data.title || undefined,
      },
      {
        onSuccess: () => {
          setEditing(false);
          toast.success("Candidate updated");
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to update candidate");
        },
      },
    );
  }

  function handleEditPositionChange(value: string) {
    if (value === selectedPosition) return;
    form.setValue("position", value, { shouldValidate: true });
    form.setValue("stateCode", "", { shouldValidate: true });
    form.setValue("lga", "");
    form.setValue("constituencyLgaIds", [], { shouldValidate: true });
    setSelectedPresetShortName(null);
    setCustomBoundaryMode(false);

    if (value === "President") {
      form.setValue("constituency", "Federal Republic of Nigeria", {
        shouldValidate: true,
      });
    } else {
      form.setValue("constituency", "", { shouldValidate: true });
    }
  }

  function handleEditStateChange(value: string) {
    form.setValue("stateCode", value, { shouldValidate: true });
    form.setValue("lga", "");
    form.setValue("constituencyLgaIds", [], { shouldValidate: true });
    setSelectedPresetShortName(null);
    setCustomBoundaryMode(false);

    if (selectedPosition === "Governor") {
      const stateName = nigeriaStates.find(
        (state) => state.code === value,
      )?.name;
      if (stateName) {
        form.setValue("constituency", stateName, {
          shouldValidate: true,
        });
      }
    } else if (selectedPosition !== "President") {
      form.setValue("constituency", "", { shouldValidate: false });
    }
  }

  const stats = [
    {
      label: "Campaigns",
      value: campaignCount,
      subtitle: "Collect campaigns",
      icon: IconClipboardList,
    },
    {
      label: "Supporters",
      value: supporterCount,
      subtitle: "From submissions",
      icon: IconUsers,
    },
    {
      label: "Canvassers",
      value: canvasserCount,
      subtitle: "Field agents",
      icon: IconBuildingCommunity,
    },
  ];

  return (
    <div className="space-y-6 pt-4">
      {/* Stats row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border/60 rounded-sm shadow-none"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
              <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                {stat.label}
              </CardTitle>
              <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm sm:h-9 sm:w-9">
                <stat.icon className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="font-mono text-xl font-semibold tabular-nums sm:text-2xl">
                {stat.value}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info / Edit card */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
            Candidate Information
          </CardTitle>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
              onClick={() => setEditing(true)}
            >
              <IconEdit className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Identity */}
                <div className="space-y-4">
                  <p className="text-foreground/70 font-mono text-[9px] font-bold tracking-widest uppercase">
                    Identity
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            Title
                          </FormLabel>
                          <ListOrCustomField
                            options={TITLE_OPTIONS_WITH_OTHER}
                            value={field.value || ""}
                            onChange={field.onChange}
                            triggerAriaLabel="Title"
                            inputAriaLabel="Title"
                            placeholder="Select title..."
                            searchPlaceholder="Search titles..."
                            emptyMessage="No title found."
                            customPlaceholder="Enter title"
                            customHintId="edit-custom-title-hint"
                            initialMode={initialTitleMode}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="border-border/60 rounded-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="party"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            Party
                          </FormLabel>
                          <ListOrCustomField
                            options={PARTY_OPTIONS_WITH_OTHER}
                            value={field.value || ""}
                            onChange={field.onChange}
                            triggerAriaLabel="Party"
                            inputAriaLabel="Party"
                            placeholder="Select party..."
                            searchPlaceholder="Search parties..."
                            emptyMessage="No party found."
                            customPlaceholder="Enter party name"
                            customHintId="edit-custom-party-hint"
                            initialMode={initialPartyMode}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            Position
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={field.value ?? ""}
                              onValueChange={handleEditPositionChange}
                              className="flex flex-col gap-1.5"
                              aria-label="Electoral position"
                            >
                              {POSITIONS.map((pos) => {
                                const selected = field.value === pos;
                                return (
                                  <label
                                    key={pos}
                                    className={cn(
                                      "focus-within:ring-primary/30 flex cursor-pointer items-start gap-3 rounded-sm border-2 px-3 py-2.5 transition-[border-color,background-color,color] focus-within:ring-2 focus-within:ring-offset-1 sm:items-center sm:px-4 sm:py-3",
                                      selected
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border/60 bg-card text-foreground hover:border-primary/40",
                                    )}
                                  >
                                    <RadioGroupItem
                                      value={pos}
                                      className="mt-0.5 shadow-none sm:mt-0"
                                    />
                                    <span className="min-w-0 flex-1 text-left text-sm leading-snug font-medium">
                                      {pos}
                                    </span>
                                  </label>
                                );
                              })}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-border/40 border-b" />

                {/* Electoral Boundary */}
                <div className="space-y-4">
                  <p className="text-foreground/70 font-mono text-[9px] font-bold tracking-widest uppercase">
                    {selectedPosition === "President"
                      ? "Location"
                      : "Electoral Boundary"}
                  </p>
                  {showStateField && (
                    <FormField
                      control={form.control}
                      name="stateCode"
                      render={() => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            State
                          </FormLabel>
                          <ComboboxSelect
                            groups={stateGroups}
                            value={selectedStateCode || ""}
                            onValueChange={handleEditStateChange}
                            placeholder="Select state..."
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {showLgaGrid && selectedStateCode && hasPresets && (
                    <FormItem>
                      <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                        Official Constituency
                      </FormLabel>
                      <OfficialConstituencySelector
                        value={effectivePresetShortName ?? ""}
                        onValueChange={handlePresetChange}
                        presets={availablePresets}
                        unsupportedPresets={unsupportedPresets}
                        unmatchedNames={
                          effectivePresetMatchResult?.unmatchedNames
                        }
                        position={
                          selectedPosition as
                            | "Senator"
                            | "House of Representatives"
                            | "State Assembly"
                        }
                        disabled={lgasFetching}
                        isLoading={lgasFetching}
                      />
                    </FormItem>
                  )}

                  {showBoundaryGrid && (
                    <div className="space-y-3">
                      <LgaCheckboxGrid
                        lgas={lgas}
                        selectedIds={constituencyLgaIds}
                        onToggle={(lgaId) => {
                          const ids = constituencyLgaIds.includes(lgaId)
                            ? constituencyLgaIds.filter((id) => id !== lgaId)
                            : [...constituencyLgaIds, lgaId];
                          form.setValue("constituencyLgaIds", ids, {
                            shouldValidate: true,
                          });
                        }}
                        onSelectAll={() =>
                          form.setValue(
                            "constituencyLgaIds",
                            lgas.map((lga) => lga.id),
                            { shouldValidate: true },
                          )
                        }
                        onClearAll={() =>
                          form.setValue("constituencyLgaIds", [], {
                            shouldValidate: true,
                          })
                        }
                        loading={lgasLoading}
                        label="Constituency LGAs"
                        helperText={boundaryHelperText}
                        stateLabel={selectedStateName}
                        error={
                          form.formState.errors.constituencyLgaIds?.message
                        }
                      />
                      {hasPartialLgas && (
                        <p className="text-muted-foreground text-xs">
                          <span className="font-medium text-amber-600 dark:text-amber-500">
                            {lgas.length} of {expectedLgaCount} LGAs available
                          </span>{" "}
                          for {selectedStateName}. Some LGAs have not been
                          seeded yet.
                        </p>
                      )}
                    </div>
                  )}

                  {stateHasNoLgas && (
                    <div className="flex items-start gap-3 rounded-sm border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                      <span className="mt-0.5 text-amber-600 dark:text-amber-500">
                        &#9888;
                      </span>
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 dark:text-amber-400">
                          No LGA data available for {selectedStateName} yet.
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Save and add constituency LGAs later. Campaigns cannot
                          be created until constituency LGAs are defined.
                        </p>
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="constituency"
                    render={({ field }) => {
                      const locked =
                        selectedPosition === "President" ||
                        selectedPosition === "Governor";
                      const subtitle =
                        selectedPosition === "President"
                          ? "Locked — every president represents the federation"
                          : selectedPosition === "Governor"
                            ? "Locked — derived from the state above"
                            : null;
                      return (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            Constituency Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              readOnly={locked}
                              className={cn(
                                "border-border/60 rounded-sm",
                                locked && "bg-muted/30 cursor-not-allowed",
                              )}
                              {...field}
                            />
                          </FormControl>
                          {subtitle && (
                            <p className="text-muted-foreground text-[11px]">
                              {subtitle}
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <ConstituencyBoundaryAlerts warnings={editBoundaryWarnings} />
                </div>

                <div className="border-border/40 border-b" />

                {/* Contact & Bio */}
                <div className="space-y-4">
                  <p className="text-foreground/70 font-mono text-[9px] font-bold tracking-widest uppercase">
                    Contact & Bio
                  </p>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                          Phone
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="08012345678"
                            className="border-border/60 rounded-sm"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            className="border-border/60 rounded-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updateMutation.isPending}
                    className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                  >
                    <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
                    {updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                    onClick={() => {
                      form.reset();
                      setEditing(false);
                    }}
                  >
                    <IconX className="mr-1.5 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-5">
              {/* Identity */}
              <div>
                <p className="text-foreground/70 mb-3 font-mono text-[9px] font-bold tracking-widest uppercase">
                  Identity
                </p>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <InfoRow label="Title" value={candidate.title || "—"} />
                  <InfoRow label="Name" value={candidate.name} />
                  <InfoRow label="Party" value={candidate.party} />
                  <InfoRow label="Position" value={candidate.position} />
                </div>
              </div>

              <div className="border-border/40 border-b" />

              {/* Electoral Boundary */}
              <div>
                <p className="text-foreground/70 mb-3 font-mono text-[9px] font-bold tracking-widest uppercase">
                  Electoral Boundary
                </p>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <InfoRow
                    label="State"
                    value={resolveStateName(candidate.stateCode)}
                  />
                  <InfoRow
                    label="Constituency"
                    value={candidate.constituency || "—"}
                  />
                  {candidate.constituencyLgaIds.length > 0 && (
                    <InfoRow
                      label="Constituency LGAs"
                      value={`${candidate.constituencyLgaIds.length} LGA${candidate.constituencyLgaIds.length !== 1 ? "s" : ""} selected`}
                    />
                  )}
                </div>
                <div className="mt-4">
                  <ConstituencyBoundaryAlerts
                    warnings={summaryBoundaryWarnings}
                  />
                </div>
                {showCampaignBoundaryReviewNote && (
                  <div className="border-border/50 bg-muted/20 mt-4 rounded-sm border px-3 py-2.5">
                    <p className="text-foreground text-xs font-medium">
                      {campaignCount} existing Collect campaign
                      {campaignCount === 1 ? "" : "s"} use
                      {campaignCount === 1 ? "s" : ""} this saved boundary.
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      If you edit this boundary later, review campaign coverage
                      in the Campaigns tab.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-border/40 border-b" />

              {/* Contact */}
              <div>
                <p className="text-foreground/70 mb-3 font-mono text-[9px] font-bold tracking-widest uppercase">
                  Contact
                </p>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <InfoRow label="Phone" value={candidate.phone || "—"} />
                </div>
              </div>

              {candidate.description && (
                <>
                  <div className="border-border/40 border-b" />
                  <div>
                    <p className="text-foreground/70 mb-3 font-mono text-[9px] font-bold tracking-widest uppercase">
                      Bio
                    </p>
                    <InfoRow
                      label="Description"
                      value={candidate.description}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
        {label}
      </p>
      <p className="text-foreground text-sm font-medium">{value}</p>
    </div>
  );
}
