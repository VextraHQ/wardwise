"use client";

import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DemoIndicatorProps {
  variant?: "badge" | "inline" | "banner";
  className?: string;
}

export function DemoIndicator({
  variant = "badge",
  className,
}: DemoIndicatorProps) {
  const content = (
    <div className="flex items-center gap-1.5">
      <Info className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">Demo Mode</span>
    </div>
  );

  const tooltipContent = (
    <div className="space-y-1.5 text-xs">
      <p className="font-semibold">Demo Environment</p>
      <p>
        NIN verification is currently mocked for demonstration purposes. In
        production, this will connect to the real NIMC database for secure
        identity verification.
      </p>
    </div>
  );

  if (variant === "banner") {
    return (
      <div
        className={`flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900 ${className}`}
      >
        <Info className="h-4 w-4 shrink-0" />
        <span>
          <span className="font-semibold">Demo Mode:</span> NIN verification is
          mocked. Production will use real NIMC database.
        </span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={`text-muted-foreground inline-flex items-center gap-1.5 text-xs ${className}`}
            >
              <Info className="h-3.5 w-3.5" />
              <span>Demo</span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default: badge variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`cursor-help border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-50 ${className}`}
          >
            {content}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
