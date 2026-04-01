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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGeoLgas } from "@/hooks/use-geo";
import {
  NIGERIAN_PARTIES,
  CANDIDATE_TITLES,
} from "@/lib/data/nigerian-parties";
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
import {
  positionRequiresLgas,
  autoConstituencyName,
  getConstituencyBoundaryWarnings,
  matchPresetToSeededIds,
} from "@/lib/utils/constituency";
import { getPresetsForState } from "@/lib/data/nigerian-constituencies";

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

  const { data: lgaResponse, isLoading: lgasLoading } = useGeoLgas(
    editing && showLgaGrid && selectedStateCode ? selectedStateCode : null,
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
      editing && showLgaGrid && selectedPosition && selectedStateCode
        ? getPresetsForState(
            selectedPosition as "Senator" | "House of Representatives" | "State Assembly",
            selectedStateCode,
          )
        : [],
    [editing, showLgaGrid, selectedPosition, selectedStateCode],
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
              activePresetName: selectedPresetShortName ?? undefined,
              isDeviated: isPresetDeviated,
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
      isPresetDeviated,
      selectedPosition,
      selectedPresetShortName,
      selectedStateName,
      suggestedConstituency,
    ],
  );
  const summaryBoundaryWarnings = useMemo(
    () =>
      getConstituencyBoundaryWarnings({
        position: candidate.position,
        stateName: resolveStateName(candidate.stateCode),
        selectedLgaCount: candidate.constituencyLgaIds.length,
        expectedLgaCount: candidate.stateCode
          ? getLGAsByState(candidate.stateCode).length
          : 0,
        constituencyName: candidate.constituency,
        hasExistingCampaigns: campaignCount > 0,
      }),
    [
      campaignCount,
      candidate.constituency,
      candidate.constituencyLgaIds.length,
      candidate.position,
      candidate.stateCode,
    ],
  );
  const lastAutoConstituencyRef = useRef("");

  // Auto-suggest constituency from selected LGAs when editing
  useEffect(() => {
    if (!editing || !showLgaGrid || lgas.length === 0) {
      lastAutoConstituencyRef.current = "";
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
    form,
    lgas.length,
    showLgaGrid,
    suggestedConstituency,
  ]);

  function handlePresetChange(value: string) {
    if (value === "__custom__" || !value) {
      setSelectedPresetShortName(null);
      return;
    }
    const preset = availablePresets.find((p) => p.shortName === value);
    if (!preset) return;
    setSelectedPresetShortName(value);
    const { ids } = matchPresetToSeededIds(preset, lgas);
    form.setValue("constituencyLgaIds", ids, { shouldValidate: true });
    lastAutoConstituencyRef.current = preset.name;
    form.setValue("constituency", preset.name, { shouldValidate: false });
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
    form.setValue("position", value, { shouldValidate: true });
    form.setValue("stateCode", "", { shouldValidate: true });
    form.setValue("lga", "");
    form.setValue("constituencyLgaIds", [], { shouldValidate: true });
    setSelectedPresetShortName(null);

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

    if (selectedPosition === "Governor") {
      const stateName = nigeriaStates.find(
        (state) => state.code === value,
      )?.name;
      if (stateName) {
        form.setValue("constituency", `${stateName} State`, {
          shouldValidate: true,
        });
      }
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border/60 rounded-sm shadow-none"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                {stat.label}
              </CardTitle>
              <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-sm">
                <stat.icon className="text-primary h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="font-mono text-2xl font-semibold tabular-nums">
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
            Candidate Information
          </CardTitle>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
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
                          <ComboboxSelect
                            options={CANDIDATE_TITLES}
                            value={field.value || ""}
                            onValueChange={(val) => field.onChange(val)}
                            placeholder="Select title..."
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
                          <ComboboxSelect
                            options={NIGERIAN_PARTIES}
                            value={field.value || ""}
                            onValueChange={(val) => field.onChange(val)}
                            placeholder="Select party..."
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
                          <Select
                            onValueChange={handleEditPositionChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-border/60 rounded-sm">
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {POSITIONS.map((pos) => (
                                <SelectItem key={pos} value={pos}>
                                  {pos}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                      <ComboboxSelect
                        value={selectedPresetShortName ?? ""}
                        onValueChange={handlePresetChange}
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
                      {presetMatchResult &&
                        presetMatchResult.unmatchedNames.length > 0 && (
                          <p className="text-muted-foreground text-xs">
                            <span className="font-medium text-amber-600 dark:text-amber-500">
                              {presetMatchResult.unmatchedNames.length} LGA
                              {presetMatchResult.unmatchedNames.length > 1
                                ? "s"
                                : ""}{" "}
                              not yet seeded:
                            </span>{" "}
                            {presetMatchResult.unmatchedNames.join(", ")}
                          </p>
                        )}
                    </FormItem>
                  )}

                  {showLgaGrid && selectedStateCode && !stateHasNoLgas && (
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
                        helperText="Select the LGAs that form this constituency's boundary"
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                          Constituency Name
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

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updateMutation.isPending}
                    className="h-8 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
                  >
                    <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
                    {updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
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
