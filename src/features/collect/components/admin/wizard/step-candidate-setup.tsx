"use client";

import { useMemo } from "react";
import Link from "next/link";
import { type UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  StepCard,
  CardSectionHeader,
  SectionLabel,
  FieldLabel,
  InputIcon,
  FieldError,
  NavButtons,
} from "@/features/collect/components/public/form-ui";
import {
  IconUser,
  IconLink,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";
import type { CreateCampaignData } from "@/features/collect/schemas/collect-schemas";
import {
  nigeriaStates,
  getLGAsByState,
} from "@/features/geo/data/state-lga-locations";
import { ConstituencyBoundaryAlerts } from "@/features/admin-shell/components/shared/constituency-boundary-alerts";
import { getConstituencyBoundaryWarnings } from "@/features/geo/lib/constituency";
import {
  campaignBrandingTypes,
  getCampaignBrandingLabel,
  getCampaignDisplayHeadline,
} from "@/features/collect/lib/branding";

type CandidateOption = {
  value: string;
  label: string;
  description: string;
};

type CandidateInfo = {
  id: string;
  name: string;
  title: string | null;
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
  /** Blocks continuing past step 1 — admins must open the existing server draft */
  existingDraftCampaign?: { id: string; slug: string } | null;
  /** Shown when the candidate has an active Collect campaign and no open draft */
  showActiveCampaignDraftNotice?: boolean;
  onCandidateSelect: (candidateId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepCandidateSetup({
  form,
  candidateOptions,
  candidatesLoading,
  selectedCandidate,
  existingDraftCampaign,
  showActiveCampaignDraftNotice,
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
  const brandingType = watch("brandingType");
  const displayName = watch("displayName");
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
  const brandingLabel = getCampaignBrandingLabel(brandingType);
  const previewName = selectedCandidate
    ? getCampaignDisplayHeadline({
        candidateName: selectedCandidate.name,
        candidateTitle: selectedCandidate.title,
        displayName,
        brandingType,
      })
    : displayName?.trim() || "Public campaign name";
  const anchorHeadline = selectedCandidate
    ? getCampaignDisplayHeadline({
        candidateName: selectedCandidate.name,
        candidateTitle: selectedCandidate.title,
        brandingType: "candidate",
      })
    : null;
  const displayNamePlaceholder =
    brandingType === "movement"
      ? "e.g. City Boy Movement"
      : brandingType === "team"
        ? "e.g. Fintiri Canvassers"
        : "Optional — leave blank to use the candidate's name and title";

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
            title="Anchor Candidate"
            subtitle="Choose the internal candidate record that defines this campaign's geography"
          />
          <div className="space-y-1.5">
            <FieldLabel>Anchor Candidate *</FieldLabel>
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
                    {anchorHeadline ?? selectedCandidate.name}
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
              {existingDraftCampaign ? (
                <Alert className="rounded-sm border-amber-500/35 bg-amber-500/10 text-amber-950 dark:text-amber-100 [&>svg]:text-amber-600">
                  <IconAlertTriangle className="text-amber-600" aria-hidden />
                  <AlertTitle>Draft campaign already exists</AlertTitle>
                  <AlertDescription className="text-amber-950/85 dark:text-amber-50/90">
                    <p>
                      This candidate already has an open draft (
                      <span className="font-mono">
                        {existingDraftCampaign.slug}
                      </span>
                      ). Only one draft is allowed — continue that setup instead
                      of starting another wizard.
                    </p>
                    <Link
                      href={`/admin/collect/campaigns/${existingDraftCampaign.id}`}
                      className="text-primary mt-2 inline-block font-mono text-[10px] font-bold tracking-widest uppercase underline-offset-2 hover:underline"
                    >
                      Continue Draft
                    </Link>
                  </AlertDescription>
                </Alert>
              ) : null}
              {showActiveCampaignDraftNotice && selectedCandidate ? (
                <Alert className="border-border/60 bg-muted/40 [&>svg]:text-muted-foreground rounded-sm">
                  <IconInfoCircle aria-hidden />
                  <AlertTitle>New campaign will be a draft</AlertTitle>
                  <AlertDescription>
                    This candidate already has an active Collect campaign. You
                    can create another campaign as a draft now, but you cannot
                    activate it until the current active campaign is paused or
                    closed.
                  </AlertDescription>
                </Alert>
              ) : null}
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

        {/* Campaign Branding */}
        <div className="space-y-3">
          <SectionLabel
            title="Campaign Branding"
            subtitle="Decide how this campaign should appear on Collect screens and public links"
          />

          <div className="space-y-1.5">
            <FieldLabel>Runs As *</FieldLabel>
            <ToggleGroup
              type="single"
              value={brandingType}
              onValueChange={(value) => {
                if (!value) return;
                setValue(
                  "brandingType",
                  value as CreateCampaignData["brandingType"],
                  {
                    shouldValidate: true,
                  },
                );
              }}
              variant="outline"
              className="grid w-full grid-cols-1 rounded-sm sm:grid-cols-3"
            >
              {campaignBrandingTypes.map((type) => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  className="h-10 rounded-none font-mono text-[10px] font-bold tracking-widest uppercase first:rounded-t-sm last:rounded-b-sm sm:first:rounded-l-sm sm:first:rounded-tr-none sm:last:rounded-r-sm sm:last:rounded-bl-none"
                >
                  {getCampaignBrandingLabel(type)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {brandingType === "candidate"
                ? "Uses the candidate's name and title automatically. Only override below if you want a different public-facing name."
                : brandingType === "movement"
                  ? "Best for broader supporter brands like City Boy Movement."
                  : "Best for operational groups like Fintiri Canvassers."}
            </p>
          </div>

          <div className="space-y-1.5">
            <FieldLabel optional={brandingType === "candidate"}>
              Public Campaign Name
            </FieldLabel>
            <Input
              value={displayName ?? ""}
              onChange={(e) =>
                setValue("displayName", e.target.value, {
                  shouldValidate: true,
                })
              }
              placeholder={displayNamePlaceholder}
              className="rounded-sm"
            />
            <FieldError error={errors.displayName?.message} />
          </div>

          <div className="bg-muted/30 space-y-2 rounded-sm border border-dashed px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-foreground text-sm font-medium">
                {previewName}
              </p>
              <Badge
                variant="outline"
                className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
              >
                {brandingLabel}
              </Badge>
            </div>
            <div className="space-y-0.5 text-xs">
              <p className="text-muted-foreground">
                Public campaign name shown on Collect pages and share surfaces.
              </p>
              {selectedCandidate && (
                <p className="text-muted-foreground">
                  Anchor candidate:{" "}
                  <span className="text-foreground/80">
                    {anchorHeadline ?? selectedCandidate.name}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <NavButtons
          onBack={onBack}
          onNext={onNext}
          nextDisabled={Boolean(existingDraftCampaign)}
        />
      </div>
    </StepCard>
  );
}
