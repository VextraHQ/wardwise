import { NextResponse } from "next/server";
import { prisma } from "@/lib/core/prisma";
import { getCampaignBrandingType } from "@/lib/collect/branding";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Look up the campaign using the provided slug
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        candidateName: true,
        candidateTitle: true,
        brandingType: true,
        displayName: true,
        party: true,
        constituency: true,
        constituencyType: true,
        enabledLgaIds: true,
        customQuestion1: true,
        customQuestion2: true,
        status: true,
        updatedAt: true,
        campaignCanvassers: {
          select: { id: true, name: true, phone: true },
          orderBy: { name: "asc" },
        },
      },
    });

    // If campaign does not exist or is still a draft, return not found
    if (!campaign || campaign.status === "draft") {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    // If campaign has been closed, return gone
    if (campaign.status === "closed") {
      return NextResponse.json(
        { error: "Campaign is closed" },
        { status: 410 },
      );
    }

    // Send the campaign data back to the client
    return NextResponse.json({
      campaign: {
        ...campaign,
        brandingType: getCampaignBrandingType(campaign.brandingType),
        updatedAt: campaign.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    // Unexpected errors get handled here
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
