import { prisma } from "@/lib/core/prisma";
import {
  normalizeConstituencyLgaIds,
  positionRequiresLgas,
} from "@/lib/geo/constituency";

export async function sanitizeCandidateConstituencyLgaIds({
  position,
  stateCode,
  constituencyLgaIds,
}: {
  position: string;
  stateCode: string | null | undefined;
  constituencyLgaIds: number[] | undefined;
}): Promise<{ ids: number[]; error?: string }> {
  const ids = normalizeConstituencyLgaIds(constituencyLgaIds);

  if (!positionRequiresLgas(position)) {
    return { ids: [] };
  }

  if (ids.length === 0) {
    return { ids: [] };
  }

  if (!stateCode) {
    return {
      ids: [],
      error: "State is required before constituency LGAs can be assigned.",
    };
  }

  const matchingLgas = await prisma.lga.findMany({
    where: {
      id: { in: ids },
      stateCode,
    },
    select: { id: true },
  });

  if (matchingLgas.length !== ids.length) {
    return {
      ids: [],
      error: "Constituency LGAs must belong to the selected state.",
    };
  }

  return { ids };
}

export async function resolveCandidateCampaignLgaIds({
  position,
  stateCode,
  constituencyLgaIds,
}: {
  position: string;
  stateCode: string | null | undefined;
  constituencyLgaIds: number[] | undefined;
}): Promise<{ ids: number[]; error?: string }> {
  const normalizedIds = normalizeConstituencyLgaIds(constituencyLgaIds);

  if (positionRequiresLgas(position)) {
    return { ids: normalizedIds };
  }

  if (position === "Governor") {
    if (!stateCode) {
      return {
        ids: [],
        error:
          "Candidate state is required before campaign geography can be derived.",
      };
    }

    const stateLgas = await prisma.lga.findMany({
      where: { stateCode },
      select: { id: true },
      orderBy: { name: "asc" },
    });

    return { ids: stateLgas.map((lga) => lga.id) };
  }

  return { ids: [] };
}
