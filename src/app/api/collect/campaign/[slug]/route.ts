import { NextResponse } from "next/server";
import { getPublicCampaign } from "@/features/collect/server/get-public-campaign";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const campaign = await getPublicCampaign(slug);

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    if (campaign.status === "closed") {
      return NextResponse.json(
        { error: "Campaign is closed" },
        { status: 410 },
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
