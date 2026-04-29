"use client";

import { useMemo } from "react";
import { IconExclamationCircle } from "@tabler/icons-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  campaignDisplay,
  candidateDisplay,
  type PriorityBucket,
} from "@/lib/admin/dashboard";
import {
  CommandStrip,
  CoverageStrip,
  HealthRail,
  LiveCampaignsSection,
  PriorityQueue,
  QuickMoves,
  RecentCandidatesSection,
} from "@/components/admin/admin-dashboard-sections";
import {
  useAdminCandidates,
  useAdminDashboardSummary,
} from "@/hooks/use-admin";
import { useCampaigns } from "@/hooks/use-collect";
import { isStaleCampaign } from "@/lib/collect/campaign-health";
import { positionRequiresLgas } from "@/lib/geo/constituency";
import type { CandidateWithUser } from "@/lib/api/admin";
import type { CampaignSummary } from "@/types/collect";

// This function builds up all the buckets of issues that need admin attention.
// Each bucket is a grouping of problems (like candidates missing info, stale campaigns, etc)
function buildPriorityBuckets({
  staleActiveCampaigns,
  activeCampaignsNoSubmissions,
  pendingCredentials,
  candidatesWithoutCollect,
  suspendedCandidates,
  missingConstituencyLgas,
  insightsOff,
  draftCampaigns,
}: {
  staleActiveCampaigns: CampaignSummary[];
  activeCampaignsNoSubmissions: CampaignSummary[];
  pendingCredentials: CandidateWithUser[];
  candidatesWithoutCollect: CandidateWithUser[];
  suspendedCandidates: CandidateWithUser[];
  missingConstituencyLgas: CandidateWithUser[];
  insightsOff: CampaignSummary[];
  draftCampaigns: CampaignSummary[];
}): PriorityBucket[] {
  return [
    // High-priority: Stale campaigns, campaigns without submissions
    {
      key: "stale-active",
      severity: "high",
      title: "Stale active campaigns",
      description: "Active campaigns with no submissions in the last 48 hours.",
      count: staleActiveCampaigns.length,
      cta: { href: "/admin/collect", label: "Open Collect" },
      examples: staleActiveCampaigns.slice(0, 2).map(campaignDisplay),
    },
    {
      key: "no-submissions",
      severity: "high",
      title: "Active without submissions",
      description: "Active campaigns that haven’t received any submissions.",
      count: activeCampaignsNoSubmissions.length,
      cta: { href: "/admin/collect", label: "Review campaigns" },
      examples: activeCampaignsNoSubmissions.slice(0, 2).map(campaignDisplay),
    },
    // Medium-priority: Onboarding, missing info, suspended users
    {
      key: "pending-credentials",
      severity: "med",
      title: "Pending credentials",
      description: "Candidate logins not yet delivered or activated.",
      count: pendingCredentials.length,
      cta: { href: "/admin/candidates", label: "Review accounts" },
      examples: pendingCredentials.slice(0, 2).map(candidateDisplay),
    },
    {
      key: "without-collect",
      severity: "med",
      title: "Candidates without Collect",
      description: "Candidates that don’t have a Collect campaign yet.",
      count: candidatesWithoutCollect.length,
      cta: { href: "/admin/candidates", label: "Open candidates" },
      examples: candidatesWithoutCollect.slice(0, 2).map(candidateDisplay),
    },
    {
      key: "suspended",
      severity: "med",
      title: "Suspended accounts",
      description: "Candidate accounts currently suspended.",
      count: suspendedCandidates.length,
      cta: { href: "/admin/candidates", label: "View accounts" },
      examples: suspendedCandidates.slice(0, 2).map(candidateDisplay),
    },
    {
      key: "missing-lgas",
      severity: "med",
      title: "Missing constituency LGAs",
      description:
        "Constituency-level candidates without a configured LGA list.",
      count: missingConstituencyLgas.length,
      cta: { href: "/admin/candidates", label: "Fix setup" },
      examples: missingConstituencyLgas.slice(0, 2).map(candidateDisplay),
    },
    // Low-priority: Non-blocking checks
    {
      key: "insights-off",
      severity: "low",
      title: "Campaign Insights off",
      description: "Live campaigns with the client report disabled.",
      count: insightsOff.length,
      cta: { href: "/admin/collect", label: "Open Collect" },
      examples: insightsOff.slice(0, 2).map(campaignDisplay),
    },
    {
      key: "drafts",
      severity: "low",
      title: "Draft campaigns",
      description: "Campaigns that haven’t been published yet.",
      count: draftCampaigns.length,
      cta: { href: "/admin/collect", label: "Resume setup" },
      examples: draftCampaigns.slice(0, 2).map(campaignDisplay),
    },
  ];
}

