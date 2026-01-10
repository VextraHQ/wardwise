"use client";

import { motion } from "motion/react";
import {
  HiUser,
  HiLocationMarker,
  HiUsers,
  HiExternalLink,
  HiCheckCircle,
  HiShieldCheck,
  HiExclamationCircle as HiExclamationTriangle,
} from "react-icons/hi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ProfileInfoCard,
  InfoRow,
} from "@/components/voter/profile/profile-info-card";
import type { Candidate } from "@/types/candidate";

/**
 * TODO: [BACKEND] Dashboard data API
 * - GET /api/voters/:nin/dashboard
 * - Should return aggregated data for quick overview:
 *   - Candidate selections with current supporter counts
 *   - Recent notifications count
 *   - Pending surveys count
 */

/**
 * TODO: [EDGE CASE] Orphaned candidates
 * - If candidate is removed from ballot, show warning
 * - Prompt user to select replacement
 * - Track this scenario for reporting
 */

interface DashboardTabProps {
  payload: {
    basic?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: "voter" | "supporter";
      vin?: string;
      gender?: string;
      age?: number;
      occupation?: string;
      dateOfBirth?: string;
    };
    phone?: string;
    location?: {
      state?: string;
      lga?: string;
      ward?: string;
      pollingUnit?: string;
    };
    candidates?: {
      selections?: Array<{
        position: string;
        candidateId: string;
        candidateName?: string;
        candidateParty?: string;
      }>;
    };
    canvasser?: {
      canvasserCode?: string;
    };
  };
  candidatesData?: {
    candidates?: Candidate[];
  };
  isLoading: boolean;
  isLoadingVoter: boolean;
  isLoadingCandidates: boolean;
  canEdit: boolean;
  fullName: string;
}

