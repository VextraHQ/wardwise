import { NextResponse } from "next/server";
import {
  validateReportRequest,
  touchReportLastViewed,
} from "@/lib/server/report-access";
import {
  getCampaignStats,
  getCampaignHealth,
} from "@/lib/server/collect-reporting";
import { getCampaignBrandingType } from "@/lib/collect/branding";

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

    const url = new URL(request.url);
    const from = url.searchParams.get("from") || undefined;
    const to = url.searchParams.get("to") || undefined;

    const [stats, health] = await Promise.all([
      getCampaignStats(campaign.id, { from, to }),
      getCampaignHealth(campaign.id),
    ]);

    return NextResponse.json({
      campaign: {
        candidateName: campaign.candidateName,
        candidateTitle: campaign.candidateTitle,
        brandingType: getCampaignBrandingType(campaign.brandingType),
        displayName: campaign.displayName,
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
