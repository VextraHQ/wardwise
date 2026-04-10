"use client";

import { IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";
import type { ConstituencyBoundaryWarning } from "@/lib/geo/constituency";

interface ConstituencyBoundaryAlertsProps {
  warnings: ConstituencyBoundaryWarning[];
}

export function ConstituencyBoundaryAlerts({
  warnings,
}: ConstituencyBoundaryAlertsProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((warning) => {
        const isWarning = warning.severity === "warning";
        return (
          <div
            key={`${warning.severity}-${warning.title}`}
            className={
              isWarning
                ? "flex items-start gap-3 rounded-sm border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30"
                : "flex items-start gap-3 rounded-sm border border-sky-200 bg-sky-50 p-3 dark:border-sky-900/50 dark:bg-sky-950/30"
            }
          >
            {isWarning ? (
              <IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
            ) : (
              <IconInfoCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
            )}
            <div className="space-y-1 text-sm">
              <p
                className={
                  isWarning
                    ? "font-medium text-amber-800 dark:text-amber-400"
                    : "font-medium text-sky-800 dark:text-sky-300"
                }
              >
                {warning.title}
              </p>
              <p className="text-muted-foreground text-xs">
                {warning.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
