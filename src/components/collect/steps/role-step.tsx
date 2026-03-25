"use client";

import { HiUsers, HiUserCircle, HiClipboardList } from "react-icons/hi";
import { Users } from "lucide-react";
import { motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";
import type { RegistrationFormData } from "@/lib/schemas/collect-schemas";
import { Separator } from "@/components/ui/separator";
import { RegistrationStepHeader } from "@/components/collect/registration-step-header";
import {
  FieldError,
  NavButtons,
  StepCard,
  CardSectionHeader,
} from "@/components/collect/form-ui";
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
}: {
  form: UseFormReturn<RegistrationFormData>;
  onBack: () => void;
  onNext: () => void;
}) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = form;
  const selectedRole = watch("role");

  return (
    <div className="space-y-6">
      <RegistrationStepHeader
        icon={Users}
        badge="Campaign Role"
        title="Choose Your Role"
        description="Select how you'd like to contribute to the campaign"
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
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
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
            </div>
            <FieldError error={errors.role?.message} />

            <Separator />
            <NavButtons onBack={onBack} onNext={onNext} />
          </div>
        </StepCard>
      </motion.div>
    </div>
  );
}
