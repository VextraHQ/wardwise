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
};

export function TrustIndicators({ items, className }: TrustIndicatorsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={cn("mx-auto max-w-2xl", className)}>
      <div className="text-muted-foreground/80 flex flex-wrap items-center justify-center gap-6 text-xs sm:gap-8">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-primary inline-flex h-4 w-4 items-center justify-center">
              {item.icon}
            </span>
            <span className="font-medium whitespace-nowrap">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
