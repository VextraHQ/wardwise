import { prisma } from "@/lib/prisma";
import {
  buildSubmissionWhere,
  type SubmissionFilters,
} from "@/lib/exports/submissions";

const REPORT_TIME_ZONE = "Africa/Lagos";
const REPORT_UTC_OFFSET = "+01:00";

function parseReportDateStart(value: string): Date {
  return new Date(`${value}T00:00:00.000${REPORT_UTC_OFFSET}`);
}

function parseReportDateEnd(value: string): Date {
  return new Date(`${value}T23:59:59.999${REPORT_UTC_OFFSET}`);
}

export type CampaignStats = {
  total: number;
  verified: number;
  flagged: number;
  daily: { date: string; count: number; cumulative: number }[];
  byLga: { lga: string; count: number }[];
  byWard: { ward: string; count: number }[];
  byRole: { role: string; count: number }[];
  bySex: { sex: string; count: number }[];
};

export type CampaignHealth = {
  lastSubmissionAt: string | null;
  canvasserCount: number;
  formStatus: string;
  topCanvassers: { name: string; phone: string; count: number }[];
};

export type LightSubmission = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  sex: string;
  age: number;
  occupation: string;
  maritalStatus: string;
  lgaName: string;
  wardName: string;
  pollingUnitName: string;
  pollingUnitCode: string | null;
  role: string;
  canvasserName: string | null;
  canvasserPhone: string | null;
  isVerified: boolean;
  isFlagged: boolean;
  createdAt: string;
};

/** Disambiguate ward names by appending LGA when the same ward name appears in multiple LGAs. */
function disambiguateWards(
  rows: { wardName: string; lgaName: string; _count: number }[],
): { ward: string; count: number }[] {
  const nameCount = new Map<string, number>();
  for (const r of rows) {
    nameCount.set(r.wardName, (nameCount.get(r.wardName) ?? 0) + 1);
  }
  return rows.map((r) => ({
    ward:
      (nameCount.get(r.wardName) ?? 0) > 1
        ? `${r.wardName} (${r.lgaName})`
        : r.wardName,
    count: r._count,
  }));
}

export async function getCampaignStats(
  campaignId: string,
  options?: { from?: string; to?: string },
): Promise<CampaignStats> {
  const from = options?.from;
  const to = options?.to;

  const fromStartOfDay = from ? parseReportDateStart(from) : undefined;
  const toEndOfDay = to ? parseReportDateEnd(to) : undefined;
  const dateFilter = {
    ...(fromStartOfDay && { gte: fromStartOfDay }),
    ...(toEndOfDay && { lte: toEndOfDay }),
  };
  const hasDateFilter = from || to;

  const baseWhere = {
    campaignId,
    ...(hasDateFilter && { createdAt: dateFilter }),
  };

  const [totals, dailyRaw, byLga, byWard, byRole, bySex] = await Promise.all([
    // Total, verified, flagged counts
    prisma.collectSubmission
      .aggregate({
        where: baseWhere,
        _count: true,
      })
      .then(async (agg) => {
        const [verified, flagged] = await Promise.all([
          prisma.collectSubmission.count({
            where: { ...baseWhere, isVerified: true },
          }),
          prisma.collectSubmission.count({
            where: { ...baseWhere, isFlagged: true },
          }),
        ]);
        return { total: agg._count, verified, flagged };
      }),

    // Daily submissions (group by date)
    fromStartOfDay && toEndOfDay
      ? prisma.$queryRaw<{ date: string; count: bigint }[]>`
          SELECT DATE("createdAt" AT TIME ZONE ${REPORT_TIME_ZONE})::text as date, COUNT(*)::bigint as count
          FROM "CollectSubmission"
          WHERE "campaignId" = ${campaignId}
            AND "createdAt" >= ${fromStartOfDay} AND "createdAt" <= ${toEndOfDay}
          GROUP BY DATE("createdAt" AT TIME ZONE ${REPORT_TIME_ZONE}) ORDER BY date ASC
        `
      : fromStartOfDay
        ? prisma.$queryRaw<{ date: string; count: bigint }[]>`
            SELECT DATE("createdAt" AT TIME ZONE ${REPORT_TIME_ZONE})::text as date, COUNT(*)::bigint as count
            FROM "CollectSubmission"
            WHERE "campaignId" = ${campaignId} AND "createdAt" >= ${fromStartOfDay}
            GROUP BY DATE("createdAt" AT TIME ZONE ${REPORT_TIME_ZONE}) ORDER BY date ASC
          `
        : toEndOfDay
          ? prisma.$queryRaw<{ date: string; count: bigint }[]>`
              SELECT DATE("createdAt" AT TIME ZONE ${REPORT_TIME_ZONE})::text as date, COUNT(*)::bigint as count
              FROM "CollectSubmission"
              WHERE "campaignId" = ${campaignId} AND "createdAt" <= ${toEndOfDay}
              GROUP BY DATE("createdAt" AT TIME ZONE ${REPORT_TIME_ZONE}) ORDER BY date ASC
            `
          : prisma.$queryRaw<{ date: string; count: bigint }[]>`
              SELECT DATE("createdAt" AT TIME ZONE ${REPORT_TIME_ZONE})::text as date, COUNT(*)::bigint as count
              FROM "CollectSubmission"
              WHERE "campaignId" = ${campaignId}
              GROUP BY DATE("createdAt" AT TIME ZONE ${REPORT_TIME_ZONE}) ORDER BY date ASC
            `,

    // By LGA
    prisma.collectSubmission.groupBy({
      by: ["lgaName"],
      where: baseWhere,
      _count: true,
      orderBy: { _count: { lgaName: "desc" } },
    }),

    // By Ward (top 10) — group by wardName + lgaName to avoid collisions
    prisma.collectSubmission.groupBy({
      by: ["wardName", "lgaName"],
      where: baseWhere,
      _count: true,
      orderBy: { _count: { wardName: "desc" } },
      take: 10,
    }),

    // By Role
    prisma.collectSubmission.groupBy({
      by: ["role"],
      where: baseWhere,
      _count: true,
    }),

    // By Sex
    prisma.collectSubmission.groupBy({
      by: ["sex"],
      where: baseWhere,
      _count: true,
    }),
  ]);

  // Build cumulative from daily
  let cumulative = 0;
  const daily = dailyRaw.map((d) => {
    const count = Number(d.count);
    cumulative += count;
    return { date: d.date, count, cumulative };
  });

  return {
    total: totals.total,
    verified: totals.verified,
    flagged: totals.flagged,
    daily,
    byLga: byLga.map((g) => ({ lga: g.lgaName, count: g._count })),
    byWard: disambiguateWards(byWard),
    byRole: byRole.map((g) => ({ role: g.role, count: g._count })),
    bySex: bySex.map((g) => ({ sex: g.sex, count: g._count })),
  };
}

