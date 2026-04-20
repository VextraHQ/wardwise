"use client";

import { HiShieldCheck, HiCheckCircle } from "react-icons/hi";
import { ClipboardList } from "lucide-react";
import { motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";
import type { RegistrationFormData } from "@/lib/schemas/collect-schemas";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RegistrationStepHeader } from "@/components/collect/registration-step-header";
import {
  CollectMobilePrivacyNote,
  FieldLabel,
  FieldHint,
  InputIcon,
  FieldError,
  NavButtons,
  StepCard,
  CardSectionHeader,
} from "@/components/collect/form-ui";
import { TrustIndicators } from "@/components/ui/trust-indicators";

export function PartyInfoStep({
  form,
  onBack,
  onNext,
}: {
  form: UseFormReturn<RegistrationFormData>;
  onBack: () => void;
  onNext: () => void;
}) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      <RegistrationStepHeader
        icon={ClipboardList}
        badge="Party Verification"
        title="Party Information"
        description="Enter your party registration and voter identification details"
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StepCard>
          <CardSectionHeader
            title="Party Details"
            subtitle="Verification"
            statusLabel="Required"
            icon={<HiShieldCheck className="size-4.5" />}
          />

          <div className="space-y-6">
            <div className="space-y-1.5">
              <FieldLabel>APC Registration Number or NIN</FieldLabel>
              <div className="relative">
                <InputIcon>
                  <HiShieldCheck className="text-muted-foreground size-3.5" />
                </InputIcon>
                <Input
                  {...register("apcRegNumber")}
                  placeholder="Enter your APC reg number or NIN"
                  className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-mono font-medium tracking-wider transition-all placeholder:text-xs"
                />
              </div>
              <FieldError error={errors.apcRegNumber?.message} />
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
                  On your voter card. Together with your APC number or NIN, we
                  use this to confirm you and prevent duplicate registrations.
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
