"use client";

import { useState, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  IconArrowLeft,
  IconCheck,
  IconLoader2,
  IconClipboardList,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  StepCard,
  CardSectionHeader,
  SectionLabel,
  FieldLabel,
} from "@/components/collect/form-ui";
import { LgaCheckboxGrid } from "@/components/admin/shared/lga-checkbox-grid";
import { useGeoLgas } from "@/hooks/use-geo";
import { positionRequiresLgas } from "@/lib/utils/constituency";
import type { CreateCampaignData } from "@/lib/schemas/collect-schemas";

type CandidateInfo = {
  id: string;
  name: string;
  party: string;
  position: string;
  constituency: string;
  stateCode: string;
  constituencyLgaIds: number[];
};

interface StepQuestionsReviewProps {
  form: UseFormReturn<CreateCampaignData>;
  isSubmitting: boolean;
  selectedCandidate?: CandidateInfo;
  onBack: () => void;
  onSubmit: () => void;
}

export function StepQuestionsReview({
  form,
  isSubmitting,
  selectedCandidate,
  onBack,
  onSubmit,
}: StepQuestionsReviewProps) {
  const { register, watch, setValue, setError, clearErrors } = form;
  const [restrictMode, setRestrictMode] = useState(false);

  const slug = watch("slug");
  const enabledLgaIds = watch("enabledLgaIds");
  const customQuestion1 = watch("customQuestion1");
  const customQuestion2 = watch("customQuestion2");

  // Only fetch LGAs when candidate has constituency LGAs and we might need to show the grid
  const needsLgas =
    selectedCandidate && positionRequiresLgas(selectedCandidate.position);
  const { data: lgaResponse, isLoading: lgasLoading } = useGeoLgas(
    needsLgas ? selectedCandidate.stateCode : null,
    { pageSize: 200 },
  );

  // Filter to only LGAs that belong to the candidate's constituency
  const candidateLgas = useMemo(() => {
    if (!lgaResponse || !selectedCandidate) return [];
    return lgaResponse.data
      .filter((l) => selectedCandidate.constituencyLgaIds.includes(l.id))
      .map((l) => ({ id: l.id, name: l.name }));
  }, [lgaResponse, selectedCandidate]);

  // Position-aware LGA display
  const lgaDisplayValue = selectedCandidate
    ? selectedCandidate.position === "President"
      ? "Nationwide"
      : selectedCandidate.position === "Governor"
        ? `All LGAs in ${selectedCandidate.stateCode || "state"}`
        : restrictMode && enabledLgaIds.length > 0
          ? `${enabledLgaIds.length} of ${selectedCandidate.constituencyLgaIds.length} LGAs (restricted)`
          : selectedCandidate.constituencyLgaIds.length > 0
            ? `${selectedCandidate.constituencyLgaIds.length} LGA${selectedCandidate.constituencyLgaIds.length !== 1 ? "s" : ""}`
            : "—"
    : "—";

  function handleRestrictToggle(enabled: boolean) {
    setRestrictMode(enabled);
    if (!enabled) {
      // Reset to empty = inherit all from candidate
      clearErrors("enabledLgaIds");
      setValue("enabledLgaIds", [], { shouldValidate: true });
    } else {
      // Pre-fill with candidate's full set
      setValue("enabledLgaIds", selectedCandidate?.constituencyLgaIds ?? [], {
        shouldValidate: true,
      });
    }
  }

  function handleCreateCampaign() {
    if (restrictMode && enabledLgaIds.length === 0) {
      setError("enabledLgaIds", {
        type: "manual",
        message:
          "Select at least one LGA or turn off restriction to inherit the full constituency.",
      });
      return;
    }

    clearErrors("enabledLgaIds");
    onSubmit();
  }

  return (
    <StepCard>
      <CardSectionHeader
        title="Questions & Review"
        subtitle="Step 2"
        statusLabel="Final Review"
        icon={<IconClipboardList className="size-5" />}
      />

      <div className="space-y-7">
        {/* Custom Questions */}
        <div className="space-y-4">
          <SectionLabel
            title="Custom Questions"
            subtitle="Add optional survey questions for supporters"
          />

          <div className="space-y-1.5">
            <FieldLabel optional>Custom Question 1</FieldLabel>
            <Input
              {...register("customQuestion1")}
              placeholder="e.g. What ward-level issues concern you most?"
              className="rounded-sm"
            />
          </div>

          <div className="space-y-1.5">
            <FieldLabel optional>Custom Question 2</FieldLabel>
            <Input
              {...register("customQuestion2")}
              placeholder="e.g. How did you hear about this campaign?"
              className="rounded-sm"
            />
          </div>
        </div>

        {/* Advanced: Restrict to part of constituency */}
        {needsLgas && candidateLgas.length > 1 && (
          <div className="space-y-4">
            <SectionLabel
              title="Advanced"
              subtitle="Optionally narrow the collection area"
            />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  Restrict to part of constituency
                </p>
                <p className="text-muted-foreground text-xs">
                  Deselect LGAs to exclude from this campaign
                </p>
              </div>
              <Switch
                checked={restrictMode}
                onCheckedChange={handleRestrictToggle}
              />
            </div>

            {restrictMode && (
              <LgaCheckboxGrid
                lgas={candidateLgas}
                selectedIds={enabledLgaIds}
                onToggle={(lgaId) => {
                  const ids = enabledLgaIds.includes(lgaId)
                    ? enabledLgaIds.filter((id) => id !== lgaId)
                    : [...enabledLgaIds, lgaId];
                  setValue("enabledLgaIds", ids, { shouldValidate: true });
                }}
                onSelectAll={() =>
                  setValue(
                    "enabledLgaIds",
                    candidateLgas.map((l) => l.id),
                    { shouldValidate: true },
                  )
                }
                onClearAll={() =>
                  setValue("enabledLgaIds", [], { shouldValidate: true })
                }
                loading={lgasLoading}
                label="Campaign LGAs"
                helperText="Select the LGAs that should remain available on this campaign"
                error={form.formState.errors.enabledLgaIds?.message}
              />
            )}
          </div>
        )}

        {/* Review Summary */}
        <div className="space-y-4">
          <SectionLabel
            title="Review Summary"
            subtitle="Confirm all details before creating"
          />

          <div className="bg-muted/30 divide-border/40 divide-y rounded-sm border">
            <ReviewRow
              label="Candidate"
              value={selectedCandidate?.name || "—"}
            />
            <ReviewRow label="Party" value={selectedCandidate?.party || "—"} />
            <ReviewRow label="Slug" value={`/c/${slug}`} mono />
            <ReviewRow
              label="Position"
              value={selectedCandidate?.position || "—"}
            />
            <ReviewRow
              label="Constituency"
              value={selectedCandidate?.constituency || "—"}
            />
            <ReviewRow label="Collection Area" value={lgaDisplayValue} />
            {customQuestion1 && (
              <ReviewRow label="Q1" value={customQuestion1} />
            )}
            {customQuestion2 && (
              <ReviewRow label="Q2" value={customQuestion2} />
            )}
          </div>
        </div>
      </div>

      {/* Custom submit buttons */}
      <div className="mt-8 flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="hover:bg-muted/10 h-11 rounded-sm px-8 font-mono text-[11px] font-bold tracking-widest uppercase"
        >
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleCreateCampaign}
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary/95 h-11 flex-1 rounded-sm font-mono text-[11px] font-bold tracking-widest uppercase transition-all active:scale-95"
        >
          {isSubmitting ? (
            <IconLoader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <IconCheck className="mr-2 size-4" />
          )}
          Create Campaign
        </Button>
      </div>
    </StepCard>
  );
}

function ReviewRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={`truncate text-right font-medium ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
