"use client";

import { useMemo } from "react";
import { type UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import {
  StepCard,
  CardSectionHeader,
  SectionLabel,
  FieldLabel,
  InputIcon,
  FieldError,
  NavButtons,
} from "@/components/collect/form-ui";
import { IconUser, IconLink } from "@tabler/icons-react";
import type { CreateCampaignData } from "@/lib/schemas/collect-schemas";
import { nigeriaStates, getLGAsByState } from "@/lib/data/state-lga-locations";
import { ConstituencyBoundaryAlerts } from "@/components/admin/shared/constituency-boundary-alerts";
import { getConstituencyBoundaryWarnings } from "@/lib/utils/constituency";

type CandidateOption = {
  value: string;
  label: string;
  description: string;
};

type CandidateInfo = {
  id: string;
  name: string;
  party: string;
  position: string;
  constituency: string;
  stateCode: string;
  constituencyLgaIds: number[];
};

interface StepCandidateSetupProps {
  form: UseFormReturn<CreateCampaignData>;
  candidateOptions: CandidateOption[];
  candidatesLoading: boolean;
  selectedCandidate?: CandidateInfo;
  onCandidateSelect: (candidateId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepCandidateSetup({
  form,
  candidateOptions,
  candidatesLoading,
  selectedCandidate,
  onCandidateSelect,
  onBack,
  onNext,
}: StepCandidateSetupProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const candidateId = watch("candidateId");
  const slug = watch("slug");
  const selectedStateName = useMemo(
    () =>
      nigeriaStates.find((state) => state.code === selectedCandidate?.stateCode)
        ?.name ?? selectedCandidate?.stateCode,
    [selectedCandidate?.stateCode],
  );
  const candidateBoundaryWarnings = useMemo(
    () =>
      selectedCandidate
        ? getConstituencyBoundaryWarnings({
            position: selectedCandidate.position,
            stateName: selectedStateName,
            selectedLgaCount: selectedCandidate.constituencyLgaIds.length,
            expectedLgaCount: selectedCandidate.stateCode
              ? getLGAsByState(selectedCandidate.stateCode).length
              : 0,
            constituencyName: selectedCandidate.constituency,
          })
        : [],
    [selectedCandidate, selectedStateName],
  );

  // Derive scope display
  const scopeDisplay = selectedCandidate
    ? selectedCandidate.position === "President"
      ? "Nationwide — all LGAs"
      : selectedCandidate.position === "Governor"
        ? `All LGAs in ${selectedStateName || "state"}`
        : selectedCandidate.constituencyLgaIds.length > 0
          ? `${selectedCandidate.constituencyLgaIds.length} LGA${selectedCandidate.constituencyLgaIds.length !== 1 ? "s" : ""}`
          : "No LGAs defined — edit candidate first"
    : null;

  return (
    <StepCard>
      <CardSectionHeader
        title="Select Candidate"
        subtitle="Step 1"
        statusLabel="Campaign Setup"
        icon={<IconUser className="size-5" />}
      />

      <div className="space-y-4">
        {/* Candidate Selection */}
        <div className="space-y-3">
          <SectionLabel
            title="Candidate"
            subtitle="Choose the candidate for this campaign"
          />
          <div className="space-y-1.5">
            <FieldLabel>Candidate *</FieldLabel>
            <ComboboxSelect
              options={candidateOptions}
              value={candidateId}
              onValueChange={onCandidateSelect}
              placeholder="Search candidates..."
              searchPlaceholder="Type a name..."
              emptyMessage="No candidates found."
              isLoading={candidatesLoading}
            />
            <FieldError error={errors.candidateId?.message} />
          </div>

          {/* Inherited scope summary */}
          {selectedCandidate && (
            <div className="space-y-3">
              <div className="bg-muted/50 space-y-2 rounded-sm border px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">
                    {selectedCandidate.name}
                  </p>
                  <Badge
                    variant="outline"
                    className="shrink-0 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                  >
                    {selectedCandidate.party}
                  </Badge>
                </div>
                <div className="text-muted-foreground space-y-0.5 text-xs">
                  <p>
                    <span className="font-medium">Position:</span>{" "}
                    {selectedCandidate.position}
                  </p>
                  {selectedCandidate.constituency && (
                    <p>
                      <span className="font-medium">Constituency:</span>{" "}
                      {selectedCandidate.constituency}
                    </p>
                  )}
                  {selectedCandidate.stateCode && (
                    <p>
                      <span className="font-medium">State:</span>{" "}
                      {selectedStateName}
                    </p>
                  )}
                  {scopeDisplay && (
                    <p>
                      <span className="font-medium">Collection Area:</span>{" "}
                      {scopeDisplay}
                    </p>
                  )}
                </div>
              </div>
              <ConstituencyBoundaryAlerts
                warnings={candidateBoundaryWarnings}
              />
            </div>
          )}
        </div>

        {/* Campaign Slug */}
        <div className="space-y-3">
          <SectionLabel
            title="Campaign URL"
            subtitle="The public link for this campaign"
          />
          <div className="space-y-1.5">
            <FieldLabel>Slug *</FieldLabel>
            <div className="relative">
              <InputIcon>
                <IconLink className="text-muted-foreground size-3.5" />
              </InputIcon>
              <Input
                value={slug}
                onChange={(e) => {
                  const value = e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");
                  setValue("slug", value, { shouldValidate: true });
                }}
                placeholder="campaign-slug"
                className="rounded-sm pl-11 font-mono text-sm"
              />
            </div>
            {slug && (
              <p className="text-muted-foreground text-xs">URL: /c/{slug}</p>
            )}
            <FieldError error={errors.slug?.message} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <NavButtons onBack={onBack} onNext={onNext} />
      </div>
    </StepCard>
  );
}
