"use client";

import { type UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

          {selectedCandidate && (
            <div className="bg-muted/50 space-y-1 rounded-sm border px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{selectedCandidate.name}</p>
                <Badge
                  variant="outline"
                  className="shrink-0 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                >
                  {selectedCandidate.party}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">
                {selectedCandidate.position}
                {selectedCandidate.constituency &&
                  ` · ${selectedCandidate.constituency}`}
                {selectedCandidate.stateCode &&
                  ` · ${selectedCandidate.stateCode}`}
              </p>
            </div>
          )}

          {/* Candidate Title (optional) */}
          <div className="space-y-1.5">
            <FieldLabel optional>Candidate Title</FieldLabel>
            <Input
              value={watch("candidateTitle") || ""}
              onChange={(e) => setValue("candidateTitle", e.target.value)}
              placeholder="e.g. His Excellency, Sen."
              className="rounded-sm"
            />
          </div>
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

        {/* Constituency */}
        <div className="space-y-3">
          <SectionLabel
            title="Constituency"
            subtitle="The electoral constituency for this campaign"
          />
          <div className="space-y-1.5">
            <FieldLabel>Constituency *</FieldLabel>
            <Input
              value={watch("constituency")}
              onChange={(e) =>
                setValue("constituency", e.target.value, {
                  shouldValidate: true,
                })
              }
              placeholder="e.g. Adamawa North"
              className="rounded-sm"
            />
            <FieldError error={errors.constituency?.message} />
          </div>
        </div>

        {/* Constituency Type */}
        <div className="space-y-3">
          <SectionLabel
            title="Constituency Type"
            subtitle="The scope level of the position"
          />
          <div className="space-y-1.5">
            <FieldLabel>Type *</FieldLabel>
            <Select
              value={watch("constituencyType")}
              onValueChange={(v) =>
                setValue("constituencyType", v as "federal" | "state" | "lga", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="rounded-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="federal">Federal</SelectItem>
                <SelectItem value="state">State</SelectItem>
                <SelectItem value="lga">LGA</SelectItem>
              </SelectContent>
            </Select>
            <FieldError error={errors.constituencyType?.message} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <NavButtons onBack={onBack} onNext={onNext} />
      </div>
    </StepCard>
  );
}
