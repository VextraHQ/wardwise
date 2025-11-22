"use client";

import { HiInformationCircle } from "react-icons/hi";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
      <HiInformationCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
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
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg border border-amber-200/50 bg-amber-50/80 px-3 py-2 text-xs text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/50 dark:text-amber-200",
          className,
        )}
      >
        <HiInformationCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
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
              className={cn(
                "inline-flex cursor-help items-center gap-1.5 text-xs text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300",
                className,
              )}
            >
              <HiInformationCircle className="h-3.5 w-3.5" />
              <span>Demo</span>
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs border-amber-200/50 bg-amber-50 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950 dark:text-amber-100"
          >
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
            className={cn(
              "cursor-help border-amber-200/50 bg-amber-50/50 text-amber-900 hover:bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-950",
              className,
            )}
          >
            {content}
          </Badge>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs border-amber-200/50 bg-amber-50 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950 dark:text-amber-100"
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
