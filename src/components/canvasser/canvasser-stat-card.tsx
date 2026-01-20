"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * TODO: [BACKEND] Stat data API
 * - GET /api/canvassers/:code/stats
 * - Returns: totalVoters, verified, pending, weeklyCount, monthlyTarget
 */

interface CanvasserStatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  isLoading?: boolean;
  delay?: number;
  progress?: {
    current: number;
    total: number;
  };
}

export function CanvasserStatCard({
  label,
  value,
  subValue,
  icon,
  iconBgColor = "bg-amber-500/10",
  iconColor = "text-amber-600",
  isLoading = false,
  delay = 0,
  progress,
}: CanvasserStatCardProps) {
  if (isLoading) {
    return (
      <div className="border-border/60 bg-card relative overflow-hidden border">
        <div className="absolute top-0 left-0 size-3 border-t border-l border-amber-500" />
        <div className="p-4">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="mb-1 h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );
  }

  const progressPercentage = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      className="border-border/60 bg-card group relative overflow-hidden border transition-colors hover:border-amber-500"
    >
      {/* Architectural Marker */}
      <div className="absolute top-0 left-0 size-3 border-t border-l border-amber-500" />

      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Label */}
            <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase sm:text-[10px]">
              {label}
            </p>

            {/* Value */}
            <p className="text-foreground mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              {value}
            </p>

            {/* Sub value */}
            {subValue && (
              <p className="text-muted-foreground mt-0.5 text-[10px] font-medium sm:text-xs">
                {subValue}
              </p>
            )}

            {/* Progress bar */}
            {progress && (
              <div className="mt-2 space-y-1">
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <motion.div
                    className="h-full rounded-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.8, delay: delay * 0.1 + 0.2 }}
                  />
                </div>
                <p className="text-muted-foreground text-[9px] font-medium">
                  {progress.current} / {progress.total}
                </p>
              </div>
            )}
          </div>

          {/* Icon */}
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10 ${iconBgColor}`}
          >
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
