"use client";

import { ComboboxSelect } from "@/components/ui/combobox-select";
import type {
  ConstituencyPreset,
  UnsupportedConstituencyPreset,
} from "@/lib/data/nigerian-constituencies";

interface OfficialConstituencySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  presets: ConstituencyPreset[];
  unsupportedPresets?: UnsupportedConstituencyPreset[];
  unmatchedNames?: string[];
  position: "Senator" | "House of Representatives" | "State Assembly";
  disabled?: boolean;
  isLoading?: boolean;
}

export function OfficialConstituencySelector({
  value,
  onValueChange,
  presets,
  unsupportedPresets = [],
  unmatchedNames = [],
  position,
  disabled,
  isLoading,
}: OfficialConstituencySelectorProps) {
  return (
    <div className="space-y-1.5">
      <ComboboxSelect
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        isLoading={isLoading}
        options={[
          {
            value: "__custom__",
            label: "Custom (manual selection)",
            description: "Skip preset — pick LGAs manually",
          },
          ...presets.map((preset) => ({
            value: preset.shortName,
            label: preset.shortName,
            description: preset.name,
          })),
        ]}
        placeholder="Select official constituency..."
        searchPlaceholder="Search constituencies..."
        emptyMessage="No constituency found."
      />

      {unmatchedNames.length > 0 && (
        <p className="text-muted-foreground text-xs">
          <span className="font-medium text-amber-600 dark:text-amber-500">
            {unmatchedNames.length} LGA{unmatchedNames.length > 1 ? "s" : ""}{" "}
            not yet seeded:
          </span>{" "}
          {unmatchedNames.join(", ")}
        </p>
      )}

      {unsupportedPresets.length > 0 && (
        <p className="text-muted-foreground text-xs">
          <span className="font-medium text-sky-700 dark:text-sky-400">
            {unsupportedPresets.length} official{" "}
            {position === "House of Representatives"
              ? "federal constituency"
              : "constituency"}{" "}
            option{unsupportedPresets.length > 1 ? "s are" : " is"} not in this
            preset list yet
          </span>{" "}
          because {unsupportedPresets.length > 1 ? "they" : "it"} split
          {unsupportedPresets.length > 1 ? "" : "s"} inside a single LGA and
          need finer-grained boundary support. Affected seat
          {unsupportedPresets.length > 1 ? "s" : ""}:{" "}
          {unsupportedPresets.map((preset) => preset.shortName).join(", ")}.
        </p>
      )}
    </div>
  );
}
