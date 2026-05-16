import { type NextRequest, NextResponse } from "next/server";
import { getCampaignLgas } from "@/features/collect/server/get-campaign-lgas";

export async function GET(request: NextRequest) {
  try {
    const campaignSlug = request.nextUrl.searchParams.get("campaignSlug");
    if (!campaignSlug) {
      return NextResponse.json(
        { error: "campaignSlug is required" },
        { status: 400 },
      );
    }

    const result = await getCampaignLgas(campaignSlug);

    if (!result.ok) {
      switch (result.reason) {
        case "campaign_not_found":
          return NextResponse.json(
            { error: "Campaign not found" },
            { status: 404 },
          );
        case "candidate_state_missing":
          return NextResponse.json(
            { error: "Could not resolve candidate state" },
            { status: 500 },
          );
      }
    }

    return NextResponse.json({ lgas: result.lgas });
  } catch (error) {
    console.error("Error fetching LGAs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
