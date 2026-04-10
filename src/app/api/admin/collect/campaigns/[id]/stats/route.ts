import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { getCampaignStats } from "@/lib/server/collect-reporting";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    const sp = request.nextUrl.searchParams;
    const stats = await getCampaignStats(id, {
      from: sp.get("from") ?? undefined,
      to: sp.get("to") ?? undefined,
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching campaign stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
