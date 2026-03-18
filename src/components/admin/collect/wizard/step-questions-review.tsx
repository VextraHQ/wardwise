"use client";

import { UseFormReturn } from "react-hook-form";
import { IconArrowLeft, IconCheck, IconLoader2, IconClipboardList } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  StepCard,
  CardSectionHeader,
  SectionLabel,
  FieldLabel,
} from "@/components/collect/form-ui";
import type { CreateCampaignData } from "@/lib/schemas/collect-schemas";

type Lga = { id: number; name: string };

interface StepQuestionsReviewProps {
  form: UseFormReturn<CreateCampaignData>;
  lgas: Lga[] | undefined;
  isSubmitting: boolean;
  candidatePosition?: string;
  candidateState?: string;
  onBack: () => void;
  onSubmit: () => void;
}

export function StepQuestionsReview({
  form,
  lgas,
  isSubmitting,
  candidatePosition,
  candidateState,
  onBack,
  onSubmit,
}: StepQuestionsReviewProps) {
  const { register, watch } = form;

  const candidateName = watch("candidateName");
  const party = watch("party");
  const slug = watch("slug");
  const constituency = watch("constituency");
  const constituencyType = watch("constituencyType");
  const enabledLgaIds = watch("enabledLgaIds");
  const customQuestion1 = watch("customQuestion1");
  const customQuestion2 = watch("customQuestion2");

  const selectedLgaNames = lgas
    ?.filter((l) => enabledLgaIds.includes(l.id))
    .map((l) => l.name);

  // Position-aware LGA display
  const lgaDisplayValue =
    candidatePosition === "President"
      ? "Nationwide"
      : candidatePosition === "Governor"
        ? `All LGAs in ${candidateState || "state"}`
        : selectedLgaNames && selectedLgaNames.length <= 5
          ? selectedLgaNames.join(", ")
          : `${enabledLgaIds.length} selected`;

  return (
    <StepCard>
      <CardSectionHeader
        title="Questions & Review"
        subtitle="Step 3"
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

        {/* Review Summary */}
        <div className="space-y-4">
          <SectionLabel
            title="Review Summary"
            subtitle="Confirm all details before creating"
          />

          <div className="bg-muted/30 divide-border/40 divide-y rounded-sm border">
            <ReviewRow label="Candidate" value={candidateName} />
            <ReviewRow label="Party" value={party} />
            <ReviewRow label="Slug" value={`/c/${slug}`} mono />
            <ReviewRow label="Constituency" value={constituency} />
            <ReviewRow label="Type" value={constituencyType} capitalize />
            <ReviewRow label="LGAs" value={lgaDisplayValue} />
            <ReviewRow label="APC/NIN" value="Required" />
            <ReviewRow label="Voter ID" value="Required" />
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
          onClick={onSubmit}
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
  capitalize: cap,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={`truncate text-right font-medium ${mono ? "font-mono text-xs" : ""} ${cap ? "capitalize" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
