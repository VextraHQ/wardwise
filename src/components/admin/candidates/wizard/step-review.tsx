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
import { IconChecklist, IconPencil } from "@tabler/icons-react";
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

const LGA_CHIP_DISPLAY_LIMIT = 4;

interface StepReviewProps {
  form: UseFormReturn<CreateCandidateFormValues>;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onEditStep?: (stepIndex: number) => void;
}

interface ReviewSectionProps {
  eyebrow: string;
  editStep?: number;
  onEditStep?: (stepIndex: number) => void;
  children: React.ReactNode;
}

function ReviewSection({
  eyebrow,
  editStep,
  onEditStep,
  children,
}: ReviewSectionProps) {
  const canEdit = onEditStep && typeof editStep === "number";
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-foreground/70 font-mono text-[10px] font-bold tracking-widest uppercase">
          {eyebrow}
        </p>
        {canEdit && (
          <button
            type="button"
            onClick={() => onEditStep!(editStep!)}
            aria-label={`Edit ${eyebrow.toLowerCase()}`}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/60 focus-visible:ring-primary/40 inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            Edit
            <IconPencil className="size-2.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
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

export function StepReview({
  form,
  isSubmitting,
  onBack,
  onSubmit,
  onEditStep,
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

  const visibleLgaChips = selectedLgaNames.slice(0, LGA_CHIP_DISPLAY_LIMIT);
  const remainingLgaCount = Math.max(
    0,
    selectedLgaNames.length - visibleLgaChips.length,
  );

  return (
    <StepCard>
      <CardSectionHeader
        title="Review & Submit"
        subtitle="Step 4"
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
          <div className="bg-muted/50 space-y-4 rounded-sm border p-4">
            {/* Hero — name + party */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-foreground min-w-0 truncate text-sm font-medium">
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

            {/* Identity section */}
            <div className="border-border/40 border-t pt-3">
              <ReviewSection
                eyebrow="Identity"
                editStep={0}
                onEditStep={onEditStep}
              >
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                  <ReviewField label="Title" value={data.title || "—"} />
                  <ReviewField label="Name" value={data.name} />
                  <ReviewField label="Email" value={data.email} />
                  <ReviewField label="Phone" value={data.phone || "—"} />
                </div>
              </ReviewSection>
            </div>

            {/* Office section */}
            <div className="border-border/40 border-t pt-3">
              <ReviewSection
                eyebrow="Electoral Office"
                editStep={1}
                onEditStep={onEditStep}
              >
                <ReviewField label="Position" value={data.position} />
              </ReviewSection>
            </div>

            {/* Boundary section */}
            <div className="border-border/40 border-t pt-3">
              <ReviewSection
                eyebrow="Electoral Boundary"
                editStep={2}
                onEditStep={onEditStep}
              >
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                  <ReviewField
                    label="State"
                    value={resolveStateName(data.stateCode)}
                  />
                  <ReviewField label="Constituency" value={data.constituency} />
                </div>
                {selectedLgaNames.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
                      Boundary LGAs ({selectedLgaNames.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {visibleLgaChips.map((name) => (
                        <Badge
                          key={name}
                          variant="outline"
                          className="border-border/60 bg-card rounded-sm px-2 py-0.5 text-[10px] font-medium"
                        >
                          {name}
                        </Badge>
                      ))}
                      {remainingLgaCount > 0 && (
                        <Badge
                          variant="outline"
                          className="border-border/60 bg-muted/40 text-muted-foreground rounded-sm px-2 py-0.5 text-[10px] font-medium"
                        >
                          +{remainingLgaCount} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </ReviewSection>
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