export async function getRecentSubmissions(
  campaignId: string,
  options?: {
    page?: number;
    pageSize?: number;
    filters?: SubmissionFilters;
  },
): Promise<{ submissions: LightSubmission[]; total: number }> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 20));
  const where = buildSubmissionWhere(campaignId, options?.filters ?? {});

  const [rows, total] = await Promise.all([
    prisma.collectSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        sex: true,
        age: true,
        occupation: true,
        maritalStatus: true,
        lgaName: true,
        wardName: true,
        pollingUnitName: true,
        pollingUnit: { select: { code: true } },
        role: true,
        canvasserName: true,
        canvasserPhone: true,
        isVerified: true,
        isFlagged: true,
        createdAt: true,
      },
    }),
    prisma.collectSubmission.count({ where }),
  ]);

  return {
    submissions: rows.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      phone: s.phone,
      email: s.email,
      sex: s.sex,
      age: s.age,
      occupation: s.occupation,
      maritalStatus: s.maritalStatus,
      lgaName: s.lgaName,
      wardName: s.wardName,
      pollingUnitName: s.pollingUnitName,
      pollingUnitCode: s.pollingUnit?.code ?? null,
      role: s.role,
      canvasserName: s.canvasserName,
      canvasserPhone: s.canvasserPhone,
      isVerified: s.isVerified,
      isFlagged: s.isFlagged,
      createdAt: s.createdAt.toISOString(),
    })),
    total,
  };
}

export async function getCampaignHealth(
  campaignId: string,
): Promise<CampaignHealth> {
  const [campaign, lastSubmission, canvasserCount, topCanvassers] =
    await Promise.all([
      prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { status: true },
      }),
      prisma.collectSubmission.findFirst({
        where: { campaignId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.campaignCanvasser.count({ where: { campaignId } }),
      prisma.collectSubmission.groupBy({
        by: ["canvasserName", "canvasserPhone"],
        where: {
          campaignId,
          canvasserName: { not: null },
        },
        _count: true,
        orderBy: { _count: { canvasserName: "desc" } },
        take: 5,
      }),
    ]);

  return {
    lastSubmissionAt: lastSubmission?.createdAt.toISOString() ?? null,
    canvasserCount,
    formStatus: campaign?.status ?? "draft",
    topCanvassers: topCanvassers
      .filter((row) => row.canvasserName)
      .map((row) => ({
        name: row.canvasserName ?? "Unknown",
        phone: row.canvasserPhone ?? "—",
        count: row._count,
      })),
  };
}
