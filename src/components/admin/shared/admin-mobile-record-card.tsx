"use client";

import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function AdminMobileRecordCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-border/60 bg-card min-w-0 rounded-sm border p-3 shadow-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AdminMobileRecordHeader({
  className,
  children,
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-w-0 items-start justify-between gap-3", className)}
    >
      {children}
    </div>
  );
}

function AdminMobileRecordTitle({
  className,
  children,
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-foreground min-w-0 text-sm font-semibold tracking-tight wrap-break-word",
        className,
      )}
    >
      {children}
    </p>
  );
}

function AdminMobileRecordMeta({
  className,
  children,
  mono,
}: React.ComponentProps<"p"> & { mono?: boolean }) {
  return (
    <p
      className={cn(
        "text-muted-foreground min-w-0 text-xs wrap-break-word",
        mono && "font-mono break-all tabular-nums",
        className,
      )}
    >
      {children}
    </p>
  );
}

function AdminMobileRecordFields({
  className,
  children,
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("mt-3 grid min-w-0 gap-2", className)}>{children}</div>
  );
}

function AdminMobileRecordField({
  label,
  value,
  children,
  mono,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-start justify-between gap-3", className)}>
      <span className="text-muted-foreground/70 max-w-[44%] shrink-0 font-mono text-[10px] font-bold tracking-widest uppercase">
        {label}
      </span>
      <div
        className={cn(
          "text-foreground min-w-0 flex-1 text-right text-sm font-medium wrap-break-word",
          mono && "font-mono text-xs break-all tabular-nums",
        )}
      >
        {children ?? value}
      </div>
    </div>
  );
}

function AdminMobileRecordSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 md:hidden">
      {Array.from({ length: rows }).map((_, index) => (
        <AdminMobileRecordCard key={index} className="border-dashed">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 rounded-sm" />
              <Skeleton className="h-3 w-1/2 rounded-sm" />
            </div>
            <Skeleton className="h-5 w-16 shrink-0 rounded-sm" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-full rounded-sm" />
            <Skeleton className="h-3 w-5/6 rounded-sm" />
            <Skeleton className="h-3 w-4/5 rounded-sm" />
          </div>
        </AdminMobileRecordCard>
      ))}
    </div>
  );
}

export {
  AdminMobileRecordCard,
  AdminMobileRecordField,
  AdminMobileRecordFields,
  AdminMobileRecordHeader,
  AdminMobileRecordMeta,
  AdminMobileRecordSkeleton,
  AdminMobileRecordTitle,
};
