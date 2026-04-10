"use client";

import { type UseFormReturn } from "react-hook-form";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  StepCard,
  CardSectionHeader,
  SectionLabel,
  NavButtons,
} from "@/components/collect/form-ui";
import { IconChecklist } from "@tabler/icons-react";
import type { CreateCandidateFormValues } from "@/lib/schemas/admin-schemas";
import { nigeriaStates, getLGAsByState } from "@/lib/data/state-lga-locations";
import { useGeoLgas } from "@/hooks/use-geo";
import {
  autoConstituencyName,
  getConstituencyBoundaryWarnings,
  positionRequiresLgas,
  findMatchingPreset,
} from "@/lib/geo/constituency";
import { ConstituencyBoundaryAlerts } from "@/components/admin/shared/constituency-boundary-alerts";
import { getPresetsForState } from "@/lib/data/nigerian-constituencies";

function resolveStateName(stateCode: string | null | undefined): string {
  if (!stateCode) return "—";
  return nigeriaStates.find((s) => s.code === stateCode)?.name ?? stateCode;
}

interface StepReviewProps {
  form: UseFormReturn<CreateCandidateFormValues>;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function StepReview({
  form,
  isSubmitting,
  onBack,
  onSubmit,
}: StepReviewProps) {
  const { watch, setValue } = form;

  const data = watch();
  const requiresLgas = positionRequiresLgas(data.position || "");
  const { data: lgaResponse } = useGeoLgas(
    requiresLgas && data.stateCode ? data.stateCode : null,
    { pageSize: 200 },
  );
  const selectedLgaNames = useMemo(
    () =>
      (lgaResponse?.data ?? [])
        .filter((lga) => data.constituencyLgaIds.includes(lga.id))
        .map((lga) => lga.name),
    [data.constituencyLgaIds, lgaResponse],
  );
  const matchingPreset = useMemo(() => {
    if (
      !data.position ||
      !data.stateCode ||
      !positionRequiresLgas(data.position)
    ) {
      return null;
    }

    const presets = getPresetsForState(
      data.position as
        | "Senator"
        | "House of Representatives"
        | "State Assembly",
      data.stateCode,
    );

    return findMatchingPreset(
      data.constituencyLgaIds,
      (lgaResponse?.data ?? []).map((lga) => ({ id: lga.id, name: lga.name })),
      presets,
    );
  }, [data.constituencyLgaIds, data.position, data.stateCode, lgaResponse]);
  const boundaryWarnings = useMemo(
    () =>
      getConstituencyBoundaryWarnings({
        position: data.position,
        stateName: resolveStateName(data.stateCode),
        selectedLgaCount: data.constituencyLgaIds.length,
        expectedLgaCount: data.stateCode
          ? getLGAsByState(data.stateCode).length
          : 0,
        constituencyName: data.constituency,
        autoSuggestedName: autoConstituencyName(selectedLgaNames),
        presetMismatchInfo: matchingPreset
          ? {
              hasPresets: true,
              activePresetName:
                data.constituency === matchingPreset.name
                  ? matchingPreset.name
                  : undefined,
              officialPresetName: matchingPreset.name,
              isDeviated: false,
              manuallyMatchesPreset: true,
            }
          : undefined,
      }),
    [
      data.constituency,
      data.constituencyLgaIds,
      data.position,
      data.stateCode,
      matchingPreset,
      selectedLgaNames,
    ],
  );

  const reviewFields = [
    { label: "Title", value: data.title || "—" },
    { label: "Name", value: data.name },
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone || "—" },
    { label: "Position", value: data.position },
    { label: "State", value: resolveStateName(data.stateCode) },
    ...(data.constituencyLgaIds.length > 0
      ? [
          {
            label: "Boundary LGAs",
            value: `${data.constituencyLgaIds.length} selected`,
          },
        ]
      : []),
    { label: "Constituency", value: data.constituency },
  ];

  return (
    <StepCard>
      <CardSectionHeader
        title="Review & Submit"
        subtitle="Step 3"
        statusLabel="Candidate Registration"
        icon={<IconChecklist className="size-5" />}
      />

      <div className="space-y-4">
        {/* Summary */}
        <div className="space-y-3">
          <SectionLabel
            title="Candidate Summary"
            subtitle="Review the details before creating the account"
          />
          <div className="bg-muted/50 space-y-3 rounded-sm border p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">
                {data.title ? `${data.title} ` : ""}
                {data.name || "—"}
              </p>
              {data.party && (
                <Badge
                  variant="outline"
                  className="shrink-0 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                >
                  {data.party}
                </Badge>
              )}
            </div>

            <div className="border-border/40 grid grid-cols-2 gap-x-6 gap-y-2 border-t pt-3">
              {reviewFields.map((field) => (
                <div key={field.label} className="space-y-0.5">
                  <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
                    {field.label}
                  </p>
                  <p className="text-foreground text-xs font-medium">
                    {field.value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description (optional, editable here too) */}
        <div className="space-y-3">
          <SectionLabel
            title="Description"
            subtitle="Optional bio or notes about the candidate"
          />
          <div className="space-y-1.5">
            <Textarea
              aria-label="Description"
              value={data.description || ""}
              onChange={(e) => setValue("description", e.target.value)}
              placeholder="Brief description of the candidate..."
              rows={3}
              className="border-border/60 rounded-sm"
            />
          </div>
        </div>

        <ConstituencyBoundaryAlerts warnings={boundaryWarnings} />
      </div>

      <div className="mt-4">
        <NavButtons
          onBack={onBack}
          onNext={onSubmit}
          nextLabel="Create Candidate"
          isLoading={isSubmitting}
          nextDisabled={isSubmitting}
        />
      </div>
    </StepCard>
  );
}
