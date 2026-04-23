import { formatPersonName } from "@/lib/utils";

export const campaignBrandingTypes = ["candidate", "movement", "team"] as const;

export type CampaignBrandingType = (typeof campaignBrandingTypes)[number];

export const defaultCampaignBrandingType: CampaignBrandingType = "candidate";

/** Gets the campaign branding type */
export function getCampaignBrandingType(
  brandingType: string | null | undefined,
): CampaignBrandingType {
  if (
    brandingType &&
    campaignBrandingTypes.includes(brandingType as CampaignBrandingType)
  ) {
    return brandingType as CampaignBrandingType;
  }

  return defaultCampaignBrandingType;
}

/** Normalizes the campaign display name */
export function normalizeCampaignDisplayName(
  displayName: string | null | undefined,
): string | null {
  const trimmed = displayName?.trim();
  return trimmed ? trimmed : null;
}

/** Gets the effective campaign name */
export function getEffectiveCampaignName({
  candidateName,
  displayName,
}: {
  candidateName: string;
  displayName?: string | null;
}): string {
  return (
    normalizeCampaignDisplayName(displayName) ?? formatPersonName(candidateName)
  );
}

/** Checks if the candidate title should be shown */
export function shouldShowCandidateTitle({
  brandingType,
  displayName,
}: {
  brandingType?: string | null;
  displayName?: string | null;
}): boolean {
  return (
    getCampaignBrandingType(brandingType) === "candidate" &&
    !normalizeCampaignDisplayName(displayName)
  );
}

/** Gets the branding label for a campaign */
export function getCampaignBrandingLabel(
  brandingType: string | null | undefined,
): string {
  const resolved = getCampaignBrandingType(brandingType);
  return resolved.charAt(0).toUpperCase() + resolved.slice(1);
}
