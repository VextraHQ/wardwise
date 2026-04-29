import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/core/prisma";
import {
  buildSubmissionWhere,
  type SubmissionFilters,
} from "@/lib/collect/submission-query";

const REPORT_TIME_ZONE = "Africa/Lagos";
const REPORT_UTC_OFFSET = "+01:00";

// Parse the start of a report day (00:00:00) in the Lagos timezone from a date string (YYYY-MM-DD)
function parseReportDateStart(value: string): Date {
  return new Date(`${value}T00:00:00.000${REPORT_UTC_OFFSET}`);
}

// Parse the end of a report day (23:59:59.999) in the Lagos timezone from a date string (YYYY-MM-DD)
function parseReportDateEnd(value: string): Date {
  return new Date(`${value}T23:59:59.999${REPORT_UTC_OFFSET}`);
}

// Convert a JS Date object to YYYY-MM-DD string in the Lagos timezone (for calendar groupings)
function lagosCalendarDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Take a date string (YYYY-MM-DD) and add or subtract days, returning new YYYY-MM-DD string
function shiftDateString(yyyyMmDd: string, days: number): string {
  const dt = new Date(`${yyyyMmDd}T00:00:00.000Z`);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

// Return a Date object at midnight (start of day) in Lagos time from a YYYY-MM-DD string
function lagosDayStart(yyyyMmDd: string): Date {
  return new Date(`${yyyyMmDd}T00:00:00.000${REPORT_UTC_OFFSET}`);
}

export type DashboardWindows = {
  todayStart: Date;
  tomorrowStart: Date;
  yesterdayStart: Date;
  last7dStart: Date;
  previous7dStart: Date;
  previous7dEnd: Date;
};

// Compute windows for reporting (like "today", "last 7d", etc.) relative to current time, in Lagos timezone
export function getDashboardWindows(now: Date = new Date()): DashboardWindows {
  const today = lagosCalendarDate(now);
  const tomorrow = shiftDateString(today, 1);
  const yesterday = shiftDateString(today, -1);
  const last7Start = shiftDateString(today, -6); // includes today, so 6 days ago
  const previous7Start = shiftDateString(today, -13); // 7 days prior to last 7d

  return {
    todayStart: lagosDayStart(today),
    tomorrowStart: lagosDayStart(tomorrow),
    yesterdayStart: lagosDayStart(yesterday),
    last7dStart: lagosDayStart(last7Start),
    previous7dStart: lagosDayStart(previous7Start),
    previous7dEnd: lagosDayStart(last7Start),
  };
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

// A simplified submission for dashboards (all relevant info, lighter than the full model)
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

// Make ward names unique by appending the LGA if more than one ward shares the same name
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

// Get campaign submission stats: counts, breakdowns and daily trend, with optional filters
export async function getCampaignStats(
  campaignId: string,
  options?: { from?: string; to?: string; lga?: string; role?: string },
): Promise<CampaignStats> {
  const from = options?.from;
  const to = options?.to;
  const lga = options?.lga;
  const role = options?.role;

  // Prepare filters for date range
  const fromStartOfDay = from ? parseReportDateStart(from) : undefined;
  const toEndOfDay = to ? parseReportDateEnd(to) : undefined;
  const dateFilter = {
    ...(fromStartOfDay && { gte: fromStartOfDay }),
    ...(toEndOfDay && { lte: toEndOfDay }),
  };
  const hasDateFilter = from || to;

  // Base Prisma "where" clause for most queries in this stats gathering
  const baseWhere: Prisma.CollectSubmissionWhereInput = {
    campaignId,
    ...(hasDateFilter && { createdAt: dateFilter }),
    ...(lga && { lgaName: lga }),
    ...(role && { role }),
  };

  // Used for the raw SQL group-by for daily counts
  const dailyWhereConditions = [
    Prisma.sql`"campaignId" = ${campaignId}`,
    ...(fromStartOfDay ? [Prisma.sql`"createdAt" >= ${fromStartOfDay}`] : []),
    ...(toEndOfDay ? [Prisma.sql`"createdAt" <= ${toEndOfDay}`] : []),
    ...(lga ? [Prisma.sql`"lgaName" = ${lga}`] : []),
    ...(role ? [Prisma.sql`"role" = ${role}`] : []),
  ];
  const dailyWhereSql = Prisma.join(dailyWhereConditions, " AND ");

  // Gather all counts and breakdowns in parallel for performance
  const [totals, dailyRaw, byLga, byWard, byRole, bySex] = await Promise.all([
    // Total, verified and flagged submissions
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

    // Number of submissions per day (grouped by day in Lagos time)
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("createdAt" AT TIME ZONE ${REPORT_TIME_ZONE})::text as date, COUNT(*)::bigint as count
      FROM "CollectSubmission"
      WHERE ${dailyWhereSql}
      GROUP BY 1 ORDER BY 1 ASC
    `,

    // Number of submissions per LGA (grouped by LGA)
    prisma.collectSubmission.groupBy({
      by: ["lgaName"],
      where: baseWhere,
      _count: true,
      orderBy: { _count: { lgaName: "desc" } },
    }),

    // Top 10 wards by number of submissions, differentiated by both wardName and lgaName
    prisma.collectSubmission.groupBy({
      by: ["wardName", "lgaName"],
      where: baseWhere,
      _count: true,
      orderBy: { _count: { wardName: "desc" } },
      take: 10,
    }),

    // Breakdown by role
    prisma.collectSubmission.groupBy({
      by: ["role"],
      where: baseWhere,
      _count: true,
    }),

    // Breakdown by sex
    prisma.collectSubmission.groupBy({
      by: ["sex"],
      where: baseWhere,
      _count: true,
    }),
  ]);

  // Calculate the cumulative (running) total for daily trend
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

// Get a page of recent submissions with simple info and total count, with optional filters applied
export async function getRecentSubmissions(
  campaignId: string,
  options?: {
    page?: number;
    pageSize?: number;
    filters?: SubmissionFilters;
    from?: string;
    to?: string;
    lga?: string;
  },
): Promise<{ submissions: LightSubmission[]; total: number }> {
  // Pagination defaults: page 1, 20 per page, max 100
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 20));
  const where = buildSubmissionWhere(campaignId, options?.filters ?? {});
  const fromStartOfDay = options?.from
    ? parseReportDateStart(options.from)
    : undefined;
  const toEndOfDay = options?.to ? parseReportDateEnd(options.to) : undefined;

  // Set createdAt bound if date range specified
  if (fromStartOfDay || toEndOfDay) {
    where.createdAt = {
      ...(fromStartOfDay && { gte: fromStartOfDay }),
      ...(toEndOfDay && { lte: toEndOfDay }),
    };
  }
  // Add LGA filter if provided
  if (options?.lga) where.lgaName = options.lga;

  // Query matching submissions and get count in parallel
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

  // Convert DB rows to LightSubmission (flatten and massage types)
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

// Fetch campaign health/summary: last submission time, canvassers, form status, top canvassers by submissions
export async function getCampaignHealth(
  campaignId: string,
): Promise<CampaignHealth> {
  // Multi-query for performance: status, most recent submission, canvasser count, and top canvassers
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
