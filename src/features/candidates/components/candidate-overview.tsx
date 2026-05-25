"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { CandidateWithUser } from "@/features/admin/api/admin-api";
import { useUpdateCandidate } from "@/features/admin/hooks/use-admin";
import {
  updateCandidateSchema,
  type UpdateCandidateFormValues,
} from "@/features/candidates/schemas/candidate-schemas";
import {
  NIGERIAN_PARTIES,
  CANDIDATE_TITLES,
} from "@/features/candidates/data/nigerian-parties";
import { CandidateOverviewStatsCard } from "@/features/candidates/components/overview/candidate-overview-stats-card";
import { CandidateOverviewProfileCard } from "@/features/candidates/components/overview/candidate-overview-profile-card";
import {
  buildCandidateFormDefaults,
  firstZodIssueMessage,
  LGA_CHIP_DISPLAY_LIMIT,
  resolveStateName,
  type CandidateOverviewPosition,
  type EditingSection,
} from "@/features/candidates/lib/candidate-overview-helpers";
import { useGeoLgas } from "@/features/geo/hooks/use-geo";
import {
  nigeriaStates,
  getLGAsByState,
} from "@/features/geo/data/state-lga-locations";
import {
  getPresetsForState,
  getUnsupportedPresetsForState,
} from "@/features/geo/data/nigerian-constituencies";
import {
  positionRequiresLgas,
  autoConstituencyName,
  getConstituencyBoundaryWarnings,
  matchPresetToSeededIds,
  findMatchingPreset,
} from "@/features/geo/lib/constituency";

interface CandidateOverviewProps {
  candidate: CandidateWithUser;
}

