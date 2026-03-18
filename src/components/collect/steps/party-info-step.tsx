"use client";

import { HiShieldCheck } from "react-icons/hi";
import { ClipboardList } from "lucide-react";
import { motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";
import type { RegistrationFormData } from "@/lib/schemas/collect-schemas";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RegistrationStepHeader } from "@/components/collect/registration-step-header";
import {
  FieldLabel,
  InputIcon,
  FieldError,
  NavButtons,
  StepCard,
  CardSectionHeader,
} from "@/components/collect/form-ui";

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
              <p className="text-muted-foreground text-[10px]">
                Provide either your APC membership number or National
                Identification Number (NIN)
              </p>
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
              <FieldError error={errors.voterIdNumber?.message} />
            </div>

            <Separator />
            <NavButtons onBack={onBack} onNext={onNext} />
          </div>
        </StepCard>
      </motion.div>
    </div>
  );
}
