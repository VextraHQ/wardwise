"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileInfoCardProps {
  title: string;
  icon?: ReactNode;
  isLoading?: boolean;
  children: ReactNode;
  delay?: number;
}

export function ProfileInfoCard({
  title,
  icon,
  isLoading = false,
  children,
  delay = 0,
}: ProfileInfoCardProps) {
  if (isLoading) {
    return (
      <div className="border-border/60 bg-card relative overflow-hidden border">
        <div className="border-primary/30 absolute top-0 left-0 size-3 border-t border-l" />
        <div className="p-4">
          <Skeleton className="mb-3 h-5 w-28" />
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      className="border-border/60 bg-card relative overflow-hidden border"
    >
      {/* Architectural Marker */}
      <div className="border-primary/30 absolute top-0 left-0 size-3 border-t border-l" />

      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          {icon && (
            <div className="bg-primary/5 text-primary border-primary/20 flex size-7 items-center justify-center rounded-lg border sm:size-8">
              {icon}
            </div>
          )}
          <h3 className="text-foreground text-xs font-bold tracking-tight uppercase sm:text-sm">
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="space-y-0">{children}</div>
      </div>
    </motion.div>
  );
}

interface InfoRowProps {
  label: string;
  value?: string | ReactNode;
  isLoading?: boolean;
  mono?: boolean;
}

export function InfoRow({
  label,
  value,
  isLoading,
  mono = false,
}: InfoRowProps) {
  if (isLoading) {
    return (
      <div className="border-border/20 border-b py-2 last:border-0">
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!value) {
    return null;
  }

  return (
    <div className="border-border/20 border-b py-2 last:border-0">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <dt className="text-muted-foreground text-xs font-bold tracking-widest uppercase sm:text-xs">
          {label}
        </dt>
        <dd
          className={`text-foreground text-xs font-semibold ${
            mono ? "font-mono tracking-wide" : ""
          }`}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}
