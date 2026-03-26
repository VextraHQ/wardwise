import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const campaignSlug = request.nextUrl.searchParams.get("campaignSlug");
    if (!campaignSlug) {
      return NextResponse.json(
        { error: "campaignSlug is required" },
        { status: 400 },
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { slug: campaignSlug },
      select: {
        enabledLgaIds: true,
        constituencyType: true,
        status: true,
        candidateId: true,
      },
    });

    if (!campaign || campaign.status === "draft") {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    let lgas;

    if (campaign.enabledLgaIds.length > 0) {
      // Constituency-level (Senator/HoR/State Assembly): return only enabled LGAs
      lgas = await prisma.lga.findMany({
        where: { id: { in: campaign.enabledLgaIds } },
        select: { id: true, name: true, stateCode: true },
        orderBy: { name: "asc" },
      });
    } else if (campaign.constituencyType === "federal") {
      // National campaign (President): return all seeded LGAs
      lgas = await prisma.lga.findMany({
        select: { id: true, name: true, stateCode: true },
        orderBy: { name: "asc" },
      });
    } else {
      // Statewide campaign (Governor): return all LGAs in candidate's state
      const candidate = await prisma.candidate.findUnique({
        where: { id: campaign.candidateId },
        select: { stateCode: true },
      });

      const code = candidate?.stateCode ?? null;

      if (!code) {
        return NextResponse.json(
          { error: "Could not resolve candidate state" },
          { status: 500 },
        );
      }

      lgas = await prisma.lga.findMany({
        where: { stateCode: code },
        select: { id: true, name: true, stateCode: true },
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json({ lgas });
  } catch (error) {
    console.error("Error fetching LGAs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
