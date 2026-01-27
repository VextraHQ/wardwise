"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  HiUserGroup,
  HiLocationMarker,
  HiPhone,
  HiCheckCircle,
  HiOfficeBuilding,
  HiInformationCircle,
} from "react-icons/hi";
import { IoMdCopy, IoMdCheckmark } from "react-icons/io";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

/**
 * TODO: [BACKEND] Canvasser profile API
 * - GET /api/canvassers/:code/profile
 * - Returns: name, phone, code, candidate info, assigned territory
 */

interface CanvasserProfileCardProps {
  name: string;
  phone: string;
  canvasserCode: string;
  candidateName?: string;
  candidateParty?: string;
  candidatePosition?: string;
  territory?: {
    state?: string;
    lga?: string;
    wards?: string[];
  };
  stats?: {
    totalVoters: number;
    registered: number;
    incomplete: number;
    completionRate: number;
  };
  isLoading?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CanvasserProfileCard({
  name,
  phone,
  canvasserCode,
  candidateName,
  candidateParty,
  candidatePosition,
  territory,
  stats,
  isLoading = false,
}: CanvasserProfileCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(canvasserCode);
      setCopied(true);
      toast.success("Canvasser code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (isLoading) {
    return (
      <div className="border-border/60 bg-card relative overflow-hidden border">
        <div className="absolute top-0 left-0 size-4 border-t border-l border-amber-500" />
        <div className="absolute top-0 right-0 size-4 border-t border-r border-amber-500" />
        <div className="h-1 w-full bg-amber-500/30" />
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
      <div className="absolute top-0 left-0 size-4 border-t border-l border-amber-500" />
      <div className="absolute top-0 right-0 size-4 border-t border-r border-amber-500" />

      {/* Amber Accent Strip */}
      <div className="h-1 w-full bg-amber-500/40" />

      <div className="p-4 sm:p-5">
        {/* Main Row */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative shrink-0">
                <div className="flex size-12 cursor-default items-center justify-center rounded-xl border-2 border-amber-500 bg-amber-500/10 sm:size-14">
                  <span className="text-base font-bold text-amber-600 sm:text-lg dark:text-amber-400">
                    {getInitials(name || "CA")}
                  </span>
                </div>
                {/* Active dot */}
                <div className="border-background absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full border-2 bg-green-500">
                  <HiCheckCircle className="size-2.5 text-white" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">Active Canvasser</p>
            </TooltipContent>
          </Tooltip>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h1 className="text-foreground truncate text-base font-bold sm:text-lg">
              {name}
            </h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-1.5">
              <HiPhone className="size-3 shrink-0" />
              <span className="truncate text-xs font-medium">{phone}</span>
              <span className="text-border">•</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex cursor-default items-center gap-1 text-xs font-bold text-amber-600">
                    <HiUserGroup className="size-3" />
                    Field Agent
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    Authorized to register voters on behalf of candidate
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Canvasser Code Row */}
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <HiUserGroup className="size-4 shrink-0 text-amber-600" />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-foreground cursor-default truncate font-mono text-xs font-bold">
                  {canvasserCode}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Your unique canvasser ID</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-muted-foreground shrink-0 transition-colors hover:text-amber-600"
                  aria-label="Copy canvasser code"
                >
                  {copied ? (
                    <IoMdCheckmark className="size-3.5 text-green-600" />
                  ) : (
                    <IoMdCopy className="size-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{copied ? "Copied!" : "Copy code"}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Status badges */}
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge className="h-5 cursor-default gap-1 bg-amber-100 px-2 text-[9px] font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              <HiUserGroup className="size-2.5" />
              Canvasser
            </Badge>
          </div>
        </div>

        {/* Assigned Candidate (if exists) */}
        {candidateName && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-muted/30 border-border/60 mt-3 rounded-lg border px-3 py-2.5"
          >
            <div className="text-muted-foreground flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
              <HiOfficeBuilding className="size-3" />
              <span>Assigned Candidate</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground/70 hover:text-muted-foreground"
                  >
                    <HiInformationCircle className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px] text-xs">
                    Voters you register will be associated with this candidate's
                    campaign.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-bold">
                  {candidateName}
                </p>
                <p className="text-muted-foreground text-[10px] font-medium">
                  {candidateParty} • {candidatePosition}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Assigned Territory (if exists) */}
        {territory && (territory.state || territory.lga) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-muted/30 border-border/60 mt-3 rounded-lg border px-3 py-2.5"
          >
            <div className="text-muted-foreground flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
              <HiLocationMarker className="size-3" />
              <span>Assigned Territory</span>
            </div>
            <div className="mt-1.5">
              <p className="text-foreground text-sm font-bold">
                {territory.state}
                {territory.lga && ` > ${territory.lga}`}
              </p>
              {territory.wards && territory.wards.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {territory.wards.slice(0, 3).map((ward) => (
                    <Badge
                      key={ward}
                      variant="outline"
                      className="h-5 px-1.5 text-[9px] font-medium"
                    >
                      {ward}
                    </Badge>
                  ))}
                  {territory.wards.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-[9px] font-medium"
                    >
                      +{territory.wards.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Quick Stats Row */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border-border/60 divide-border/40 mt-3 grid grid-cols-4 divide-x rounded-lg border"
          >
            <div className="p-2 text-center">
              <p className="text-foreground text-lg font-black sm:text-xl">
                {stats.totalVoters}
              </p>
              <p className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase sm:text-[9px]">
                Total
              </p>
            </div>
            <div className="p-2 text-center">
              <p className="text-lg font-black text-green-600 sm:text-xl">
                {stats.registered}
              </p>
              <p className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase sm:text-[9px]">
                Registered
              </p>
            </div>
            <div className="p-2 text-center">
              <p className="text-lg font-black text-amber-600 sm:text-xl">
                {stats.incomplete}
              </p>
              <p className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase sm:text-[9px]">
                Incomplete
              </p>
            </div>
            <div className="p-2 text-center">
              <p className="text-lg font-black text-blue-600 sm:text-xl">
                {stats.completionRate}%
              </p>
              <p className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase sm:text-[9px]">
                Rate
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
