import { type z } from "zod";
import { prisma } from "@/lib/core/prisma";
import { type offlinePackRequestSchema } from "@/features/collect/schemas/collect-schemas";
import type {
  GeoLga,
  GeoWard,
  GeoPollingUnit,
} from "@/features/collect/types/collect.types";

export type BuildOfflinePackInput = z.infer<typeof offlinePackRequestSchema>;

export type BuildOfflinePackResult =
  | {
      ok: true;
      campaignUpdatedAt: string;
      lgas: GeoLga[];
      wards: GeoWard[];
      pollingUnits: GeoPollingUnit[];
    }
  | {
      ok: false;
      reason:
        | "campaign_not_found"
        | "campaign_closed"
        | "candidate_state_missing";
    }
  | {
      ok: false;
      reason: "lgas_out_of_scope";
      outOfScope: number[];
    };

/**
 * Assemble the offline geo pack (LGAs, wards, polling units) for the LGAs the
 * caller has requested, gated by the campaign's scope. Mirrors the legacy
 * route handler's scope logic and validates that every requested LGA is
 * within scope before issuing the bulk fetch.
 */
export async function buildOfflinePack(
  input: BuildOfflinePackInput,
): Promise<BuildOfflinePackResult> {
  const { campaignSlug, lgaIds } = input;

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: {
      id: true,
      candidateId: true,
      status: true,
      constituencyType: true,
      enabledLgaIds: true,
      updatedAt: true,
    },
  });

  if (!campaign || campaign.status === "draft") {
    return { ok: false, reason: "campaign_not_found" };
  }

  if (campaign.status === "closed") {
    return { ok: false, reason: "campaign_closed" };
  }

  let allowedLgaIds: number[];
  if (campaign.enabledLgaIds.length > 0) {
    allowedLgaIds = campaign.enabledLgaIds;
  } else if (campaign.constituencyType === "federal") {
    const all = await prisma.lga.findMany({ select: { id: true } });
    allowedLgaIds = all.map((l) => l.id);
  } else {
    const candidate = await prisma.candidate.findUnique({
      where: { id: campaign.candidateId },
      select: { stateCode: true },
    });
    const code = candidate?.stateCode ?? null;
    if (!code) {
      return { ok: false, reason: "candidate_state_missing" };
    }
    const stateLgas = await prisma.lga.findMany({
      where: { stateCode: code },
      select: { id: true },
    });
    allowedLgaIds = stateLgas.map((l) => l.id);
  }

  const allowedSet = new Set(allowedLgaIds);
  const outOfScope = lgaIds.filter((id) => !allowedSet.has(id));
  if (outOfScope.length > 0) {
    return { ok: false, reason: "lgas_out_of_scope", outOfScope };
  }

  const lgas = await prisma.lga.findMany({
    where: { id: { in: lgaIds } },
    select: { id: true, name: true, stateCode: true },
    orderBy: { name: "asc" },
  });

  const wards = await prisma.ward.findMany({
    where: { lgaId: { in: lgaIds } },
    select: { id: true, code: true, name: true, lgaId: true },
    orderBy: [{ name: "asc" }, { code: "asc" }],
  });

  const wardIds = wards.map((w) => w.id);
  const pollingUnitsRaw = wardIds.length
    ? await prisma.pollingUnit.findMany({
        where: { wardId: { in: wardIds } },
        select: { id: true, code: true, name: true, wardId: true },
        orderBy: { code: "asc" },
      })
    : [];

  const pollingUnits: GeoPollingUnit[] = pollingUnitsRaw.map((pu) => ({
    ...pu,
    code: pu.code ?? "",
  }));

  return {
    ok: true,
    campaignUpdatedAt: campaign.updatedAt.toISOString(),
    lgas,
    wards,
    pollingUnits,
  };
}
