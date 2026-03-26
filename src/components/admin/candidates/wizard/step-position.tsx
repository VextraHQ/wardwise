"use client";

import { useMemo } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import {
  StepCard,
  CardSectionHeader,
  SectionLabel,
  FieldLabel,
  FieldError,
  NavButtons,
} from "@/components/collect/form-ui";
import { IconBuildingCommunity } from "@tabler/icons-react";
import type { CreateCandidateFormValues } from "@/lib/schemas/admin-schemas";
import { nigeriaStates } from "@/lib/data/state-lga-locations";
import { useGeoLgas } from "@/hooks/use-geo";
import type { ComboboxSelectGroup } from "@/components/ui/combobox-select";

const POSITIONS = [
  "President",
  "Governor",
  "Senator",
  "House of Representatives",
  "State Assembly",
] as const;

const CONSTITUENCY_POSITIONS = [
  "Senator",
  "House of Representatives",
  "State Assembly",
];

function getConstituencyPlaceholder(position: string) {
  switch (position) {
    case "President":
      return "Federal Republic of Nigeria";
    case "Governor":
      return "e.g., Adamawa State";
    case "Senator":
      return "e.g., Adamawa Central";
    case "House of Representatives":
      return "e.g., Fufore/Song Federal Constituency";
    case "State Assembly":
      return "e.g., Song State Constituency";
    default:
      return "Enter constituency";
  }
}

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
  const selectedStateCode = useWatch({
    control: form.control,
    name: "stateCode",
  });
  const selectedLga = useWatch({ control: form.control, name: "lga" });
  const constituency = useWatch({
    control: form.control,
    name: "constituency",
  });

  const showStateField = !!selectedPosition;
  const showLgaField =
    selectedPosition && CONSTITUENCY_POSITIONS.includes(selectedPosition);

  const { data: lgaResponse, isLoading: lgasLoading } = useGeoLgas(
    showLgaField && selectedStateCode ? selectedStateCode : null,
    { pageSize: 200 },
  );

  const lgaOptions = useMemo(
    () =>
      lgaResponse?.data.map((l) => ({
        value: l.name,
        label: l.name,
      })) ?? [],
    [lgaResponse],
  );

  const stateGroups: ComboboxSelectGroup[] = useMemo(() => {
    const zones = [
      "North Central",
      "North East",
      "North West",
      "South East",
      "South South",
      "South West",
    ] as const;
    return zones.map((zone) => ({
      heading: zone,
      options: nigeriaStates
        .filter((s) => s.zone === zone)
        .map((s) => ({
          value: s.code,
          label: s.name,
          description: s.code,
        })),
    }));
  }, []);

  function handlePositionChange(value: string) {
    setValue("position", value, { shouldValidate: true });
    setValue("stateCode", "");
    setValue("lga", "");
    if (value === "President") {
      setValue("constituency", "Federal Republic of Nigeria", {
        shouldValidate: true,
      });
    } else if (value === "Governor" && selectedStateCode) {
      const stateName = nigeriaStates.find(
        (s) => s.code === selectedStateCode,
      )?.name;
      if (stateName)
        setValue("constituency", `${stateName} State`, {
          shouldValidate: true,
        });
    } else {
      setValue("constituency", "");
    }
  }

  function handleStateChange(value: string) {
    setValue("stateCode", value, { shouldValidate: true });
    setValue("lga", "");
    if (selectedPosition === "Governor") {
      const stateName = nigeriaStates.find((s) => s.code === value)?.name;
      if (stateName)
        setValue("constituency", `${stateName} State`, {
          shouldValidate: true,
        });
    }
  }

  return (
    <StepCard>
      <CardSectionHeader
        title="Electoral Position"
        subtitle="Step 2"
        statusLabel="Candidate Registration"
        icon={<IconBuildingCommunity className="size-5" />}
      />

      <div className="space-y-4">
        {/* Position */}
        <div className="space-y-3">
          <SectionLabel
            title="Position"
            subtitle="The office the candidate is contesting for"
          />
          <div className="space-y-1.5">
            <FieldLabel>Position</FieldLabel>
            <Select
              onValueChange={handlePositionChange}
              value={selectedPosition}
            >
              <SelectTrigger className="border-border/60 h-11 rounded-sm">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError error={errors.position?.message} />
          </div>
        </div>

        {/* State & LGA */}
        {showStateField && (
          <div className="space-y-3">
            <SectionLabel
              title="Location"
              subtitle={
                selectedPosition === "President"
                  ? "Optional home state for informational purposes"
                  : "State and local government area"
              }
            />
            <div className="space-y-1.5">
              <FieldLabel optional={selectedPosition === "President"}>
                State
                {selectedPosition === "President" && (
                  <span className="text-muted-foreground ml-1 font-normal tracking-normal normal-case">
                    — home state
                  </span>
                )}
              </FieldLabel>
              <ComboboxSelect
                groups={stateGroups}
                value={selectedStateCode || ""}
                onValueChange={handleStateChange}
                placeholder="Select state..."
                searchPlaceholder="Search states..."
                emptyMessage="No state found."
              />
              <FieldError error={errors.stateCode?.message} />
            </div>

            {showLgaField && selectedStateCode && (
              <div className="space-y-1.5">
                <FieldLabel>LGA</FieldLabel>
                <ComboboxSelect
                  options={lgaOptions}
                  value={selectedLga || ""}
                  onValueChange={(val) => setValue("lga", val)}
                  placeholder="Select LGA..."
                  searchPlaceholder="Search LGAs..."
                  emptyMessage="No LGA found."
                  isLoading={lgasLoading}
                />
                <FieldError error={errors.lga?.message} />
              </div>
            )}
          </div>
        )}

        {/* Constituency */}
        <div className="space-y-3">
          <SectionLabel
            title="Constituency"
            subtitle="The electoral constituency the candidate represents"
          />
          <div className="space-y-1.5">
            <FieldLabel>Constituency</FieldLabel>
            <Input
              value={constituency || ""}
              onChange={(e) =>
                setValue("constituency", e.target.value, {
                  shouldValidate: true,
                })
              }
              placeholder={getConstituencyPlaceholder(selectedPosition)}
              className="border-border/60 h-11 rounded-sm"
            />
            <FieldError error={errors.constituency?.message} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <NavButtons onBack={onBack} onNext={onNext} />
      </div>
    </StepCard>
  );
}
