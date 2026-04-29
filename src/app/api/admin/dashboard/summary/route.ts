import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { getDashboardWindows } from "@/lib/server/collect-reporting";

export async function GET() {
  try {
    // Only allow admin users to access this endpoint
    const { error } = await requireAdmin();
    if (error) return error;

    // Get all the date ranges (today, yesterday, last 7 days, etc.) needed for stats
    const w = getDashboardWindows();

    // Count registrations and candidates for various time windows in parallel
    const [
      registrationsTotal,
      registrationsToday,
      registrationsYesterday,
      registrationsLast7d,
      registrationsPrevious7d,
      candidatesTotal,
      candidatesNew7d,
      candidatesPrevious7d,
    ] = await Promise.all([
      // Total number of registrations
      prisma.collectSubmission.count(),
      // Registrations created today
      prisma.collectSubmission.count({
        where: { createdAt: { gte: w.todayStart, lt: w.tomorrowStart } },
      }),
      // Registrations created yesterday
      prisma.collectSubmission.count({
        where: { createdAt: { gte: w.yesterdayStart, lt: w.todayStart } },
      }),
      // Registrations from the last 7 days (including today)
      prisma.collectSubmission.count({
        where: { createdAt: { gte: w.last7dStart, lt: w.tomorrowStart } },
      }),
      // Registrations from the 7 days before the last 7 days (i.e. 7–13 days ago, not overlapping last 7d)
      prisma.collectSubmission.count({
        where: { createdAt: { gte: w.previous7dStart, lt: w.previous7dEnd } },
      }),
      // Total number of candidates
      prisma.candidate.count(),
      // New candidates in the last 7 days (including today)
      prisma.candidate.count({
        where: { createdAt: { gte: w.last7dStart, lt: w.tomorrowStart } },
      }),
      // New candidates in the 7 days before the last 7 days
      prisma.candidate.count({
        where: { createdAt: { gte: w.previous7dStart, lt: w.previous7dEnd } },
      }),
    ]);

    // Send the computed summary as JSON
    return NextResponse.json({
      summary: {
        updatedAt: new Date().toISOString(),
        registrations: {
          total: registrationsTotal,
          today: registrationsToday,
          yesterday: registrationsYesterday,
          last7d: registrationsLast7d,
          previous7d: registrationsPrevious7d,
        },
        candidates: {
          total: candidatesTotal,
          new7d: candidatesNew7d,
          previous7d: candidatesPrevious7d,
        },
      },
    });
  } catch (e) {
    // Log error and return a 500 error response
    console.error("[admin/dashboard/summary]", e);
    return NextResponse.json(
      { error: "Failed to load summary" },
      { status: 500 },
    );
  }
}
