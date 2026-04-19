"use client";

import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  StepCard,
  CardSectionHeader,
  SectionLabel,
  FieldError,
  NavButtons,
} from "@/components/collect/form-ui";
import { IconBuildingCommunity } from "@tabler/icons-react";
import type { CreateCandidateFormValues } from "@/lib/schemas/admin-schemas";
import { cn } from "@/lib/utils";

const POSITIONS = [
  "President",
  "Governor",
  "Senator",
  "House of Representatives",
  "State Assembly",
] as const;

interface StepPositionProps {
  form: UseFormReturn<CreateCandidateFormValues>;
  onBack: () => void;
  onNext: () => void;
}

export function StepPosition({ form, onBack, onNext }: StepPositionProps) {
  const {
    setValue,
    formState: { errors },
  } = form;

  const selectedPosition = useWatch({
    control: form.control,
    name: "position",
  });

  function handlePositionChange(value: string) {
    if (value === selectedPosition) return;
    setValue("position", value, { shouldValidate: true });
    setValue("stateCode", "");
    setValue("lga", "");
    setValue("constituencyLgaIds", []);
    if (value === "President") {
      setValue("constituency", "Federal Republic of Nigeria", {
        shouldValidate: true,
      });
    } else {
      setValue("constituency", "");
    }
  }

  return (
    <StepCard>
      <CardSectionHeader
        title="Electoral office"
        subtitle="Step 2"
        statusLabel="Candidate Registration"
        icon={<IconBuildingCommunity className="size-5" />}
      />

      <div className="space-y-4">
        <div className="space-y-3">
          <SectionLabel
            title="Position"
            subtitle="The office the candidate is contesting for"
          />
          <div className="space-y-1.5">
            <RadioGroup
              value={selectedPosition ?? ""}
              onValueChange={handlePositionChange}
              className="flex flex-col gap-1.5"
              aria-label="Electoral position"
            >
              {POSITIONS.map((pos) => {
                const selected = selectedPosition === pos;
                return (
                  <label
                    key={pos}
                    className={cn(
                      "focus-within:ring-primary/30 flex cursor-pointer items-start gap-3 rounded-sm border-2 px-3 py-2.5 transition-[border-color,background-color,color] focus-within:ring-2 focus-within:ring-offset-1 sm:items-center sm:px-4 sm:py-3",
                      selected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border/60 bg-card text-foreground hover:border-primary/40",
                    )}
                  >
                    <RadioGroupItem
                      value={pos}
                      className="mt-0.5 shadow-none sm:mt-0"
                    />
                    <span className="min-w-0 flex-1 text-left text-sm leading-snug font-medium">
                      {pos}
                    </span>
                  </label>
                );
              })}
            </RadioGroup>
            <FieldError error={errors.position?.message} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <NavButtons onBack={onBack} onNext={onNext} />
      </div>
    </StepCard>
  );
}
