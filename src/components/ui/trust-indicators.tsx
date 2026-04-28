"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type TrustItem = {
  icon: ReactNode;
  label: string;
};

type TrustVariant = "default" | "canvasser" | "destructive";

type TrustIndicatorsProps = {
  items: TrustItem[];
  className?: string;
  variant?: TrustVariant;
  /** @deprecated Use `variant="canvasser"` instead. Kept for back-compat. */
  canvasser?: boolean;
};

function displayLabel(label: string) {
  return label.replaceAll("_", " ");
}

function iconColorClass(variant: TrustVariant): string {
  switch (variant) {
    case "canvasser":
      return "text-amber-600";
    case "destructive":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-primary";
  }
}

export function TrustIndicators({
  items,
  className,
  variant,
  canvasser,
}: TrustIndicatorsProps) {
  if (!items || items.length === 0) return null;

  const resolvedVariant: TrustVariant =
    variant ?? (canvasser ? "canvasser" : "default");
  const iconClass = iconColorClass(resolvedVariant);

  return (
    <div className={cn("mx-auto max-w-2xl", className, "hidden sm:block")}>
      <div className="text-muted-foreground/80 flex flex-wrap items-center justify-center gap-6 text-xs">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex size-3.5 shrink-0 items-center justify-center opacity-70 [&_svg]:size-full",
                iconClass,
              )}
            >
              {item.icon}
            </div>
            <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              {displayLabel(item.label)}
            </span>
            {index < items.length - 1 && (
              <div className="bg-border ml-4 h-2.5 w-px" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
