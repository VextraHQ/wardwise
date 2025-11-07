"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HiLogout } from "react-icons/hi";
import { HiLockClosed, HiPencil } from "react-icons/hi";
import { HiCalendar } from "react-icons/hi";
import { HiCheckCircle } from "react-icons/hi";
import { IoMdCopy } from "react-icons/io";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ProfileHeaderProps {
  fullName: string;
  state: string;
  registrationId: string;
  registrationDate: string;
  daysRemaining: number;
  isLoading: boolean;
  onLogout: () => void;
}

function formatDateForBadge(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileHeader({
  fullName,
  state,
  registrationId,
  registrationDate,
  daysRemaining,
  isLoading,
  onLogout,
}: ProfileHeaderProps) {
  // Derive canEdit from daysRemaining
  const canEdit = daysRemaining > 0;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(registrationId);
      setCopied(true);
      toast.success("Registration ID copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy registration ID");
    }
  };
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="border-border bg-muted flex h-12 w-12 items-center justify-center rounded-full border-2 sm:h-16 sm:w-16">
              {isLoading ? (
                <Skeleton className="h-12 w-12 rounded-full sm:h-16 sm:w-16" />
              ) : (
                <span className="text-foreground text-base font-semibold sm:text-xl">
                  {getInitials(fullName || "Voter")}
                </span>
              )}
            </div>
            {!isLoading && (
              <div className="border-background absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-green-500 sm:h-5 sm:w-5">
                <HiCheckCircle className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
              </div>
            )}
          </div>

          {/* Name & Info */}
          <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-32 sm:h-8 sm:w-48" />
                <Skeleton className="h-3 w-24 sm:h-4 sm:w-40" />
                <Skeleton className="h-3 w-20 sm:h-3 sm:w-32" />
              </>
            ) : (
              <>
                <h1 className="text-foreground truncate text-lg font-semibold sm:text-2xl">
                  {fullName || "Voter Profile"}
                </h1>
                <p className="text-muted-foreground truncate text-xs sm:text-sm">
                  {state || "Adamawa State"} • Registered Voter
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="text-muted-foreground truncate font-mono text-[10px] sm:text-xs">
                    ID: {registrationId}
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                        aria-label="Copy registration ID"
                      >
                        <IoMdCopy className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p>{copied ? "Copied!" : "Copy registration ID"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="text-destructive hover:text-destructive h-8 w-8 gap-0 p-0 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3"
          >
            <HiLogout className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b pb-2 sm:gap-2 sm:pb-3">
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-28" />
          </>
        ) : (
          <>
            <Badge variant="secondary" className="gap-1.5">
              <HiCheckCircle className="h-3 w-3" />
              Verified
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <HiCalendar className="h-3 w-3" />
              <span className="hidden sm:inline">{registrationDate}</span>
              <span className="sm:hidden">
                {formatDateForBadge(registrationDate)}
              </span>
            </Badge>
            {canEdit ? (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Badge variant="default" className="gap-1.5">
                    <HiPencil className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      {daysRemaining} days to edit
                    </span>
                    <span className="sm:hidden">{daysRemaining}d left</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                  <p>
                    You can edit your profile for {daysRemaining} more day
                    {daysRemaining !== 1 ? "s" : ""}. After that, it will be
                    locked for election integrity.
                  </p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="gap-1.5">
                    <HiLockClosed className="h-3 w-3" />
                    Locked
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                  <p>
                    Your profile is locked to maintain election integrity.
                    Contact support if you need changes.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </div>
  );
}
