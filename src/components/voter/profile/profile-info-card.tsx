"use client";

import { type ReactNode } from "react";
import { HiPencil } from "react-icons/hi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface ProfileInfoCardProps {
  title: string;
  canEdit?: boolean;
  isLoading?: boolean;
  onEdit?: () => void;
  children: ReactNode;
}

export function ProfileInfoCard({
  title,
  canEdit = false,
  isLoading = false,
  onEdit,
  children,
}: ProfileInfoCardProps) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      toast.info("Edit functionality coming soon!");
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-all duration-200">
      <CardHeader className="border-border border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-base font-semibold sm:text-lg">
            {title}
          </h3>
          {canEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 px-3 text-xs sm:h-9 sm:text-sm"
              onClick={handleEdit}
            >
              <HiPencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ) : (
          <div className="space-y-0">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

interface InfoRowProps {
  label: string;
  value: string | ReactNode;
  isLoading?: boolean;
}

export function InfoRow({ label, value, isLoading }: InfoRowProps) {
  if (isLoading) {
    return (
      <div className="border-border/30 border-b py-3 last:border-0">
        <Skeleton className="h-5 w-full" />
      </div>
    );
  }

  // If authenticated, value should exist - no need for empty state
  if (!value) {
    return null;
  }

  return (
    <div className="border-border/30 border-b py-3 last:border-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase sm:text-sm">
          {label}
        </dt>
        <dd className="text-foreground text-sm font-semibold sm:text-base">
          {value}
        </dd>
      </div>
    </div>
  );
}
