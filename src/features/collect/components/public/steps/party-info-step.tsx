"use client";

import { HiCheckCircle, HiShieldCheck, HiUserCircle } from "react-icons/hi";
import { ClipboardList, Fingerprint } from "lucide-react";
import { motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";
import type { RegistrationFormData } from "@/features/collect/schemas/collect-schemas";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RegistrationStepHeader } from "@/features/collect/components/public/registration-step-header";
import {
  CollectMobilePrivacyNote,
  FieldLabel,
  FieldHint,
  InputIcon,
  FieldError,
  NavButtons,
  StepCard,
  CardSectionHeader,
} from "@/features/collect/components/public/form-ui";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { cn } from "@/lib/utils";

const IDENTITY_OPTIONS = [
  {
    value: "membership" as const,
    label: "Party Membership",
    description: "For registered party members",
    icon: HiUserCircle,
  },
  {
    value: "nin" as const,
    label: "National ID (NIN)",
    description: "Use your 11-digit national ID",
    icon: Fingerprint,
  },
];

export function PartyInfoStep({
  party,
  form,
  onBack,
  onNext,
}: {
  party: string;
  form: UseFormReturn<RegistrationFormData>;
  onBack: () => void;
  onNext: () => void;
}) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const identityType = watch("identityType");
  const identityLabel =
    identityType === "nin"
      ? "National Identification Number (NIN)"
      : `${party} Membership Number`;
  const identityPlaceholder =
    identityType === "nin"
      ? "Enter your 11-digit NIN"
      : `Enter your ${party} membership number`;
  const identityHint =
    identityType === "nin"
      ? "Must be exactly 11 digits. This is used only to validate your registration."
      : `Enter the membership number tied to your ${party} record. Letters, numbers, hyphens, and slashes are accepted.`;

  return (
    <div className="space-y-6">
      <RegistrationStepHeader
        title="Identity & Verification"
        description="Choose the identification detail you want us to use for validation."
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StepCard>
          <CardSectionHeader
            title="Verification Method"
            subtitle="Choose One"
            statusLabel="Required"
            icon={<HiShieldCheck className="size-4.5" />}
          />

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {IDENTITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = identityType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`Select ${option.label}`}
                    onClick={() =>
                      setValue("identityType", option.value, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "border-border bg-card hover:border-primary/50 focus-visible:ring-primary flex cursor-pointer items-start gap-3 rounded-sm border-2 p-4 text-left transition-all focus-visible:ring-2 focus-visible:outline-none sm:p-5",
                      selected &&
                        "border-primary bg-primary/10 ring-primary/20 ring-2 ring-offset-1",
                    )}
                  >
                    <div
                      className={cn(
                        "border-border/60 bg-muted/20 text-muted-foreground mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-sm border",
                        selected && "border-primary/20 bg-primary/10 text-primary",
                      )}
                    >
                      <Icon className="size-4.5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-foreground text-sm font-bold">
                        {option.label}
                      </p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <FieldError error={errors.identityType?.message} />

            <div className="space-y-1.5">
              <FieldLabel>{identityLabel}</FieldLabel>
              <div className="relative">
                <InputIcon>
                  {identityType === "nin" ? (
                    <Fingerprint className="text-muted-foreground size-3.5" />
                  ) : (
                    <HiShieldCheck className="text-muted-foreground size-3.5" />
                  )}
                </InputIcon>
                <Input
                  {...register("identityValue")}
                  placeholder={identityPlaceholder}
                  className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-mono font-medium tracking-wider transition-all placeholder:text-xs"
                />
              </div>
              <FieldError error={errors.identityValue?.message} />
              <FieldHint>{identityHint}</FieldHint>
            </div>

            <div className="space-y-1.5">
              <FieldLabel>Voter ID Number (VIN)</FieldLabel>
              <div className="relative">
                <InputIcon>
                  <HiShieldCheck className="text-muted-foreground size-3.5" />
                </InputIcon>
                <Input
                  {...register("voterIdNumber")}
                  placeholder="Enter your Voter ID (VIN/PVC) number"
                  className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-mono font-medium tracking-wider transition-all placeholder:text-xs"
                />
              </div>
              <div className="flex flex-col gap-2.5 pt-0.5">
                <FieldError error={errors.voterIdNumber?.message} />
                <FieldHint>
                  On your voter card. We pair it with your{" "}
                  {identityType === "nin"
                    ? "NIN"
                    : "membership number"}{" "}
                  to confirm your registration and prevent duplicates.
                </FieldHint>
              </div>
            </div>

            <Separator />
            <NavButtons onBack={onBack} onNext={onNext} />
          </div>
        </StepCard>
      </motion.div>

      <CollectMobilePrivacyNote />

      <TrustIndicators
        items={[
          {
            icon: <ClipboardList className="size-3.5" />,
            label: "MEMBERSHIP_CONFIDENTIAL",
          },
          { icon: <HiShieldCheck />, label: "NEVER_SOLD_OR_SHARED" },
          { icon: <HiCheckCircle />, label: "SINGLE_CAMPAIGN_USE" },
        ]}
      />
    </div>
  );
}
