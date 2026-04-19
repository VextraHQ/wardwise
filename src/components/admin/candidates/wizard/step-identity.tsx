"use client";

import { type UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
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
  CANDIDATE_PARTY_OTHER_OPTION,
  CANDIDATE_TITLE_OTHER_OPTION,
} from "@/lib/data/nigerian-parties";
import { ListOrCustomField } from "@/components/admin/shared/list-or-custom-field";

interface StepIdentityProps {
  form: UseFormReturn<CreateCandidateFormValues>;
  onBack: () => void;
  onNext: () => void;
}

const partyOptions = [...NIGERIAN_PARTIES, CANDIDATE_PARTY_OTHER_OPTION];
const titleOptions = [...CANDIDATE_TITLES, CANDIDATE_TITLE_OTHER_OPTION];

export function StepIdentity({ form, onBack, onNext }: StepIdentityProps) {
  const {
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = form;

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
              <ListOrCustomField
                options={titleOptions}
                value={watch("title") || ""}
                onChange={(next) =>
                  setValue("title", next, { shouldValidate: true })
                }
                triggerAriaLabel="Title"
                inputAriaLabel="Title"
                placeholder="Select title..."
                searchPlaceholder="Search titles..."
                emptyMessage="No title found."
                customPlaceholder="Enter title"
                customHintId="custom-title-hint"
                error={errors.title?.message}
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Full Name</FieldLabel>
              <Input
                name="name"
                autoComplete="name"
                value={watch("name")}
                onChange={(e) => setValue("name", e.target.value)}
                onBlur={() => trigger("name")}
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
                name="email"
                autoComplete="email"
                value={watch("email")}
                onChange={(e) => setValue("email", e.target.value)}
                onBlur={() => trigger("email")}
                placeholder="candidate@wardwise.ng"
                className="border-border/60 h-11 rounded-sm"
              />
              <FieldError error={errors.email?.message} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel optional>Phone</FieldLabel>
              <Input
                type="tel"
                inputMode="tel"
                name="phone"
                autoComplete="tel"
                value={watch("phone") || ""}
                onChange={(e) => setValue("phone", e.target.value)}
                onBlur={() => trigger("phone")}
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
          <ListOrCustomField
            options={partyOptions}
            value={watch("party") || ""}
            onChange={(next) =>
              setValue("party", next, { shouldValidate: true })
            }
            triggerAriaLabel="Party"
            inputAriaLabel="Party"
            placeholder="Select party..."
            searchPlaceholder="Search parties..."
            emptyMessage="No party found."
            customPlaceholder="Enter party name"
            customHintId="custom-party-hint"
            error={errors.party?.message}
          />
        </div>
      </div>

      <div className="mt-4">
        <NavButtons onBack={onBack} onNext={onNext} />
      </div>
    </StepCard>
  );
}
