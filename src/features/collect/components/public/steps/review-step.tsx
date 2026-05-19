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
import type { RegistrationFormData } from "@/features/collect/schemas/collect-schemas";
import type { PublicCampaign } from "@/features/collect/types/collect.types";

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return String(value);
  return value.trim() || "—";
}

function formatOption(value: string | null | undefined) {
  if (!value) return "—";
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
            <div className="bg-muted/35 space-y-5 rounded-sm border p-4 sm:p-5">
              <ReviewSection
                title="Personal Details"
                editScreen={1}
                onEditStep={onEditStep}
              >
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                  <ReviewField
                    label="Full name"
                    value={formatValue(fullName)}
                  />
                  <ReviewField
                    label="Phone"
                    value={formatValue(values.phone)}
                  />
                  <ReviewField
                    label="Email"
                    value={formatValue(values.email || "Not provided")}
                  />
                  <ReviewField label="Sex" value={formatOption(values.sex)} />
                  <ReviewField label="Age" value={formatValue(values.age)} />
                  <ReviewField
                    label="Occupation"
                    value={formatValue(values.occupation)}
                  />
                  <ReviewField
                    label="Marital status"
                    value={formatOption(values.maritalStatus)}
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
                    className={`grid grid-cols-1 gap-x-6 gap-y-3 ${showSupportGroup ? "sm:grid-cols-2" : ""}`}
                  >
                    <ReviewField
                      label="Role"
                      value={formatOption(values.role)}
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
                        Add an email address on Personal Details if you&apos;d
                        like a registration receipt after submission.
                      </p>
                    )}
                  </ReviewSection>
                </div>
              )}
            </div>

            <Separator />

            <NavButtons
              onBack={onBack}
              onNext={onSubmit}
              nextLabel="Submit registration"
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
