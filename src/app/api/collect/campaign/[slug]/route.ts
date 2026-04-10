import { NextResponse } from "next/server";
import { prisma } from "@/lib/core/prisma";
import { getCampaignBrandingType } from "@/lib/collect/branding";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
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
        campaignCanvassers: {
          select: { id: true, name: true, phone: true },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!campaign || campaign.status === "draft") {
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

    return NextResponse.json({
      campaign: {
        ...campaign,
        brandingType: getCampaignBrandingType(campaign.brandingType),
      },
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
