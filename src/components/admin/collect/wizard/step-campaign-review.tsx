"use client";

import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import {
  StepCard,
  CardSectionHeader,
  SectionLabel,
  NavButtons,
} from "@/components/collect/form-ui";
import { IconChecklist, IconPencil } from "@tabler/icons-react";
import type { CreateCampaignData } from "@/lib/schemas/collect-schemas";
import {
  getCampaignBrandingLabel,
  getEffectiveCampaignName,
} from "@/lib/collect/branding";
import { positionRequiresLgas } from "@/lib/geo/constituency";

type CandidateInfo = {
  id: string;
  name: string;
  party: string;
  position: string;
  constituency: string;
  stateCode: string;
  constituencyLgaIds: number[];
};

interface StepCampaignReviewProps {
  form: UseFormReturn<CreateCampaignData>;
  isSubmitting: boolean;
  selectedCandidate?: CandidateInfo;
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

export function StepCampaignReview({
  form,
  isSubmitting,
  selectedCandidate,
  onBack,
  onSubmit,
  onEditStep,
}: StepCampaignReviewProps) {
  const { watch } = form;
  const slug = watch("slug");
  const brandingType = watch("brandingType");
  const displayName = watch("displayName");
  const enabledLgaIds = watch("enabledLgaIds");
  const customQuestion1 = watch("customQuestion1");
  const customQuestion2 = watch("customQuestion2");

  const campaignName = selectedCandidate
    ? getEffectiveCampaignName({
        candidateName: selectedCandidate.name,
        displayName,
      })
    : displayName?.trim() || "—";

  const needsLgas =
    selectedCandidate && positionRequiresLgas(selectedCandidate.position);

  const lgaSummary = useMemo(() => {
    if (!selectedCandidate) return "—";
    if (selectedCandidate.position === "President") return "Nationwide";
    if (selectedCandidate.position === "Governor")
      return `All LGAs in ${selectedCandidate.stateCode || "state"}`;
    const total = selectedCandidate.constituencyLgaIds.length;
    if (total === 0) return "—";
    if (enabledLgaIds.length === 0)
      return `Full constituency (${total} LGA${total !== 1 ? "s" : ""})`;
    if (enabledLgaIds.length === total)
      return `${total} LGA${total !== 1 ? "s" : ""} (full)`;
    return `${enabledLgaIds.length} of ${total} LGAs (restricted)`;
  }, [selectedCandidate, enabledLgaIds]);

  return (
    <StepCard>
      <CardSectionHeader
        title="Review & create"
        subtitle="Step 3"
        statusLabel="Campaign Setup"
        icon={<IconChecklist className="size-5" />}
      />

      <div className="space-y-4">
        <SectionLabel
          title="Campaign summary"
          subtitle="Confirm details before creating the Collect campaign"
        />

        <div className="bg-muted/50 space-y-4 rounded-sm border p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-foreground min-w-0 truncate text-sm font-medium">
              {campaignName}
            </p>
            {selectedCandidate?.party && (
              <Badge
                variant="outline"
                className="shrink-0 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
              >
                {selectedCandidate.party}
              </Badge>
            )}
          </div>

          <div className="border-border/40 border-t pt-3">
            <ReviewSection
              eyebrow="Candidate & URL"
              editStep={0}
              onEditStep={onEditStep}
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                <ReviewField
                  label="Anchor candidate"
                  value={selectedCandidate?.name ?? ""}
                />
                <ReviewField
                  label="Position"
                  value={selectedCandidate?.position ?? ""}
                />
                <ReviewField
                  label="Constituency"
                  value={selectedCandidate?.constituency ?? ""}
                />
                <ReviewField
                  label="Branding"
                  value={getCampaignBrandingLabel(brandingType)}
                />
                <ReviewField label="Slug" value={slug ? `/c/${slug}` : ""} />
              </div>
            </ReviewSection>
          </div>

          <div className="border-border/40 border-t pt-3">
            <ReviewSection
              eyebrow="Collect configuration"
              editStep={1}
              onEditStep={onEditStep}
            >
              <div className="grid grid-cols-1 gap-y-2.5 sm:grid-cols-2 sm:gap-x-6">
                <ReviewField
                  label="Custom question 1"
                  value={customQuestion1?.trim() ?? ""}
                />
                <ReviewField
                  label="Custom question 2"
                  value={customQuestion2?.trim() ?? ""}
                />
                {needsLgas && (
                  <ReviewField label="Collection area" value={lgaSummary} />
                )}
              </div>
            </ReviewSection>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <NavButtons
          onBack={onBack}
          onNext={onSubmit}
          nextLabel="Create Campaign"
          isLoading={isSubmitting}
          nextDisabled={isSubmitting}
        />
      </div>
    </StepCard>
  );
}
