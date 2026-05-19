"use client";

import { ClipboardCheck, PencilLine } from "lucide-react";
import { HiCheckCircle, HiMail, HiShieldCheck } from "react-icons/hi";
import { motion } from "motion/react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { RegistrationStepHeader } from "@/features/collect/components/public/registration-step-header";
import {
  CollectMobilePrivacyNote,
  NavButtons,
  StepCard,
  CardSectionHeader,
  SubmitError,
} from "@/features/collect/components/public/form-ui";
import {
  formatMaritalStatusDisplay,
  formatOccupationDisplay,
  formatRole,
  formatSexDisplay,
} from "@/features/collect/lib/display-format";
import type { RegistrationFormData } from "@/features/collect/schemas/collect-schemas";
import type { PublicCampaign } from "@/features/collect/types/collect.types";
import { useIsMobile } from "@/hooks/shared/use-mobile";
import { cn, formatPersonName } from "@/lib/utils";

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return String(value);
  return value.trim() || "—";
}

function joinSummaryParts(
  parts: Array<string | null | undefined>,
  fallback = "—",
) {
  const cleaned = parts
    .map((part) => (typeof part === "string" ? part.trim() : part))
    .filter((part): part is string => Boolean(part) && part !== "—");

  return cleaned.length > 0 ? cleaned.join(" · ") : fallback;
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
        {label}
      </p>
      <p className="text-foreground text-xs leading-relaxed font-medium wrap-break-word">
        {value}
      </p>
    </div>
  );
}

function ReviewSection({
  title,
  editScreen,
  onEditStep,
  children,
}: {
  title: string;
  editScreen: number;
  onEditStep: (screen: number) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-foreground/70 font-mono text-[10px] font-bold tracking-widest uppercase">
          {title}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEditStep(editScreen)}
          aria-label={`Edit ${title.toLowerCase()}`}
          className="text-muted-foreground hover:text-foreground h-7 rounded-sm px-2 font-mono text-[9px] font-bold tracking-widest uppercase"
        >
          Edit
          <PencilLine className="size-3" />
        </Button>
      </div>
      {children}
    </section>
  );
}

