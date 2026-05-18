import type { CandidateCollectCampaignSummary } from "@/features/admin/api/admin-api";

// Campaign rows as loaded for candidate list/detail transforms
export type CampaignRowForSummaries = {
  id: string;
  slug: string;
  status: string;
  clientReportEnabled: boolean;
  clientReportToken: string | null;
  clientReportLastViewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { submissions: number };
};

// Serialize campaign summary to CandidateCollectCampaignSummary
function serializeCampaignSummary(
  c: CampaignRowForSummaries,
): CandidateCollectCampaignSummary {
  return {
    id: c.id,
    slug: c.slug,
    status: c.status,
    submissionsCount: c._count.submissions,
    clientReportEnabled: c.clientReportEnabled,
    clientReportToken: c.clientReportToken,
    clientReportLastViewedAt: c.clientReportLastViewedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

// Primary Collect summary for badges, filters, and status (unchanged semantics).
export function pickCollectCampaignSummary(
  campaigns: CampaignRowForSummaries[],
): CandidateCollectCampaignSummary | null {
  const campaignPriority: Record<string, number> = {
    active: 0,
    paused: 1,
    draft: 2,
    closed: 3,
  };
  const ordered = [...campaigns].sort((left, right) => {
    const leftPriority = campaignPriority[left.status] ?? 9;
    const rightPriority = campaignPriority[right.status] ?? 9;
    if (leftPriority !== rightPriority) return leftPriority - rightPriority;
    return right.updatedAt.getTime() - left.updatedAt.getTime();
  });
  const top = ordered.at(0);
  return top ? serializeCampaignSummary(top) : null;
}

// Most recently updated draft — shortcut target when an open draft exists.
export function pickDraftCampaignSummary(
  campaigns: CampaignRowForSummaries[],
): CandidateCollectCampaignSummary | null {
  const drafts = campaigns.filter((c) => c.status === "draft");
  if (drafts.length === 0) return null;
  drafts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return serializeCampaignSummary(drafts[0]!);
}
