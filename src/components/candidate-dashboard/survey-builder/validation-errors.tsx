"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconAlertCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface ValidationErrorsProps {
  errors: string[];
  className?: string;
}

export function ValidationErrors({ errors, className }: ValidationErrorsProps) {
  if (errors.length === 0) return null;

  return (
    <Alert variant="destructive" className={cn("mb-4", className)}>
      <IconAlertCircle className="size-4" />
      <AlertTitle>Please fix the following errors:</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