function CompactReviewSection({
  title,
  summary,
  detail,
  editScreen,
  onEditStep,
}: {
  title: string;
  summary: string;
  detail?: string;
  editScreen: number;
  onEditStep: (screen: number) => void;
}) {
  return (
    <section className="border-border/40 space-y-1.5 border-t py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-foreground/70 font-mono text-[9px] font-bold tracking-widest uppercase">
            {title}
          </p>
          <p className="text-foreground text-sm leading-snug font-semibold wrap-break-word">
            {summary}
          </p>
          {detail ? (
            <p className="text-muted-foreground text-[11px] leading-relaxed wrap-break-word">
              {detail}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEditStep(editScreen)}
          aria-label={`Edit ${title.toLowerCase()}`}
          className="text-muted-foreground hover:text-foreground h-7 shrink-0 rounded-sm px-2 font-mono text-[9px] font-bold tracking-widest uppercase"
        >
          Edit
          <PencilLine className="size-3" />
        </Button>
      </div>
    </section>
  );
}

export function ReviewStep({
  campaign,
  form,
  hasCanvasser,
  onBack,
  onSubmit,
  onEditStep,
  showReceiptOptIn,
  isSubmitting = false,
  submitError,
}: {
  campaign: PublicCampaign;
  form: UseFormReturn<RegistrationFormData>;
  hasCanvasser: boolean | null;
  onBack: () => void;
  onSubmit: () => void;
  onEditStep: (screen: number) => void;
  showReceiptOptIn: boolean;
  isSubmitting?: boolean;
  submitError?: string;
}) {
  const values = useWatch({ control: form.control });
  const isMobile = useIsMobile();
  const fullName = [values.firstName, values.middleName, values.lastName]
    .filter((part) => typeof part === "string" && part.trim().length > 0)
    .join(" ");
  const hasIdentity = Boolean(
    values.identityType && values.identityValue?.trim(),
  );
  const isCanvasserRole = values.role === "canvasser";
  const showSupportGroup = campaign.supportGroupFieldMode === "optional";
  const identityMethod =
    values.identityType === "nin"
      ? "National ID (NIN)"
      : values.identityType === "membership"
        ? `${campaign.party} membership`
        : "Skipped";
  const customAnswers = [
    values.customAnswer1?.trim(),
    values.customAnswer2?.trim(),
  ].filter(Boolean);

  const personalSummary = joinSummaryParts([
    formatValue(formatPersonName(fullName)),
    formatValue(values.phone),
  ]);
  const personalDetail = joinSummaryParts([
    values.email?.trim() ? values.email : null,
    formatSexDisplay(values.sex),
    values.age ? `${values.age} yrs` : null,
    formatMaritalStatusDisplay(values.maritalStatus),
    formatOccupationDisplay(values.occupation),
  ]);
  const locationSummary = joinSummaryParts([
    values.lgaName?.trim(),
    values.wardName?.trim(),
  ]);
  const locationDetail = values.pollingUnitName?.trim()
    ? `Polling unit: ${values.pollingUnitName.trim()}`
    : undefined;
  const verificationSummary = identityMethod;
  const verificationDetail = joinSummaryParts([
    hasIdentity ? "Identity number added" : "No identity number added",
    values.voterIdNumber?.trim() ? "VIN added" : "VIN not provided",
  ]);
  const roleSummary = values.role ? formatRole(values.role) : "—";
  const roleDetail = showSupportGroup
    ? values.supportGroupName?.trim()
      ? `${campaign.supportGroupFieldLabel?.trim() || "Support group"}: ${values.supportGroupName.trim()}`
      : "No support group added"
    : undefined;
  const additionalSummary =
    customAnswers.length > 0
      ? `${customAnswers.length} additional ${customAnswers.length === 1 ? "response" : "responses"}`
      : "No extra details provided";
  const additionalDetail =
    customAnswers.length > 0 ? joinSummaryParts(customAnswers) : undefined;
  const canvasserSummary =
    hasCanvasser === true
      ? values.canvasserName?.trim()
        ? `Referred by ${values.canvasserName.trim()}`
        : "Referred by a canvasser"
      : hasCanvasser === false
        ? "Not referred by a canvasser"
        : "Canvasser referral not answered";
  const canvasserDetail =
    hasCanvasser && values.canvasserPhone?.trim()
      ? values.canvasserPhone.trim()
      : undefined;

  return (
    <div className="space-y-6">
      <RegistrationStepHeader
        title="Review & Submit"
        description="Confirm your details before sending them to the campaign team."
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StepCard>
          <CardSectionHeader
            title="Review Details"
            subtitle="Final Check"
            statusLabel="Submit"
            icon={<ClipboardCheck className="size-4.5" />}
          />

          <div className="space-y-5">
            <div className="bg-muted/35 space-y-4 rounded-sm border p-3.5 sm:p-5">
              {isMobile ? (
                <>
                  <CompactReviewSection
                    title="Personal Details"
                    summary={personalSummary}
                    detail={personalDetail}
                    editScreen={1}
                    onEditStep={onEditStep}
                  />
                  <CompactReviewSection
                    title="Location"
                    summary={locationSummary}
                    detail={locationDetail}
                    editScreen={2}
                    onEditStep={onEditStep}
                  />
                  <CompactReviewSection
                    title="Verification"
                    summary={verificationSummary}
                    detail={verificationDetail}
                    editScreen={3}
                    onEditStep={onEditStep}
                  />
                  <CompactReviewSection
                    title="Role & Support"
                    summary={roleSummary}
                    detail={roleDetail}
                    editScreen={4}
                    onEditStep={onEditStep}
                  />
                  {(campaign.customQuestion1 || campaign.customQuestion2) && (
                    <CompactReviewSection
                      title="Additional Details"
                      summary={additionalSummary}
                      detail={additionalDetail}
                      editScreen={1}
                      onEditStep={onEditStep}
                    />
                  )}
                  {!isCanvasserRole && (
                    <CompactReviewSection
                      title="Canvasser Referral"
                      summary={canvasserSummary}
                      detail={canvasserDetail}
                      editScreen={5}
                      onEditStep={onEditStep}
                    />
                  )}
                  {campaign.receiptEmailAvailable && (
                    <section className="border-border/40 space-y-2.5 border-t py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <p className="text-foreground/70 font-mono text-[9px] font-bold tracking-widest uppercase">
                            Receipt Email
                          </p>
                          <p className="text-foreground text-sm leading-snug font-semibold wrap-break-word">
                            {showReceiptOptIn
                              ? values.email
                              : "Add an email to receive a confirmation"}
                          </p>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {showReceiptOptIn
                              ? "Choose whether WardWise should send a short registration summary after submission."
                              : "Receipt opt-in appears automatically once a valid email is added."}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditStep(1)}
                          className="text-muted-foreground hover:text-foreground h-7 shrink-0 rounded-sm px-2 font-mono text-[9px] font-bold tracking-widest uppercase"
                        >
                          Edit
                          <PencilLine className="size-3" />
                        </Button>
                      </div>
                      {showReceiptOptIn ? (
                        <label className="flex cursor-pointer items-start gap-3 pt-1">
                          <Checkbox
                            checked={Boolean(values.wantsEmailReceipt)}
                            onCheckedChange={(checked) =>
                              form.setValue(
                                "wantsEmailReceipt",
                                Boolean(checked),
                                {
                                  shouldDirty: true,
                                },
                              )
                            }
                            className="mt-0.5 shrink-0"
                          />
                          <div className="space-y-0.5">
                            <p className="text-foreground text-sm leading-snug font-medium">
                              Email me a registration confirmation
                            </p>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                              {values.wantsEmailReceipt
                                ? "Receipt will be sent after submission."
                                : "Optional. Turn this on if you want a confirmation in your inbox."}
                            </p>
                          </div>
                        </label>
                      ) : null}
                    </section>
                  )}
                </>
              ) : (
                <>
                  <ReviewSection
                    title="Personal Details"
                    editScreen={1}
                    onEditStep={onEditStep}
                  >
                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                      <ReviewField
                        label="Full name"
                        value={formatValue(formatPersonName(fullName))}
                      />
                      <ReviewField
                        label="Phone"
                        value={formatValue(values.phone)}
                      />
                      <ReviewField
                        label="Email"
                        value={formatValue(values.email || "Not provided")}
                      />
                      <ReviewField
                        label="Sex"
                        value={formatSexDisplay(values.sex)}
                      />
                      <ReviewField
                        label="Age"
                        value={formatValue(values.age)}
                      />
                      <ReviewField
                        label="Occupation"
                        value={formatOccupationDisplay(values.occupation)}
                      />
                      <ReviewField
                        label="Marital status"
                        value={formatMaritalStatusDisplay(values.maritalStatus)}
                      />
                    </div>
                  </ReviewSection>

                  <div className="border-border/40 border-t pt-5">
                    <ReviewSection
                      title="Location"
                      editScreen={2}
                      onEditStep={onEditStep}
                    >
                      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                        <ReviewField
                          label="LGA"
                          value={formatValue(values.lgaName)}
                        />
                        <ReviewField
                          label="Ward"
                          value={formatValue(values.wardName)}
                        />
                        <ReviewField
                          label="Polling unit"
                          value={formatValue(values.pollingUnitName)}
                        />
                      </div>
                    </ReviewSection>
                  </div>

                  <div className="border-border/40 border-t pt-5">
                    <ReviewSection
                      title="Verification"
                      editScreen={3}
                      onEditStep={onEditStep}
                    >
                      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                        <ReviewField label="Method" value={identityMethod} />
                        <ReviewField
                          label="Number"
                          value={
                            hasIdentity
                              ? formatValue(values.identityValue)
                              : "Skipped"
                          }
                        />
                        <ReviewField
                          label="Voter ID (VIN)"
                          value={
                            values.voterIdNumber?.trim()
                              ? formatValue(values.voterIdNumber)
                              : "Not provided"
                          }
                        />
                      </div>
                    </ReviewSection>
                  </div>

                  <div className="border-border/40 border-t pt-5">
                    <ReviewSection
                      title="Role & Support"
                      editScreen={4}
                      onEditStep={onEditStep}
                    >
                      <div
                        className={cn(
                          "grid grid-cols-1 gap-x-6 gap-y-3",
                          showSupportGroup && "sm:grid-cols-2",
                        )}
                      >
                        <ReviewField
                          label="Role"
                          value={values.role ? formatRole(values.role) : "—"}
                        />
                        {showSupportGroup ? (
                          <ReviewField
                            label={
                              campaign.supportGroupFieldLabel?.trim() ||
                              "Support group"
                            }
                            value={
                              values.supportGroupName?.trim()
                                ? formatValue(values.supportGroupName)
                                : "Not provided"
                            }
                          />
                        ) : null}
                      </div>
                    </ReviewSection>
                  </div>

                  {(campaign.customQuestion1 || campaign.customQuestion2) && (
                    <div className="border-border/40 border-t pt-5">
                      <ReviewSection
                        title="Additional Details"
                        editScreen={1}
                        onEditStep={onEditStep}
                      >
                        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                          {campaign.customQuestion1 ? (
                            <ReviewField
                              label={campaign.customQuestion1}
                              value={
                                values.customAnswer1?.trim()
                                  ? formatValue(values.customAnswer1)
                                  : "Not provided"
                              }
                            />
                          ) : null}
                          {campaign.customQuestion2 ? (
                            <ReviewField
                              label={campaign.customQuestion2}
                              value={
                                values.customAnswer2?.trim()
                                  ? formatValue(values.customAnswer2)
                                  : "Not provided"
                              }
                            />
                          ) : null}
                        </div>
                      </ReviewSection>
                    </div>
                  )}

                  {!isCanvasserRole && (
                    <div className="border-border/40 border-t pt-5">
                      <ReviewSection
                        title="Canvasser Referral"
                        editScreen={5}
                        onEditStep={onEditStep}
                      >
                        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                          <ReviewField
                            label="Referred"
                            value={
                              hasCanvasser === null
                                ? "—"
                                : hasCanvasser
                                  ? "Yes"
                                  : "No"
                            }
                          />
                          <ReviewField
                            label="Canvasser name"
                            value={
                              hasCanvasser && values.canvasserName?.trim()
                                ? formatValue(values.canvasserName)
                                : "Not provided"
                            }
                          />
                          <ReviewField
                            label="Canvasser phone"
                            value={
                              hasCanvasser && values.canvasserPhone?.trim()
                                ? formatValue(values.canvasserPhone)
                                : "Not provided"
                            }
                          />
                        </div>
                      </ReviewSection>
                    </div>
                  )}

                  {campaign.receiptEmailAvailable && (
                    <div className="border-border/40 border-t pt-5">
                      <ReviewSection
                        title="Receipt Email"
                        editScreen={1}
                        onEditStep={onEditStep}
                      >
                        {showReceiptOptIn ? (
                          <div className="space-y-4">
                            <label className="flex cursor-pointer items-start gap-3">
                              <Checkbox
                                checked={Boolean(values.wantsEmailReceipt)}
                                onCheckedChange={(checked) =>
                                  form.setValue(
                                    "wantsEmailReceipt",
                                    Boolean(checked),
                                    {
                                      shouldDirty: true,
                                    },
                                  )
                                }
                                className="mt-0.5 shrink-0"
                              />
                              <div className="space-y-1">
                                <p className="text-foreground text-sm leading-snug font-medium">
                                  Email me a registration confirmation
                                </p>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                  We&apos;ll send a short summary to{" "}
                                  <span className="text-foreground font-medium">
                                    {values.email}
                                  </span>{" "}
                                  after submission.
                                </p>
                              </div>
                            </label>

                            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                              <ReviewField
                                label="Receipt email"
                                value={formatValue(values.email)}
                              />
                              <ReviewField
                                label="Status"
                                value={
                                  values.wantsEmailReceipt
                                    ? "Send after submission"
                                    : "Not selected"
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            Add an email address on Personal Details if
                            you&apos;d like a registration receipt after
                            submission.
                          </p>
                        )}
                      </ReviewSection>
                    </div>
                  )}
                </>
              )}
            </div>

            <Separator />

            <NavButtons
              onBack={onBack}
              onNext={onSubmit}
              nextLabel="Submit registration"
              mobileLayout="inline"
              isLoading={isSubmitting}
            />

            <SubmitError error={submitError} />
          </div>
        </StepCard>
      </motion.div>

      <CollectMobilePrivacyNote />

      <TrustIndicators
        items={[
          { icon: <HiCheckCircle />, label: "REVIEW_BEFORE_SUBMIT" },
          { icon: <HiMail />, label: "OPTIONAL_EMAIL_RECEIPT" },
          { icon: <HiShieldCheck />, label: "CAMPAIGN_USE_ONLY" },
        ]}
      />
    </div>
  );
}
