"use client";

import { useState, useRef } from "react";
import { useUpdateCandidate } from "@/features/admin/hooks/use-admin";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { CandidateWithUser } from "@/features/admin/api/admin-api";
import {
  updateCandidateSchema,
  type UpdateCandidateFormValues,
} from "@/features/candidates/schemas/candidate-schemas";
import {
  nigeriaStates,
  getLGAsByState,
} from "@/features/geo/data/state-lga-locations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGeoLgas } from "@/features/geo/hooks/use-geo";
import {
  NIGERIAN_PARTIES,
  CANDIDATE_TITLES,
  CANDIDATE_PARTY_OTHER_OPTION,
  CANDIDATE_TITLE_OTHER_OPTION,
} from "@/features/candidates/data/nigerian-parties";
import { ListOrCustomField } from "@/features/admin/components/shared/list-or-custom-field";
import {
  IconPencil,
  IconX,
  IconDeviceFloppy,
  IconUsers,
  IconBuildingCommunity,
  IconClipboardList,
} from "@tabler/icons-react";
import { useMemo, useEffect } from "react";
import type { ZodError } from "zod";
import { LgaCheckboxGrid } from "@/features/admin/components/shared/lga-checkbox-grid";
import { ConstituencyBoundaryAlerts } from "@/features/admin/components/shared/constituency-boundary-alerts";
import { OfficialConstituencySelector } from "@/features/admin/components/shared/official-constituency-selector";
import {
  positionRequiresLgas,
  autoConstituencyName,
  getConstituencyBoundaryWarnings,
  matchPresetToSeededIds,
  findMatchingPreset,
} from "@/features/geo/lib/constituency";
import {
  getPresetsForState,
  getUnsupportedPresetsForState,
} from "@/features/geo/data/nigerian-constituencies";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

type EditingSection = "identity" | "electoral" | "contact" | "bio";

const LGA_CHIP_DISPLAY_LIMIT = 4;

function buildCandidateFormDefaults(
  candidate: CandidateWithUser,
): UpdateCandidateFormValues {
  return {
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
  };
}

function firstZodIssueMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}

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
        position: d.position as (typeof POSITIONS)[number],
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

  const stats = [
    {
      label: "Campaigns",
      value: campaignCount,
      hint: "Collect campaigns created for this candidate",
      icon: IconClipboardList,
    },
    {
      label: "Supporters",
      value: supporterCount,
      hint: "Unique supporters recorded from Collect submissions",
      icon: IconUsers,
    },
    {
      label: "Canvassers",
      value: canvasserCount,
      hint: "Field agents assigned to this candidate",
      icon: IconBuildingCommunity,
    },
  ];

  return (
    <div className="space-y-4 pt-4">
      <Card
        className="border-border/60 gap-0 overflow-hidden rounded-sm p-0 shadow-none"
        role="region"
        aria-label="Collect activity"
      >
        <CardContent className="p-0">
          <div className="divide-border/60 divide-y sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-row items-center justify-between gap-3 px-4 py-3 sm:flex-col sm:items-stretch sm:gap-3 sm:px-6 sm:py-4"
                title={stat.hint}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:w-full sm:flex-initial sm:items-start sm:justify-between sm:gap-3">
                  <div className="bg-primary/10 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm sm:order-2 sm:h-8 sm:w-8">
                    <stat.icon
                      className="text-primary size-3.5 sm:size-4"
                      aria-hidden
                    />
                  </div>
                  <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase sm:order-1">
                    {stat.label}
                  </p>
                </div>
                <p className="text-foreground font-mono text-lg leading-none font-semibold tracking-tight tabular-nums sm:w-full sm:text-2xl sm:leading-none">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Candidate profile — wizard-style sections */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader className="border-border/60 border-b">
          <CardTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
            Candidate profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            {/* Summary — same label/value rhythm as Account Information */}
            <div className="space-y-4">
              <p className="text-foreground/70 font-mono text-[10px] font-bold tracking-widest uppercase">
                Candidate summary
              </p>
              <p className="text-foreground text-base font-semibold tracking-tight wrap-break-word">
                {candidate.title ? `${candidate.title} ` : ""}
                {candidate.name}
              </p>
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                    Login email
                  </p>
                  <p className="text-foreground mt-0.5 font-medium wrap-break-word">
                    {candidate.user?.email ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                    Party
                  </p>
                  <p className="text-foreground mt-0.5 font-medium">
                    {candidate.party || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                    Position
                  </p>
                  <p className="text-foreground mt-0.5 font-medium">
                    {candidate.position}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                    State
                  </p>
                  <p className="text-foreground mt-0.5 font-medium">
                    {resolveStateName(candidate.stateCode)}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                    Constituency
                  </p>
                  <p className="text-foreground mt-0.5 font-medium wrap-break-word">
                    {candidate.constituency || "—"}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground font-mono text-[10px] tracking-wide">
                Last updated{" "}
                {new Date(candidate.updatedAt).toLocaleString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Identity */}
            <div className="border-border/40 space-y-3 border-t pt-5">
              <OverviewSectionHeader
                eyebrow="Identity"
                showEdit={editingSection !== "identity"}
                onEdit={() => beginSectionEdit("identity")}
                editDisabled={updateMutation.isPending}
              />
              {editingSection === "identity" ? (
                <div className="space-y-4">
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
                            customHintId="overview-custom-title-hint"
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
                          customHintId="overview-custom-party-hint"
                          initialMode={initialPartyMode}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse sm:items-center sm:justify-start">
                    <Button
                      type="button"
                      size="sm"
                      disabled={updateMutation.isPending}
                      className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                      onClick={saveIdentity}
                    >
                      <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                      disabled={updateMutation.isPending}
                      onClick={cancelSectionEdit}
                    >
                      <IconX className="mr-1.5 h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  <OverviewField label="Title" value={candidate.title || "—"} />
                  <OverviewField label="Name" value={candidate.name} />
                  <OverviewField label="Party" value={candidate.party} />
                </div>
              )}
            </div>

            {/* Electoral profile */}
            <div className="border-border/40 space-y-3 border-t pt-5">
              <OverviewSectionHeader
                eyebrow="Electoral profile"
                showEdit={editingSection !== "electoral"}
                onEdit={() => beginSectionEdit("electoral")}
                editDisabled={updateMutation.isPending}
              />
              {editingSection === "electoral" ? (
                <div className="space-y-4">
                  {campaignCount > 0 && (
                    <div className="border-border/50 bg-muted/20 rounded-sm border px-3 py-2.5">
                      <p className="text-foreground text-xs font-medium">
                        {campaignCount} Collect campaign
                        {campaignCount === 1 ? "" : "s"} linked — boundary and
                        office changes can affect coverage and links.
                      </p>
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                          Position
                        </FormLabel>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={handleEditPositionChange}
                        >
                          <FormControl>
                            <SelectTrigger
                              className="border-border/60 h-9 w-full rounded-sm"
                              aria-label="Electoral position"
                            >
                              <SelectValue placeholder="Select position…" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent
                            className="rounded-sm"
                            position="popper"
                            sideOffset={4}
                          >
                            {POSITIONS.map((pos) => (
                              <SelectItem
                                key={pos}
                                value={pos}
                                className="rounded-sm"
                              >
                                {pos}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <p className="text-foreground/70 font-mono text-[9px] font-bold tracking-widest uppercase">
                    {selectedPosition === "President"
                      ? "Location"
                      : "Electoral boundary"}
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
                          {subtitle ? (
                            <p className="text-muted-foreground text-[11px]">
                              {subtitle}
                            </p>
                          ) : null}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <ConstituencyBoundaryAlerts warnings={editBoundaryWarnings} />

                  <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse sm:items-center sm:justify-start">
                    <Button
                      type="button"
                      size="sm"
                      disabled={updateMutation.isPending}
                      className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                      onClick={saveElectoral}
                    >
                      <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                      disabled={updateMutation.isPending}
                      onClick={cancelSectionEdit}
                    >
                      <IconX className="mr-1.5 h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                    <OverviewField
                      label="Position"
                      value={candidate.position}
                    />
                    <OverviewField
                      label="State"
                      value={resolveStateName(candidate.stateCode)}
                    />
                    <OverviewField
                      label="Constituency"
                      value={candidate.constituency || "—"}
                    />
                  </div>
                  {summaryLgaNames.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
                        Boundary LGAs ({summaryLgaNames.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {visibleSummaryLgaChips.map((name) => (
                          <Badge
                            key={name}
                            variant="outline"
                            className="border-border/60 bg-card rounded-sm px-2 py-0.5 text-[10px] font-medium"
                          >
                            {name}
                          </Badge>
                        ))}
                        {remainingSummaryLgaCount > 0 ? (
                          <Badge
                            variant="outline"
                            className="border-border/60 bg-muted/40 text-muted-foreground rounded-sm px-2 py-0.5 text-[10px] font-medium"
                          >
                            +{remainingSummaryLgaCount} more
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  )}
                  <ConstituencyBoundaryAlerts
                    warnings={summaryBoundaryWarnings}
                  />
                  {showCampaignBoundaryReviewNote ? (
                    <div className="border-border/50 bg-muted/20 rounded-sm border px-3 py-2.5">
                      <p className="text-foreground text-xs font-medium">
                        {campaignCount} existing Collect campaign
                        {campaignCount === 1 ? "" : "s"} use
                        {campaignCount === 1 ? "s" : ""} this saved boundary.
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        If you edit this boundary later, review campaign
                        coverage in the Campaigns tab.
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="border-border/40 space-y-3 border-t pt-5">
              <OverviewSectionHeader
                eyebrow="Contact"
                showEdit={editingSection !== "contact"}
                onEdit={() => beginSectionEdit("contact")}
                editDisabled={updateMutation.isPending}
              />
              {editingSection === "contact" ? (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                          Login email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="candidate@wardwise.ng"
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
                  <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse sm:items-center sm:justify-start">
                    <Button
                      type="button"
                      size="sm"
                      disabled={updateMutation.isPending}
                      className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                      onClick={saveContact}
                    >
                      <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                      disabled={updateMutation.isPending}
                      onClick={cancelSectionEdit}
                    >
                      <IconX className="mr-1.5 h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  <OverviewField
                    label="Login email"
                    value={candidate.user?.email || "—"}
                  />
                  <OverviewField label="Phone" value={candidate.phone || "—"} />
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="border-border/40 space-y-3 border-t pt-5">
              <OverviewSectionHeader
                eyebrow="Bio"
                showEdit={editingSection !== "bio"}
                onEdit={() => beginSectionEdit("bio")}
                editDisabled={updateMutation.isPending}
              />
              {editingSection === "bio" ? (
                <div className="space-y-4">
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
                  <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse sm:items-center sm:justify-start">
                    <Button
                      type="button"
                      size="sm"
                      disabled={updateMutation.isPending}
                      className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                      onClick={saveBio}
                    >
                      <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                      disabled={updateMutation.isPending}
                      onClick={cancelSectionEdit}
                    >
                      <IconX className="mr-1.5 h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <OverviewField
                  label="Description"
                  value={candidate.description || "—"}
                />
              )}
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function OverviewSectionHeader({
  eyebrow,
  showEdit,
  onEdit,
  editDisabled,
}: {
  eyebrow: string;
  showEdit: boolean;
  onEdit: () => void;
  editDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-foreground/70 font-mono text-[10px] font-bold tracking-widest uppercase">
        {eyebrow}
      </p>
      {showEdit ? (
        <button
          type="button"
          onClick={onEdit}
          disabled={editDisabled}
          aria-label={`Edit ${eyebrow}`}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/60 focus-visible:ring-primary/40 inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
        >
          Edit
          <IconPencil className="size-2.5" />
        </button>
      ) : null}
    </div>
  );
}

function OverviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
        {label}
      </p>
      <p className="text-foreground text-xs font-medium wrap-break-word">
        {value || "—"}
      </p>
    </div>
  );
}
