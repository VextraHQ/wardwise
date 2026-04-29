import type { CampaignSummary } from "@/types/collect";

export const CAMPAIGN_STALE_MS = 48 * 60 * 60 * 1000; // 48 hours

// Checks if a campaign is stale (no submissions in the last 48 hours)
export function isStaleCampaign(campaign: CampaignSummary): boolean {
  if (campaign.status !== "active") return false;
  if ((campaign._count?.submissions ?? 0) === 0) return false;
  if (!campaign.lastSubmissionAt) return true;

  return (
    Date.now() - new Date(campaign.lastSubmissionAt).getTime() >
    CAMPAIGN_STALE_MS
  );
}
