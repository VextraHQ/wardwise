import { prisma } from "@/lib/core/prisma";
import type { GeoLga } from "@/features/collect/types/collect.types";

export type GetCampaignLgasResult =
  | { ok: true; lgas: GeoLga[] }
  | { ok: false; reason: "campaign_not_found" | "candidate_state_missing" };

/**
 * Resolve the LGAs visible to a public Collect campaign based on its scope.
 *
 * - Constituency-scoped (Senator/HoR/State Assembly): only `enabledLgaIds`.
 * - Federal (President): all seeded LGAs.
 * - Statewide (Governor): all LGAs in the candidate's state.
 *
 * Returns a discriminated result so the route can pick the right HTTP code
 * for missing/draft campaigns and the (current) 500 case when the candidate
 * has no state code.
 */
export async function getCampaignLgas(
  slug: string,
): Promise<GetCampaignLgasResult> {
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    select: {
      enabledLgaIds: true,
      constituencyType: true,
      status: true,
      candidateId: true,
    },
  });

  if (!campaign || campaign.status === "draft") {
    return { ok: false, reason: "campaign_not_found" };
  }

  if (campaign.enabledLgaIds.length > 0) {
    const lgas = await prisma.lga.findMany({
      where: { id: { in: campaign.enabledLgaIds } },
      select: { id: true, name: true, stateCode: true },
      orderBy: { name: "asc" },
    });
    return { ok: true, lgas };
  }

  if (campaign.constituencyType === "federal") {
    const lgas = await prisma.lga.findMany({
      select: { id: true, name: true, stateCode: true },
      orderBy: { name: "asc" },
    });
    return { ok: true, lgas };
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: campaign.candidateId },
    select: { stateCode: true },
  });

  const code = candidate?.stateCode ?? null;
  if (!code) {
    return { ok: false, reason: "candidate_state_missing" };
  }

  const lgas = await prisma.lga.findMany({
    where: { stateCode: code },
    select: { id: true, name: true, stateCode: true },
    orderBy: { name: "asc" },
  });

  return { ok: true, lgas };
}
