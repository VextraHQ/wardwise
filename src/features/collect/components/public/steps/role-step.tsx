"use client";

import {
  HiUsers,
  HiUserCircle,
  HiClipboardList,
  HiShieldCheck,
} from "react-icons/hi";
import { UsersRound } from "lucide-react";
import { motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";
import type { RegistrationFormData } from "@/features/collect/schemas/collect-schemas";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { RegistrationStepHeader } from "@/features/collect/components/public/registration-step-header";
import {
  CollectMobilePrivacyNote,
  FieldLabel,
  FieldHint,
  FieldError,
  InputIcon,
  NavButtons,
  SubmitError,
  StepCard,
  CardSectionHeader,
} from "@/features/collect/components/public/form-ui";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = [
  {
    value: "volunteer" as const,
    label: "Volunteer",
    desc: "Support campaign activities",
    icon: HiUsers,
  },
  {
    value: "member" as const,
    label: "Member",
    desc: "Registered party member",
    icon: HiUserCircle,
  },
  {
    value: "canvasser" as const,
    label: "Canvasser",
    desc: "Field mobilisation & outreach",
    icon: HiClipboardList,
  },
];

export function RoleStep({
  form,
  onBack,
  onNext,
  isSubmitting = false,
  submitError,
  supportGroupFieldMode = "off",
  supportGroupFieldLabel,
  showReceiptOptIn = false,
}: {
  form: UseFormReturn<RegistrationFormData>;
  onBack: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
  submitError?: string;
  supportGroupFieldMode?: "off" | "optional";
  supportGroupFieldLabel?: string | null;
  showReceiptOptIn?: boolean;
}) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const selectedRole = watch("role");
  const wantsEmailReceipt = watch("wantsEmailReceipt");

  const showSupportGroup = supportGroupFieldMode === "optional";
  const groupLabel =
    supportGroupFieldLabel?.trim() || "Support group / association";

  return (
    <div className="space-y-6">
      <RegistrationStepHeader
        title={showSupportGroup ? "Role & Support Network" : "Choose Your Role"}
        description={
          showSupportGroup
            ? "Select your role and let us know if you're affiliated with a group or association."
            : "Select how you'd like to contribute to the campaign"
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StepCard>
          <CardSectionHeader
            title="Role Selection"
            subtitle="Choose One"
            statusLabel="Required"
            icon={<HiUsers className="size-4.5" />}
          />

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {ROLE_OPTIONS.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.value}
                    type="button"
                    role="radio"
                    aria-checked={selectedRole === r.value}
                    aria-label={`Select role: ${r.label}`}
                    onClick={() => setValue("role", r.value)}
                    className={cn(
                      "border-border bg-card hover:border-primary/50 focus-visible:ring-primary flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 p-4 transition-all focus-visible:ring-2 focus-visible:outline-none sm:p-6",
                      selectedRole === r.value &&
                        "border-primary bg-primary/10 ring-primary/20 ring-2 ring-offset-1",
                    )}
                  >
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                    <span className="text-sm font-bold">{r.label}</span>
                    <span className="text-muted-foreground text-[10px] leading-tight">
                      {r.desc}
                    </span>
                  </button>
                );
              })}
              <FieldError error={errors.role?.message} />
            </div>

            {showSupportGroup && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <FieldLabel>{groupLabel}</FieldLabel>
                    <Badge
                      variant="outline"
                      className="text-muted-foreground border-border/60 rounded-sm px-1.5 py-0 text-[10px] font-medium"
                    >
                      Optional
                    </Badge>
                  </div>
                  <div className="relative">
                    <InputIcon>
                      <UsersRound className="text-muted-foreground size-3.5" />
                    </InputIcon>
                    <Input
                      {...register("supportGroupName")}
                      placeholder={`e.g. Youth Wing, Women's Forum`}
                      maxLength={100}
                      className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 transition-all placeholder:text-xs"
                    />
                  </div>
                  <FieldHint>
                    Enter the name of any group, association, or network you
                    represent. Leave blank if none.
                  </FieldHint>
                </div>
              </>
            )}

            {showReceiptOptIn && (
              <>
                <Separator />
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox
                    checked={Boolean(wantsEmailReceipt)}
                    onCheckedChange={(checked) =>
                      setValue("wantsEmailReceipt", Boolean(checked), {
                        shouldDirty: true,
                      })
                    }
                    className="mt-0.5 shrink-0"
                  />
                  <div className="space-y-0.5">
                    <p className="text-foreground text-sm font-medium leading-snug">
                      Email me a registration confirmation
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      A summary will be sent to your email address after
                      submission.
                    </p>
                  </div>
                </label>
              </>
            )}

            <Separator />
            <NavButtons
              onBack={onBack}
              onNext={onNext}
              nextLabel={
                selectedRole === "canvasser"
                  ? "Submit registration"
                  : "Continue"
              }
              isLoading={isSubmitting}
            />

            <SubmitError error={submitError} />
          </div>
        </StepCard>
      </motion.div>

      <CollectMobilePrivacyNote />

      <TrustIndicators
        items={[
          { icon: <HiUsers />, label: "ROLE_FOR_ORGANIZING" },
          { icon: <HiUserCircle />, label: "NO_PUBLIC_DIRECTORY" },
          { icon: <HiShieldCheck />, label: "INTERNAL_USE_ONLY" },
        ]}
      />
    </div>
  );
}