export function DashboardTab({
  payload,
  candidatesData,
  isLoading,
  isLoadingVoter,
  isLoadingCandidates,
  canEdit,
  fullName,
}: DashboardTabProps) {
  const candidateCount = payload.candidates?.selections?.length || 0;

  /**
   * TODO: [FEATURE] Change candidate selection
   * - Should navigate to candidate selection flow
   * - Only allowed during edit window
   * - Needs confirmation dialog
   */
  const handleChangeCandidates = () => {
    console.log("Change candidates - navigate to selection flow");
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Selected Candidates Section */}
      {payload.candidates?.selections &&
        payload.candidates.selections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-foreground text-sm font-bold tracking-tight uppercase sm:text-base">
                  Selected Candidates
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="bg-primary/60 size-1.5 rounded-[1px]" />
                  <p className="text-muted-foreground font-mono text-[9px] font-medium tracking-widest uppercase sm:text-[10px]">
                    Ballot <span className="text-primary/40 mx-0.5">|</span>{" "}
                    <span className="text-foreground font-bold">
                      {candidateCount} Position{candidateCount !== 1 ? "s" : ""}
                    </span>
                  </p>
                </div>
              </div>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleChangeCandidates}
                  className="h-7 gap-1 rounded-lg px-2 text-[9px] font-bold tracking-widest uppercase sm:h-8 sm:gap-1.5 sm:px-3 sm:text-[10px]"
                >
                  <HiExternalLink className="size-3" />
                  <span className="hidden sm:inline">Change</span>
                </Button>
              )}
            </div>

            {isLoadingCandidates ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
                {[...Array(candidateCount || 3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
                {payload.candidates.selections.map((selection, index) => {
                  const fullCandidate = candidatesData?.candidates?.find(
                    (c) => c.id === selection.candidateId,
                  );

                  /**
                   * TODO: [EDGE CASE] Check if candidate still exists
                   * - If not found, show "Candidate unavailable" state
                   * - Prompt to select replacement
                   */
                  const isOrphaned = !fullCandidate && !selection.candidateName;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className={`border-border/60 bg-card hover:border-primary/30 group relative overflow-hidden border p-3 transition-colors sm:p-4 ${
                        isOrphaned
                          ? "border-amber-300 dark:border-amber-700"
                          : ""
                      }`}
                    >
                      {/* Architectural marker */}
                      <div className="border-primary/20 absolute top-0 left-0 size-2.5 border-t border-l" />

                      <div className="space-y-1.5 sm:space-y-2">
                        <Badge
                          variant="outline"
                          className="bg-muted/30 h-5 px-1.5 text-[8px] font-bold tracking-wider uppercase sm:text-[10px]"
                        >
                          {selection.position}
                        </Badge>

                        {isOrphaned ? (
                          <div className="flex items-center gap-1 text-amber-600">
                            <HiExclamationTriangle className="size-3" />
                            <span className="text-xs font-medium">
                              Unavailable
                            </span>
                          </div>
                        ) : (
                          <>
                            <h4 className="text-foreground line-clamp-1 text-xs font-bold sm:text-sm">
                              {selection.candidateName ||
                                fullCandidate?.name ||
                                "—"}
                            </h4>
                            <p className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                              {selection.candidateParty || fullCandidate?.party}
                            </p>
                            {fullCandidate?.supporters !== undefined && (
                              <div className="text-muted-foreground flex items-center gap-1">
                                <HiUsers className="size-2.5 sm:size-3" />
                                <span className="text-[9px] font-medium sm:text-[10px]">
                                  {fullCandidate.supporters.toLocaleString()}{" "}
                                  supporters
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

      {/* No candidates selected state */}
      {(!payload.candidates?.selections ||
        payload.candidates.selections.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-border/60 bg-card flex flex-col items-center justify-center border p-8 text-center"
        >
          <div className="bg-muted/50 mb-3 flex size-12 items-center justify-center rounded-xl">
            <HiUsers className="text-muted-foreground size-6" />
          </div>
          <p className="text-foreground text-sm font-medium">
            No candidates selected
          </p>
          <p className="text-muted-foreground mt-1 max-w-[200px] text-xs">
            Complete your registration to select your preferred candidates.
          </p>
          {canEdit && (
            <Button
              onClick={handleChangeCandidates}
              className="mt-4 h-9 gap-2 rounded-lg text-[10px] font-bold tracking-widest uppercase"
            >
              Select Candidates
            </Button>
          )}
        </motion.div>
      )}

      {/* Info Cards Grid */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        {/* Personal Information */}
        <ProfileInfoCard
          title="Personal Details"
          icon={<HiUser className="size-4" />}
          isLoading={isLoading}
          delay={1}
        >
          <InfoRow
            label="Full Name"
            value={fullName || undefined}
            isLoading={isLoadingVoter && !fullName}
          />
          <InfoRow
            label="Email"
            value={payload.basic?.email}
            isLoading={isLoadingVoter && !payload.basic?.email}
          />
          <InfoRow
            label="Phone"
            value={payload.phone}
            isLoading={isLoadingVoter && !payload.phone}
          />
          <InfoRow
            label="Role"
            value={
              payload.basic?.role
                ? payload.basic.role.charAt(0).toUpperCase() +
                  payload.basic.role.slice(1)
                : undefined
            }
            isLoading={isLoadingVoter && !payload.basic?.role}
          />
          {payload.basic?.gender && (
            <InfoRow
              label="Gender"
              value={
                payload.basic.gender.charAt(0).toUpperCase() +
                payload.basic.gender.slice(1)
              }
            />
          )}
        </ProfileInfoCard>

        {/* Voting Location */}
        <ProfileInfoCard
          title="Voting Location"
          icon={<HiLocationMarker className="size-4" />}
          isLoading={isLoading}
          delay={2}
        >
          <InfoRow
            label="State"
            value={payload.location?.state}
            isLoading={isLoadingVoter && !payload.location?.state}
          />
          <InfoRow
            label="LGA"
            value={payload.location?.lga}
            isLoading={isLoadingVoter && !payload.location?.lga}
          />
          <InfoRow
            label="Ward"
            value={payload.location?.ward}
            isLoading={isLoadingVoter && !payload.location?.ward}
          />
          <InfoRow
            label="Polling Unit"
            value={payload.location?.pollingUnit}
            isLoading={isLoadingVoter && !payload.location?.pollingUnit}
          />
        </ProfileInfoCard>

        {/* Canvasser Referral (if exists) */}
        {payload.canvasser?.canvasserCode && (
          <ProfileInfoCard
            title="Referral Info"
            icon={<HiUsers className="size-4" />}
            delay={3}
          >
            <InfoRow
              label="Canvasser Code"
              value={payload.canvasser.canvasserCode}
              mono
            />
            <div className="pt-2">
              <p className="text-muted-foreground text-[10px] leading-relaxed font-medium">
                You were registered via a campaign canvasser.
              </p>
            </div>
          </ProfileInfoCard>
        )}

        {/* Data Protection Notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`border-primary/20 bg-primary/5 relative overflow-hidden border p-4 sm:p-5 ${
            !payload.canvasser?.canvasserCode ? "lg:col-span-2" : ""
          }`}
        >
          <div className="border-primary/30 absolute top-0 left-0 size-3 border-t border-l" />

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9">
              <HiShieldCheck className="size-4 sm:size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-foreground text-xs font-bold sm:text-sm">
                Data Protection
              </h4>
              <p className="text-muted-foreground mt-1 text-[10px] leading-relaxed sm:text-xs">
                Your data is protected by NDPA 2023. Encrypted, private, and
                never sold.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge
                  variant="secondary"
                  className="h-5 gap-1 px-1.5 text-[8px] font-bold tracking-wider uppercase"
                >
                  <HiCheckCircle className="size-2" />
                  Encrypted
                </Badge>
                <Badge
                  variant="secondary"
                  className="h-5 gap-1 px-1.5 text-[8px] font-bold tracking-wider uppercase"
                >
                  <HiCheckCircle className="size-2" />
                  Private
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