export function CandidateOverview({ candidate }: CandidateOverviewProps) {
  const [editingSection, setEditingSection] = useState<EditingSection | null>(
    null,
  );
  const campaignCount =
    (candidate as CandidateWithUser & { _count?: { campaigns?: number } })
      ._count?.campaigns ?? 0;
  const canvasserCount =
    (candidate as CandidateWithUser & { _count?: { canvassers?: number } })
      ._count?.canvassers ?? 0;
  const supporterCount = candidate.supporterCount ?? 0;

  const form = useForm<UpdateCandidateFormValues>({
    resolver: zodResolver(updateCandidateSchema),
    defaultValues: buildCandidateFormDefaults(candidate),
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

  const geoLgaQueryState =
    editingSection === "electoral"
      ? showLgaGrid && selectedStateCode
        ? selectedStateCode
        : null
      : positionRequiresLgas(candidate.position) && candidate.stateCode
        ? candidate.stateCode
        : null;

  const {
    data: lgaResponse,
    isLoading: lgasLoading,
    isFetching: lgasFetching,
  } = useGeoLgas(geoLgaQueryState, { pageSize: 200 });

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

  /** LGAs for read-only chips while another section is being edited (geo keyed to saved candidate). */
  const summaryLgaNames = useMemo(() => {
    if (
      !positionRequiresLgas(candidate.position) ||
      !candidate.stateCode ||
      editingSection === "electoral"
    ) {
      return [];
    }
    return lgas
      .filter((lga) => candidate.constituencyLgaIds.includes(lga.id))
      .map((lga) => lga.name);
  }, [
    candidate.constituencyLgaIds,
    candidate.position,
    candidate.stateCode,
    editingSection,
    lgas,
  ]);
  const visibleSummaryLgaChips = summaryLgaNames.slice(
    0,
    LGA_CHIP_DISPLAY_LIMIT,
  );
  const remainingSummaryLgaCount = Math.max(
    0,
    summaryLgaNames.length - visibleSummaryLgaChips.length,
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
      editingSection === "electoral" &&
      showLgaGrid &&
      selectedPosition &&
      selectedStateCode
        ? getPresetsForState(
            selectedPosition as
              | "Senator"
              | "House of Representatives"
              | "State Assembly",
            selectedStateCode,
          )
        : [],
    [editingSection, showLgaGrid, selectedPosition, selectedStateCode],
  );
  const hasPresets = availablePresets.length > 0;
  const unsupportedPresets = useMemo(
    () =>
      editingSection === "electoral" &&
      showLgaGrid &&
      selectedStateCode &&
      (selectedPosition === "House of Representatives" ||
        selectedPosition === "State Assembly")
        ? getUnsupportedPresetsForState(selectedPosition, selectedStateCode)
        : [],
    [editingSection, showLgaGrid, selectedPosition, selectedStateCode],
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
    editingSection === "electoral" &&
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

  // Auto-suggest constituency from selected LGAs when editing electoral section
  useEffect(() => {
    if (editingSection !== "electoral" || !showLgaGrid || lgas.length === 0) {
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
    editingSection,
    effectivePresetShortName,
    form,
    lgas.length,
    showLgaGrid,
    suggestedConstituency,
  ]);

  useEffect(() => {
    if (editingSection !== "electoral") {
      setSelectedPresetShortName(null);
      setCustomBoundaryMode(false);
    }
  }, [editingSection]);

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

  const candidateRemoteRevision = `${candidate.id}:${candidate.updatedAt}`;

  useEffect(() => {
    if (editingSection === null) {
      form.reset(buildCandidateFormDefaults(candidate));
    }
  }, [candidateRemoteRevision, editingSection, form, candidate]);

  function beginSectionEdit(section: EditingSection) {
    if (editingSection && editingSection !== section) {
      form.reset(buildCandidateFormDefaults(candidate));
    }
    setEditingSection(section);
  }

  function cancelSectionEdit() {
    form.reset(buildCandidateFormDefaults(candidate));
    setEditingSection(null);
  }

  function saveIdentity() {
    const v = form.getValues();
    const parsed = updateCandidateSchema.safeParse({
      id: candidate.id,
      name: v.name,
      party: v.party,
      title: v.title || undefined,
    });
    if (!parsed.success) {
      toast.error(firstZodIssueMessage(parsed.error));
      return;
    }
    const d = parsed.data;
    updateMutation.mutate(
      {
        id: d.id,
        name: d.name,
        party: d.party,
        title: d.title,
      },
      {
        onSuccess: () => {
          setEditingSection(null);
          toast.success("Candidate updated");
        },
        onError: (error: Error) =>
          toast.error(error.message || "Failed to update candidate"),
      },
    );
  }

  function saveElectoral() {
    const v = form.getValues();
    const parsed = updateCandidateSchema.safeParse({
      id: candidate.id,
      position: v.position,
      stateCode: v.stateCode || undefined,
      constituency: v.constituency,
      constituencyLgaIds: v.constituencyLgaIds,
      lga: v.lga || undefined,
    });
    if (!parsed.success) {
      toast.error(firstZodIssueMessage(parsed.error));
      return;
    }
    const d = parsed.data;
    updateMutation.mutate(
      {
        id: d.id,
        position: d.position as CandidateOverviewPosition,
        constituency: d.constituency,
        constituencyLgaIds: d.constituencyLgaIds,
        stateCode: d.stateCode || undefined,
        lga: d.lga || undefined,
      },
      {
        onSuccess: () => {
          setEditingSection(null);
          toast.success("Candidate updated");
        },
        onError: (error: Error) =>
          toast.error(error.message || "Failed to update candidate"),
      },
    );
  }

  function saveContact() {
    const v = form.getValues();
    const parsed = updateCandidateSchema.safeParse({
      id: candidate.id,
      email: v.email,
      phone: v.phone,
    });
    if (!parsed.success) {
      toast.error(firstZodIssueMessage(parsed.error));
      return;
    }
    updateMutation.mutate(
      {
        id: parsed.data.id,
        email: parsed.data.email,
        phone: parsed.data.phone,
      },
      {
        onSuccess: () => {
          setEditingSection(null);
          toast.success("Candidate updated");
        },
        onError: (error: Error) =>
          toast.error(error.message || "Failed to update candidate"),
      },
    );
  }

  function saveBio() {
    const v = form.getValues();
    const parsed = updateCandidateSchema.safeParse({
      id: candidate.id,
      description: v.description ?? "",
    });
    if (!parsed.success) {
      toast.error(firstZodIssueMessage(parsed.error));
      return;
    }
    updateMutation.mutate(
      {
        id: parsed.data.id,
        description: parsed.data.description,
      },
      {
        onSuccess: () => {
          setEditingSection(null);
          toast.success("Candidate updated");
        },
        onError: (error: Error) =>
          toast.error(error.message || "Failed to update candidate"),
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

  return (
    <div className="space-y-4 pt-4">
      <CandidateOverviewStatsCard
        campaignCount={campaignCount}
        supporterCount={supporterCount}
        canvasserCount={canvasserCount}
      />
      <CandidateOverviewProfileCard
        candidate={candidate}
        form={form}
        editingSection={editingSection}
        isUpdatePending={updateMutation.isPending}
        campaignCount={campaignCount}
        beginSectionEdit={beginSectionEdit}
        cancelSectionEdit={cancelSectionEdit}
        saveIdentity={saveIdentity}
        saveElectoral={saveElectoral}
        saveContact={saveContact}
        saveBio={saveBio}
        handleEditPositionChange={handleEditPositionChange}
        handleEditStateChange={handleEditStateChange}
        handlePresetChange={handlePresetChange}
        initialPartyMode={initialPartyMode}
        initialTitleMode={initialTitleMode}
        stateGroups={stateGroups}
        selectedPosition={selectedPosition}
        selectedStateCode={selectedStateCode}
        selectedStateName={selectedStateName}
        constituencyLgaIds={constituencyLgaIds}
        showStateField={showStateField}
        showLgaGrid={showLgaGrid}
        showBoundaryGrid={showBoundaryGrid}
        stateHasNoLgas={stateHasNoLgas}
        hasPartialLgas={hasPartialLgas}
        expectedLgaCount={expectedLgaCount}
        lgas={lgas}
        lgasLoading={lgasLoading}
        lgasFetching={lgasFetching}
        hasPresets={hasPresets}
        availablePresets={availablePresets}
        unsupportedPresets={unsupportedPresets}
        effectivePresetShortName={effectivePresetShortName}
        effectivePresetMatchResult={effectivePresetMatchResult}
        boundaryHelperText={boundaryHelperText}
        editBoundaryWarnings={editBoundaryWarnings}
        summaryBoundaryWarnings={summaryBoundaryWarnings}
        visibleSummaryLgaChips={visibleSummaryLgaChips}
        remainingSummaryLgaCount={remainingSummaryLgaCount}
        summaryLgaSectionCount={summaryLgaNames.length}
        showCampaignBoundaryReviewNote={showCampaignBoundaryReviewNote}
      />
    </div>
  );
}
