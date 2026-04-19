"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import {
  ComboboxSelect,
  type ComboboxSelectOption,
} from "@/components/ui/combobox-select";
import { FieldError } from "@/components/collect/form-ui";

export const LIST_OR_CUSTOM_OTHER_VALUE = "__other__";

interface ListOrCustomFieldProps {
  options: ComboboxSelectOption[];
  value: string;
  onChange: (value: string) => void;
  triggerAriaLabel: string;
  inputAriaLabel: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  customPlaceholder: string;
  customHintId: string;
  initialMode?: "list" | "custom";
  error?: string;
}

/**
 * Shared "pick from list or type your own" composite used in candidate forms
 * (wizard + overview edit) for fields like Title and Party. Keeps the toggle
 * UX, accessibility wiring, and styling consistent across fields.
 */
export function ListOrCustomField({
  options,
  value,
  onChange,
  triggerAriaLabel,
  inputAriaLabel,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  customPlaceholder,
  customHintId,
  initialMode = "list",
  error,
}: ListOrCustomFieldProps) {
  const [mode, setMode] = useState<"list" | "custom">(initialMode);
  const [customDraft, setCustomDraft] = useState<string>(
    initialMode === "custom" ? value : "",
  );

  function handleListSelect(next: string) {
    if (next === LIST_OR_CUSTOM_OTHER_VALUE) {
      setMode("custom");
      onChange(customDraft);
      return;
    }
    setMode("list");
    onChange(next);
  }

  function handleCustomChange(next: string) {
    setCustomDraft(next);
    onChange(next);
  }

  function handleSwitchToList() {
    setMode("list");
    onChange("");
  }

  if (mode === "custom") {
    return (
      <div className="space-y-1.5">
        <Input
          aria-label={inputAriaLabel}
          aria-describedby={customHintId}
          value={value}
          onChange={(e) => handleCustomChange(e.target.value)}
          onBlur={(e) => handleCustomChange(e.target.value.trim())}
          placeholder={customPlaceholder}
          className="border-border/60 h-11 rounded-sm"
        />
        <div className="flex items-center justify-between gap-2">
          <p id={customHintId} className="text-muted-foreground text-[11px]">
            Typed manually
          </p>
          <button
            type="button"
            className="border-border/70 bg-muted/40 text-foreground/80 hover:bg-muted/70 h-6 rounded-sm border px-2 text-[11px] font-medium transition-colors"
            onClick={handleSwitchToList}
          >
            Use list
          </button>
        </div>
        <FieldError error={error} />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <ComboboxSelect
        options={options}
        value={value || ""}
        onValueChange={handleListSelect}
        triggerAriaLabel={triggerAriaLabel}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
      />
      <FieldError error={error} />
    </div>
  );
}
