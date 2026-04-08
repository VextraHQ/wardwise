import { NextResponse } from "next/server";
import {
  validateReportRequest,
  touchReportLastViewed,
} from "@/lib/server/report-access";
import {
  getCampaignStats,
  getCampaignHealth,
} from "@/lib/server/collect-reporting";

type RouteParams = { params: Promise<unknown> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { token } = (await params) as { token: string };
    const { campaign, error } = await validateReportRequest(token, request);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    // Update last viewed on authorized access
    void touchReportLastViewed(campaign.id);

    const [stats, health] = await Promise.all([
      getCampaignStats(campaign.id),
      getCampaignHealth(campaign.id),
    ]);

    return NextResponse.json({
      campaign: {
        candidateName: campaign.candidateName,
        candidateTitle: campaign.candidateTitle,
        party: campaign.party,
        constituency: campaign.constituency,
        constituencyType: campaign.constituencyType,
        slug: campaign.slug,
        status: campaign.status,
        enabledLgaCount: campaign.enabledLgaIds.length,
      },
      stats,
      health,
    });
  } catch (error) {
    console.error("Error fetching report summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
