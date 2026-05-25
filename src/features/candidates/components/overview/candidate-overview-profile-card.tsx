"use client";

import { IconDeviceFloppy, IconX } from "@tabler/icons-react";
import type { UseFormReturn } from "react-hook-form";

import type { CandidateWithUser } from "@/features/admin/api/admin-api";
import { ConstituencyBoundaryAlerts } from "@/features/admin/components/shared/constituency-boundary-alerts";
import { ListOrCustomField } from "@/features/admin/components/shared/list-or-custom-field";
import { LgaCheckboxGrid } from "@/features/admin/components/shared/lga-checkbox-grid";
import { OfficialConstituencySelector } from "@/features/admin/components/shared/official-constituency-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  POSITIONS,
  PARTY_OPTIONS_WITH_OTHER,
  TITLE_OPTIONS_WITH_OTHER,
  resolveStateName,
  type EditingSection,
} from "@/features/candidates/lib/candidate-overview-helpers";
import type { UpdateCandidateFormValues } from "@/features/candidates/schemas/candidate-schemas";
import type {
  ConstituencyPreset,
  UnsupportedConstituencyPreset,
} from "@/features/geo/data/nigerian-constituencies";
import type { ConstituencyBoundaryWarning } from "@/features/geo/lib/constituency";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  OverviewField,
  OverviewSectionHeader,
} from "@/features/candidates/components/overview/candidate-overview-ui";

export interface CandidateOverviewProfileCardProps {
  candidate: CandidateWithUser;
  form: UseFormReturn<UpdateCandidateFormValues>;
  editingSection: EditingSection | null;
  isUpdatePending: boolean;
  campaignCount: number;

  beginSectionEdit: (section: EditingSection) => void;
  cancelSectionEdit: () => void;
  saveIdentity: () => void;
  saveElectoral: () => void;
  saveContact: () => void;
  saveBio: () => void;

  handleEditPositionChange: (value: string) => void;
  handleEditStateChange: (value: string) => void;
  handlePresetChange: (value: string) => void;

  initialPartyMode: "list" | "custom";
  initialTitleMode: "list" | "custom";

  stateGroups: Array<{
    heading: string;
    options: Array<{ value: string; label: string; description: string }>;
  }>;

  selectedPosition: string | undefined;
  selectedStateCode: string | undefined;
  selectedStateName: string | undefined;
  constituencyLgaIds: number[];

  showStateField: boolean;
  showLgaGrid: boolean;
  showBoundaryGrid: boolean;
  stateHasNoLgas: boolean;
  hasPartialLgas: boolean;
  expectedLgaCount: number;
  lgas: Array<{ id: number; name: string }>;
  lgasLoading: boolean;
  lgasFetching: boolean;

  hasPresets: boolean;
  availablePresets: ConstituencyPreset[];
  unsupportedPresets: UnsupportedConstituencyPreset[];
  effectivePresetShortName: string | null;
  effectivePresetMatchResult: {
    ids: number[];
    unmatchedNames: string[];
  } | null;

  boundaryHelperText: string;
  editBoundaryWarnings: ConstituencyBoundaryWarning[];
  summaryBoundaryWarnings: ConstituencyBoundaryWarning[];

  visibleSummaryLgaChips: string[];
  remainingSummaryLgaCount: number;
  summaryLgaSectionCount: number;
  showCampaignBoundaryReviewNote: boolean;
}

export function CandidateOverviewProfileCard({
  candidate,
  form,
  editingSection,
  isUpdatePending,
  campaignCount,
  beginSectionEdit,
  cancelSectionEdit,
  saveIdentity,
  saveElectoral,
  saveContact,
  saveBio,
  handleEditPositionChange,
  handleEditStateChange,
  handlePresetChange,
  initialPartyMode,
  initialTitleMode,
  stateGroups,
  selectedPosition,
  selectedStateCode,
  selectedStateName,
  constituencyLgaIds,
  showStateField,
  showLgaGrid,
  showBoundaryGrid,
  stateHasNoLgas,
  hasPartialLgas,
  expectedLgaCount,
  lgas,
  lgasLoading,
  lgasFetching,
  hasPresets,
  availablePresets,
  unsupportedPresets,
  effectivePresetShortName,
  effectivePresetMatchResult,
  boundaryHelperText,
  editBoundaryWarnings,
  summaryBoundaryWarnings,
  visibleSummaryLgaChips,
  remainingSummaryLgaCount,
  summaryLgaSectionCount,
  showCampaignBoundaryReviewNote,
}: CandidateOverviewProfileCardProps) {
  return (
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
              editDisabled={isUpdatePending}
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
                    disabled={isUpdatePending}
                    className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                    onClick={saveIdentity}
                  >
                    <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
                    {isUpdatePending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                    disabled={isUpdatePending}
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
              editDisabled={isUpdatePending}
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
                      error={form.formState.errors.constituencyLgaIds?.message}
                    />
                    {hasPartialLgas && (
                      <p className="text-muted-foreground text-xs">
                        <span className="font-medium text-amber-600 dark:text-amber-500">
                          {lgas.length} of {expectedLgaCount} LGAs available
                        </span>{" "}
                        for {selectedStateName}. Some LGAs have not been seeded
                        yet.
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
                    disabled={isUpdatePending}
                    className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                    onClick={saveElectoral}
                  >
                    <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
                    {isUpdatePending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                    disabled={isUpdatePending}
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
                  <OverviewField label="Position" value={candidate.position} />
                  <OverviewField
                    label="State"
                    value={resolveStateName(candidate.stateCode)}
                  />
                  <OverviewField
                    label="Constituency"
                    value={candidate.constituency || "—"}
                  />
                </div>
                {summaryLgaSectionCount > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
                      Boundary LGAs ({summaryLgaSectionCount})
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
                      If you edit this boundary later, review campaign coverage
                      in the Campaigns tab.
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
              editDisabled={isUpdatePending}
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
                    disabled={isUpdatePending}
                    className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                    onClick={saveContact}
                  >
                    <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
                    {isUpdatePending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                    disabled={isUpdatePending}
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
              editDisabled={isUpdatePending}
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
                    disabled={isUpdatePending}
                    className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                    onClick={saveBio}
                  >
                    <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
                    {isUpdatePending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
                    disabled={isUpdatePending}
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
  );
}
