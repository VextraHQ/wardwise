"use client";

import { useState } from "react";
import { type UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import {
  StepCard,
  CardSectionHeader,
  SectionLabel,
  FieldLabel,
  FieldError,
  NavButtons,
} from "@/components/collect/form-ui";
import { IconUser } from "@tabler/icons-react";
import type { CreateCandidateFormValues } from "@/lib/schemas/admin-schemas";
import {
  NIGERIAN_PARTIES,
  CANDIDATE_TITLES,
} from "@/lib/data/nigerian-parties";

interface StepIdentityProps {
  form: UseFormReturn<CreateCandidateFormValues>;
  onBack: () => void;
  onNext: () => void;
}

const partyOptions = [
  ...NIGERIAN_PARTIES,
  {
    value: "__other__",
    label: "Other...",
    description: "Enter a custom party name",
  },
];

export function StepIdentity({ form, onBack, onNext }: StepIdentityProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;
  const [showOtherParty, setShowOtherParty] = useState(false);

  function handlePartySelect(value: string) {
    if (value === "__other__") {
      setShowOtherParty(true);
      setValue("party", "");
    } else {
      setShowOtherParty(false);
      setValue("party", value, { shouldValidate: true });
    }
  }

  return (
    <StepCard>
      <CardSectionHeader
        title="Identity"
        subtitle="Step 1"
        statusLabel="Candidate Registration"
        icon={<IconUser className="size-5" />}
      />

      <div className="space-y-4">
        {/* Personal Details */}
        <div className="space-y-3">
          <SectionLabel
            title="Personal Details"
            subtitle="Basic information about the candidate"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel optional>Title</FieldLabel>
              <ComboboxSelect
                options={CANDIDATE_TITLES}
                value={watch("title") || ""}
                onValueChange={(val) => setValue("title", val)}
                placeholder="Select title..."
                searchPlaceholder="Search titles..."
                emptyMessage="No title found."
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Full Name</FieldLabel>
              <Input
                value={watch("name")}
                onChange={(e) =>
                  setValue("name", e.target.value, { shouldValidate: true })
                }
                placeholder="e.g., Ahmadu Umaru Fintiri"
                className="border-border/60 h-11 rounded-sm"
              />
              <FieldError error={errors.name?.message} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <SectionLabel
            title="Contact"
            subtitle="Account credentials and contact info"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={watch("email")}
                onChange={(e) =>
                  setValue("email", e.target.value, { shouldValidate: true })
                }
                placeholder="candidate@wardwise.ng"
                className="border-border/60 h-11 rounded-sm"
              />
              <FieldError error={errors.email?.message} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel optional>Phone</FieldLabel>
              <Input
                value={watch("phone") || ""}
                onChange={(e) => setValue("phone", e.target.value)}
                placeholder="08012345678"
                className="border-border/60 h-11 rounded-sm"
              />
              <FieldError error={errors.phone?.message} />
            </div>
          </div>
        </div>

        {/* Party */}
        <div className="space-y-3">
          <SectionLabel
            title="Political Party"
            subtitle="The party the candidate is running under"
          />
          <div className="space-y-1.5">
            <span className="sr-only">Party</span>
            {showOtherParty ? (
              <div className="flex gap-2">
                <Input
                  aria-label="Party"
                  value={watch("party")}
                  onChange={(e) =>
                    setValue("party", e.target.value, { shouldValidate: true })
                  }
                  placeholder="Enter party name"
                  className="border-border/60 h-11 rounded-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0 rounded-sm text-xs"
                  onClick={() => {
                    setShowOtherParty(false);
                    setValue("party", "");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <ComboboxSelect
                options={partyOptions}
                value={watch("party") || ""}
                onValueChange={handlePartySelect}
                triggerAriaLabel="Party"
                placeholder="Select party..."
                searchPlaceholder="Search parties..."
                emptyMessage="No party found."
              />
            )}
            <FieldError error={errors.party?.message} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <NavButtons onBack={onBack} onNext={onNext} />
      </div>
    </StepCard>
  );
}
