import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function sanitizeCell(value: string | null | undefined): string {
  if (!value) return "";
  const s = String(value);
  // Prevent CSV formula injection
  if (/^[=+\-@]/.test(s)) return `'${s}`;
  // Escape quotes
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { slug: true, customQuestion1: true, customQuestion2: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    const submissions = await prisma.collectSubmission.findMany({
      where: { campaignId: id },
      orderBy: { createdAt: "desc" },
      include: {
        pollingUnit: { select: { code: true } },
      },
    });

    const headers = [
      "Full Name",
      "Phone",
      "Email",
      "Sex",
      "Age",
      "Occupation",
      "Marital Status",
      "LGA",
      "Ward",
      "PU Code",
      "Polling Unit",
      "APC/NIN",
      "VIN",
      "Role",
      ...(campaign.customQuestion1 ? [campaign.customQuestion1] : []),
      ...(campaign.customQuestion2 ? [campaign.customQuestion2] : []),
      "Canvasser Name",
      "Canvasser Phone",
      "Verified",
      "Flagged",
      "Admin Notes",
      "Date",
    ];

    const rows = submissions.map((s) => [
      sanitizeCell(s.fullName),
      sanitizeCell(s.phone),
      sanitizeCell(s.email),
      sanitizeCell(s.sex),
      String(s.age),
      sanitizeCell(s.occupation),
      sanitizeCell(s.maritalStatus),
      sanitizeCell(s.lgaName),
      sanitizeCell(s.wardName),
      sanitizeCell(s.pollingUnit?.code || ""),
      sanitizeCell(s.pollingUnitName),
      sanitizeCell(s.apcRegNumber),
      sanitizeCell(s.voterIdNumber),
      sanitizeCell(s.role),
      ...(campaign.customQuestion1 ? [sanitizeCell(s.customAnswer1)] : []),
      ...(campaign.customQuestion2 ? [sanitizeCell(s.customAnswer2)] : []),
      sanitizeCell(s.canvasserName),
      sanitizeCell(s.canvasserPhone),
      s.isVerified ? "Yes" : "No",
      s.isFlagged ? "Yes" : "No",
      sanitizeCell(s.adminNotes),
      s.createdAt.toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="submissions-${campaign.slug}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
