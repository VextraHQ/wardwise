"use client";

import { HiViewGrid, HiViewList } from "react-icons/hi";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ViewMode = "grid" | "list";

interface ViewModeToggleProps {
  value: ViewMode;
  onValueChange: (value: ViewMode) => void;
  className?: string;
}

const VIEW_MODE_OPTIONS = [
  { value: "grid" as const, label: "Grid view", icon: HiViewGrid },
  { value: "list" as const, label: "List view", icon: HiViewList },
];

export function ViewModeToggle({
  value,
  onValueChange,
  className,
}: ViewModeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue === "grid" || nextValue === "list") {
          onValueChange(nextValue);
        }
      }}
      aria-label="View mode"
      className={cn(
        "border-border/60 bg-muted/70 inline-flex items-center rounded-sm border",
        className,
      )}
    >
      {VIEW_MODE_OPTIONS.map((option) => {
        const Icon = option.icon;

        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            size="sm"
            className={cn(
              "text-muted-foreground hover:bg-background/80 hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground rounded-[calc(var(--radius-sm)-1px)] border-0 px-1.5 shadow-none first:rounded-[calc(var(--radius-sm)-1px)] last:rounded-[calc(var(--radius-sm)-1px)] focus-visible:ring-2 focus-visible:ring-offset-1 data-[state=on]:shadow-sm data-[variant=default]:border-0",
            )}
            aria-label={option.label}
          >
            <Icon className="h-4 w-4" />
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
