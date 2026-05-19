import { prisma } from "@/lib/core/prisma";
import { getCampaignBrandingType } from "@/features/collect/lib/branding";
import type { PublicCampaign } from "@/features/collect/types/collect.types";
import { canSendRegistrationReceipt } from "@/lib/email/registration-receipt";

/**
 * Load the public-facing campaign payload for `/c/[slug]` (SSR page and JSON API).
 * Returns null when the campaign is missing or still in `draft` status — callers
 * should treat both as not-found. Closed campaigns are returned with their status
 * intact so the caller can decide between 410 (API) and rendering the closed UI.
 */
export async function getPublicCampaign(
  slug: string,
): Promise<PublicCampaign | null> {
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      candidateName: true,
      candidateTitle: true,
      brandingType: true,
      displayName: true,
      party: true,
      constituency: true,
      constituencyType: true,
      enabledLgaIds: true,
      customQuestion1: true,
      customQuestion2: true,
      status: true,
      identityRequirement: true,
      voterIdRequirement: true,
      supportGroupFieldMode: true,
      supportGroupFieldLabel: true,
      receiptEmailMode: true,
      updatedAt: true,
      campaignCanvassers: {
        select: { id: true, name: true, phone: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!campaign || campaign.status === "draft") {
    return null;
  }

  return {
    ...campaign,
    brandingType: getCampaignBrandingType(campaign.brandingType),
    receiptEmailAvailable:
      campaign.receiptEmailMode === "opt_in" && canSendRegistrationReceipt(),
    updatedAt: campaign.updatedAt.toISOString(),
  };
}
