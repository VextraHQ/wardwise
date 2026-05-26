"use client";

import { cn } from "@/lib/utils";

export type AdminFilterTabOption<T extends string = string> = {
  value: T;
  label: string;
  count?: number | string;
};

type AdminFilterTabsProps<T extends string = string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly AdminFilterTabOption<T>[];
  ariaLabel: string;
  className?: string;
};

function formatFilterCount(count: number | string): string {
  return typeof count === "number" ? count.toLocaleString() : count;
}

export function AdminFilterTabs<T extends string = string>({
  value,
  onValueChange,
  options,
  ariaLabel,
  className,
}: AdminFilterTabsProps<T>) {
  return (
    <div
      className={cn(
        "border-border/60 bg-muted/25 w-fit max-w-full min-w-0 rounded-sm border p-0.5",
        className,
      )}
    >
      <div
        role="group"
        aria-label={ariaLabel}
        className={cn(
          "flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "mask-[linear-gradient(90deg,#000_0,#000_calc(100%-1.75rem),transparent)] [-webkit-mask-image:linear-gradient(90deg,#000_0,#000_calc(100%-1.75rem),transparent)] sm:mask-none sm:[-webkit-mask-image:none]",
        )}
      >
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onValueChange(option.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-[calc(var(--radius-sm)-1px)] border px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-widest whitespace-nowrap uppercase transition-[color,background-color,border-color,box-shadow] duration-150",
                "focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
                isActive
                  ? "border-primary/20 bg-background text-primary"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground border-transparent",
              )}
            >
              <span>{option.label}</span>
              {option.count !== undefined ? (
                <span
                  className={cn(
                    "rounded-sm px-1.5 py-px text-[9px] leading-none font-bold tabular-nums sm:text-[10px]",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-background/80 text-muted-foreground/80",
                  )}
                >
                  {formatFilterCount(option.count)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
