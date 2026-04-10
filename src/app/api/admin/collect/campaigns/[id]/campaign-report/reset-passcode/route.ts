import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { logAudit } from "@/lib/core/audit";
import { generatePasscode, hashPasscode } from "@/lib/server/report-access";

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

    const rawPasscode = generatePasscode();
    const hashed = await hashPasscode(rawPasscode);

    await prisma.campaign.update({
      where: { id },
      data: { clientReportPasscodeHash: hashed },
    });

    void logAudit(
      "campaign.client_report.reset_passcode",
      "campaign",
      id,
      user!.id,
    );

    return NextResponse.json({ passcode: rawPasscode });
  } catch (error) {
    console.error("Error resetting report passcode:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