// Sort campaigns so that active come first, then draft, then others
// Also sorts by most recently modified
function rankCampaigns(campaigns: CampaignSummary[]) {
  return [...campaigns].sort((a, b) => {
    const rank = (campaign: CampaignSummary) => {
      if (campaign.status === "active") return 0;
      if (campaign.status === "draft") return 1;
      return 2;
    };

    const statusRank = rank(a) - rank(b);
    if (statusRank !== 0) return statusRank;

    // More recent campaigns at top
    const aTime = new Date(
      a.lastSubmissionAt ?? a.updatedAt ?? a.createdAt,
    ).getTime();
    const bTime = new Date(
      b.lastSubmissionAt ?? b.updatedAt ?? b.createdAt,
    ).getTime();

    return bTime - aTime;
  });
}

export function AdminDashboard() {
  // Fetch all candidate data, campaign data, and summary stats
  const {
    data: candidates = [],
    isLoading: candidatesLoading,
    error: candidatesError,
  } = useAdminCandidates();
  const {
    data: campaigns = [],
    isLoading: campaignsLoading,
    error: campaignsError,
  } = useCampaigns();
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useAdminDashboardSummary();

  // Any loading state for main entities
  const isLoadingEntities = candidatesLoading || campaignsLoading;

  // Group candidates into buckets based on what needs admin attention
  const candidateBuckets = useMemo(() => {
    // Candidates waiting for account delivery/activation
    const pendingCredentials = candidates.filter((candidate) =>
      ["pending", "credentials_sent"].includes(candidate.onboardingStatus),
    );
    // Candidates without an associated Collect campaign
    const candidatesWithoutCollect = candidates.filter(
      (candidate) => !candidate.collectCampaign,
    );
    // Suspended accounts
    const suspendedCandidates = candidates.filter(
      (candidate) => candidate.onboardingStatus === "suspended",
    );
    // Those who should have LGAs assigned but don't
    const missingConstituencyLgas = candidates.filter(
      (candidate) =>
        positionRequiresLgas(candidate.position) &&
        (candidate.constituencyLgaIds?.length ?? 0) === 0,
    );

    return {
      pendingCredentials,
      candidatesWithoutCollect,
      suspendedCandidates,
      missingConstituencyLgas,
    };
  }, [candidates]);

  // Similarly, group campaigns by key signals
  const campaignBuckets = useMemo(() => {
    // All running campaigns
    const activeCampaigns = campaigns.filter(
      (campaign) => campaign.status === "active",
    );
    // Campaigns set up but not yet running
    const draftCampaigns = campaigns.filter(
      (campaign) => campaign.status === "draft",
    );
    // Active campaigns but with no submissions so far
    const activeCampaignsNoSubmissions = activeCampaigns.filter(
      (campaign) => (campaign._count?.submissions ?? 0) === 0,
    );
    // Active campaigns that haven't had submissions recently
    const staleActiveCampaigns = activeCampaigns.filter(isStaleCampaign);
    // Non-draft campaigns with client report disabled
    const insightsOff = campaigns.filter(
      (campaign) =>
        campaign.status !== "draft" &&
        (!campaign.clientReportEnabled || !campaign.clientReportToken),
    );

    return {
      activeCampaigns,
      draftCampaigns,
      activeCampaignsNoSubmissions,
      staleActiveCampaigns,
      insightsOff,
    };
  }, [campaigns]);

  // Total number of issues needing immediate attention
  const attentionTotal =
    candidateBuckets.candidatesWithoutCollect.length +
    candidateBuckets.pendingCredentials.length +
    candidateBuckets.suspendedCandidates.length +
    candidateBuckets.missingConstituencyLgas.length +
    campaignBuckets.draftCampaigns.length +
    campaignBuckets.activeCampaignsNoSubmissions.length +
    campaignBuckets.staleActiveCampaigns.length +
    campaignBuckets.insightsOff.length;

  // Compose all alert buckets for display in priority queue
  const priorityBuckets = useMemo(
    () =>
      buildPriorityBuckets({
        staleActiveCampaigns: campaignBuckets.staleActiveCampaigns,
        activeCampaignsNoSubmissions:
          campaignBuckets.activeCampaignsNoSubmissions,
        pendingCredentials: candidateBuckets.pendingCredentials,
        candidatesWithoutCollect: candidateBuckets.candidatesWithoutCollect,
        suspendedCandidates: candidateBuckets.suspendedCandidates,
        missingConstituencyLgas: candidateBuckets.missingConstituencyLgas,
        insightsOff: campaignBuckets.insightsOff,
        draftCampaigns: campaignBuckets.draftCampaigns,
      }),
    [candidateBuckets, campaignBuckets],
  );

  // Top 5 most relevant campaigns (sorted by status and recentness)
  const liveCampaigns = useMemo(
    () => rankCampaigns(campaigns).slice(0, 5),
    [campaigns],
  );

  // Top 5 most recently created candidates
  const recentCandidates = useMemo(
    () =>
      [...candidates]
        .sort(
          (a, b) =>
            new Date(b.user.createdAt).getTime() -
            new Date(a.user.createdAt).getTime(),
        )
        .slice(0, 5),
    [candidates],
  );

  // Quick snapshot of overall candidate coverage (totals, national, parties, top positions)
  const coverageSnapshot = useMemo(() => {
    // Number of national-level candidates
    const nationalCandidates = candidates.filter(
      (candidate) => candidate.isNational,
    ).length;
    // Number of distinct political parties
    const distinctParties = Array.from(
      new Set(candidates.map((candidate) => candidate.party).filter(Boolean)),
    ).length;
    // Top 4 most common candidate positions
    const topPositions = Object.entries(
      candidates.reduce<Record<string, number>>((counts, candidate) => {
        counts[candidate.position] = (counts[candidate.position] ?? 0) + 1;
        return counts;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return {
      totalCandidates: candidates.length,
      nationalCandidates,
      distinctParties,
      topPositions,
    };
  }, [candidates]);

  return (
    <div className="flex flex-1 flex-col gap-5 p-3 sm:gap-6 sm:p-4 md:p-6">
      {/* Summary bar at the top */}
      <CommandStrip
        liveCampaigns={campaignBuckets.activeCampaigns.length}
        prioritySignals={attentionTotal}
        staleCount={campaignBuckets.staleActiveCampaigns.length}
        registrationsToday={summary?.registrations.today ?? null}
        summaryLoading={summaryLoading}
        summaryError={Boolean(summaryError)}
        updatedAt={summary?.updatedAt ?? null}
      />

      {/* Show an alert if anything failed to load */}
      {(candidatesError || campaignsError) && (
        <Alert
          variant="destructive"
          className="border-destructive/30 bg-destructive/10 rounded-sm shadow-none"
        >
          <IconExclamationCircle className="h-4 w-4" />
          <AlertTitle className="font-mono text-[11px] font-bold tracking-widest uppercase">
            {candidatesError && campaignsError
              ? "Failed to load dashboard data"
              : candidatesError
                ? "Failed to load candidates"
                : "Failed to load campaigns"}
          </AlertTitle>
          <AlertDescription className="text-destructive/80 text-xs">
            {candidatesError instanceof Error
              ? candidatesError.message
              : campaignsError instanceof Error
                ? campaignsError.message
                : "An unexpected error occurred."}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick links section */}
      <QuickMoves />

      {/* Main dashboard section: queue of priorities and health metrics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <PriorityQueue
          isLoading={isLoadingEntities}
          buckets={priorityBuckets}
          total={attentionTotal}
        />
        <HealthRail
          isLoadingEntities={isLoadingEntities}
          summary={summary}
          summaryLoading={summaryLoading}
          summaryError={Boolean(summaryError)}
          pendingCredentialsCount={candidateBuckets.pendingCredentials.length}
          candidatesWithoutCollectCount={
            candidateBuckets.candidatesWithoutCollect.length
          }
          activeCampaignsCount={campaignBuckets.activeCampaigns.length}
          draftCampaignsCount={campaignBuckets.draftCampaigns.length}
          staleCampaignsCount={campaignBuckets.staleActiveCampaigns.length}
          insightsOffCount={campaignBuckets.insightsOff.length}
        />
      </div>

      {/* Show latest campaigns on the left and latest candidates on the right */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
        <LiveCampaignsSection
          campaigns={liveCampaigns}
          isLoading={isLoadingEntities}
        />
        <RecentCandidatesSection
          candidates={recentCandidates}
          isLoading={isLoadingEntities}
        />
      </div>

      {/* Quick coverage stats at the bottom */}
      <CoverageStrip
        isLoading={isLoadingEntities}
        totalCandidates={coverageSnapshot.totalCandidates}
        nationalCandidates={coverageSnapshot.nationalCandidates}
        distinctParties={coverageSnapshot.distinctParties}
        topPositions={coverageSnapshot.topPositions}
      />
    </div>
  );
}
