"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  HiShieldCheck,
  HiLocationMarker,
  HiCalendar,
  HiCheckCircle,
  HiLockClosed,
  HiPencil,
  HiIdentification,
  HiUserGroup,
  HiStar,
  HiInformationCircle,
} from "react-icons/hi";
import { IoMdCopy, IoMdCheckmark } from "react-icons/io";
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
  role?: "voter" | "supporter";
  vin?: string;
  canvasserCode?: string;
}

function getInitials(name: string): string {
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
  role = "voter",
  vin,
  canvasserCode,
}: ProfileHeaderProps) {
  const canEdit = daysRemaining > 0;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(registrationId);
      setCopied(true);
      toast.success("Registration ID copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (isLoading) {
    return (
      <div className="border-border/60 bg-card relative overflow-hidden border">
        <div className="border-primary absolute top-0 left-0 size-4 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-4 border-t border-r" />
        <div className="bg-primary/10 h-1 w-full" />
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 shrink-0 rounded-xl sm:size-14" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32 sm:w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-border/60 bg-card relative overflow-hidden border"
    >
      {/* Architectural Markers */}
      <div className="border-primary absolute top-0 left-0 size-4 border-t border-l" />
      <div className="border-primary absolute top-0 right-0 size-4 border-t border-r" />

      {/* Accent Strip - Role-based color */}
      <div
        className={`h-1 w-full ${
          role === "supporter"
            ? "bg-blue-500/40"
            : canvasserCode
              ? "bg-amber-500/40"
              : "bg-primary/30"
        }`}
      />

      <div className="p-4 sm:p-5">
        {/* Main Row */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative shrink-0">
                <div
                  className={`flex size-12 cursor-default items-center justify-center rounded-xl border-2 sm:size-14 ${
                    role === "supporter"
                      ? "border-blue-500/30 bg-blue-500/10"
                      : canvasserCode
                        ? "border-amber-500/30 bg-amber-500/10"
                        : "border-primary/20 bg-primary/10"
                  }`}
                >
                  <span
                    className={`text-base font-bold sm:text-lg ${
                      role === "supporter"
                        ? "text-blue-600 dark:text-blue-400"
                        : canvasserCode
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-primary"
                    }`}
                  >
                    {getInitials(fullName || "VR")}
                  </span>
                </div>
                {/* Verified dot */}
                <div className="border-background absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full border-2 bg-green-500">
                  <HiCheckCircle className="size-2.5 text-white" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">
                {role === "voter" ? "Registered Voter" : "Registered Supporter"}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h1 className="text-foreground truncate text-base font-bold sm:text-lg">
              {fullName}
            </h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-1.5">
              <HiLocationMarker className="size-3 shrink-0" />
              <span className="truncate text-xs font-medium">{state}</span>
              <span className="text-border">•</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex cursor-default items-center gap-1 text-xs font-bold text-green-600">
                    <HiShieldCheck className="size-3" />
                    Registered
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    Registered with NIN (National ID)
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* VIN Priority Badge */}
          {vin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex size-9 shrink-0 cursor-default items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <HiStar className="size-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <div className="max-w-[200px] space-y-1">
                  <p className="text-xs font-bold">Priority Voter</p>
                  <p className="text-xs">
                    You provided your VIN (Voter ID Number), giving you priority
                    status.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Canvasser Badge */}
        {canvasserCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30"
          >
            <HiUserGroup className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
              Canvasser Referred
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-amber-600/70 hover:text-amber-600 dark:text-amber-400/70 dark:hover:text-amber-400"
                >
                  <HiInformationCircle className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px] text-xs">
                  You were registered by a campaign canvasser. This helps track
                  ground campaign effectiveness.
                </p>
              </TooltipContent>
            </Tooltip>
            <Badge className="ml-auto h-5 bg-amber-200 px-2 text-[9px] font-bold text-amber-800 dark:bg-amber-800 dark:text-amber-200">
              {canvasserCode}
            </Badge>
          </motion.div>
        )}

        {/* Registration ID Row */}
        <div className="border-border/60 bg-muted/30 mt-3 flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <HiIdentification className="text-primary size-4 shrink-0" />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-foreground cursor-default truncate font-mono text-xs font-bold">
                  {registrationId}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Your unique registration ID</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-primary shrink-0 transition-colors"
                  aria-label="Copy registration ID"
                >
                  {copied ? (
                    <IoMdCheckmark className="size-3.5 text-green-600" />
                  ) : (
                    <IoMdCopy className="size-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{copied ? "Copied!" : "Copy ID"}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Status badges */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Role Badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                {role === "voter" ? (
                  <Badge
                    variant="default"
                    className="h-5 cursor-default gap-1 px-2 text-[9px] font-bold"
                  >
                    <HiShieldCheck className="size-2.5" />
                    Voter
                  </Badge>
                ) : (
                  <Badge className="h-5 cursor-default gap-1 bg-blue-100 px-2 text-[9px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    Supporter
                  </Badge>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {role === "voter"
                    ? "Registered voter"
                    : "Registered supporter (non-voter)"}
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Edit/Lock Status */}
            <Tooltip>
              <TooltipTrigger asChild>
                {canEdit ? (
                  <Badge className="h-5 cursor-default gap-1 bg-amber-100 px-2 text-[9px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    <HiPencil className="size-2.5" />
                    {daysRemaining}d
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="h-5 cursor-default gap-1 px-2 text-[9px] font-bold"
                  >
                    <HiLockClosed className="size-2.5" />
                    Locked
                  </Badge>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px] text-xs">
                  {canEdit
                    ? `${daysRemaining} days remaining to edit your profile. After this, changes require support approval.`
                    : "Profile is locked for election integrity. Contact support for changes."}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Date */}
        <div className="text-muted-foreground mt-2 flex items-center justify-end gap-1.5">
          <HiCalendar className="size-3" />
          <span className="text-[10px] font-medium">
            Registered {registrationDate}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
