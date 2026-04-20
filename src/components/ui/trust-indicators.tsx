"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type TrustItem = {
  icon: ReactNode;
  label: string;
};

type TrustIndicatorsProps = {
  items: TrustItem[];
  className?: string;
  canvasser?: boolean;
};

function displayLabel(label: string) {
  return label.replaceAll("_", " ");
}

export function TrustIndicators({
  items,
  className,
  canvasser,
}: TrustIndicatorsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={cn("mx-auto max-w-2xl", className, "hidden sm:block")}>
      <div className="text-muted-foreground/80 flex flex-wrap items-center justify-center gap-6 text-xs">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <div
              className={cn(
                "size-3.5 shrink-0 opacity-70",
                canvasser ? "text-amber-600" : "text-primary",
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
