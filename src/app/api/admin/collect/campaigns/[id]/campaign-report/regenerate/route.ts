import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { logAudit } from "@/lib/core/audit";
import { generateReportToken } from "@/lib/server/report-access";

type RouteParams = { params: Promise<unknown> };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { error, user } = await requireAdmin();
    if (error) return error;

    const { id } = (await params) as { id: string };

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { clientReportEnabled: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    if (!campaign.clientReportEnabled) {
      return NextResponse.json(
        { error: "Client report is not enabled for this campaign" },
        { status: 400 },
      );
    }

    const newToken = generateReportToken();

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        clientReportToken: newToken,
        clientReportLastViewedAt: null,
      },
    });

    void logAudit(
      "campaign.client_report.regenerate",
      "campaign",
      id,
      user!.id,
    );

    return NextResponse.json({
      clientReportToken: updated.clientReportToken,
    });
  } catch (error) {
    console.error("Error regenerating report token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
