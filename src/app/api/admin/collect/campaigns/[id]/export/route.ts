import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { composeFullName } from "@/lib/utils";

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

// Redaction helpers for PII masking
function redactName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((part) =>
      part.length > 1 ? part[0] + "*".repeat(part.length - 1) : part,
    )
    .join(" ");
}

function getSubmissionNameParts(submission: {
  fullName: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
}) {
  return {
    firstName: submission.firstName || "",
    middleName: submission.middleName || "",
    lastName: submission.lastName || "",
    fullName:
      submission.fullName ||
      composeFullName({
        firstName: submission.firstName,
        middleName: submission.middleName,
        lastName: submission.lastName,
      }),
  };
}

function redactPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  // Keep country code prefix + last 4 digits
  if (phone.length > 7) {
    return phone.slice(0, 4) + "***" + phone.slice(-4);
  }
  return "***" + phone.slice(-4);
}

function redactEmail(email: string | null | undefined): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return (local?.[0] || "") + "***@" + domain;
}

function redactId(id: string | null | undefined): string {
  if (!id) return "";
  return "***";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

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

    // Build filter where clause (same params as submissions list)
    const sp = request.nextUrl.searchParams;
    const search = sp.get("search") || undefined;
    const role = sp.get("role") || undefined;
    const isFlagged =
      sp.get("isFlagged") === "true"
        ? true
        : sp.get("isFlagged") === "false"
          ? false
          : undefined;
    const isVerified =
      sp.get("isVerified") === "true"
        ? true
        : sp.get("isVerified") === "false"
          ? false
          : undefined;
    const redacted = sp.get("redacted") === "true";

    const where: Record<string, unknown> = { campaignId: id };
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { middleName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (isFlagged !== undefined) where.isFlagged = isFlagged;
    if (isVerified !== undefined) where.isVerified = isVerified;

    const submissions = await prisma.collectSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        pollingUnit: { select: { code: true } },
      },
    });

    const headers = [
      "First Name",
      "Middle Name",
      "Last Name",
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

    const rows = submissions.map((s) => {
      const name = getSubmissionNameParts(s);
      return [
      sanitizeCell(redacted ? redactName(name.firstName) : name.firstName),
      sanitizeCell(redacted ? redactName(name.middleName) : name.middleName),
      sanitizeCell(redacted ? redactName(name.lastName) : name.lastName),
      sanitizeCell(redacted ? redactName(name.fullName) : name.fullName),
      sanitizeCell(redacted ? redactPhone(s.phone) : s.phone),
      sanitizeCell(redacted ? redactEmail(s.email) : s.email),
      sanitizeCell(s.sex),
      String(s.age),
      sanitizeCell(s.occupation),
      sanitizeCell(s.maritalStatus),
      sanitizeCell(s.lgaName),
      sanitizeCell(s.wardName),
      sanitizeCell(s.pollingUnit?.code || ""),
      sanitizeCell(s.pollingUnitName),
      sanitizeCell(redacted ? redactId(s.apcRegNumber) : s.apcRegNumber),
      sanitizeCell(redacted ? redactId(s.voterIdNumber) : s.voterIdNumber),
      sanitizeCell(s.role),
      ...(campaign.customQuestion1 ? [sanitizeCell(s.customAnswer1)] : []),
      ...(campaign.customQuestion2 ? [sanitizeCell(s.customAnswer2)] : []),
      sanitizeCell(redacted ? redactName(s.canvasserName) : s.canvasserName),
      sanitizeCell(redacted ? redactPhone(s.canvasserPhone) : s.canvasserPhone),
      s.isVerified ? "Yes" : "No",
      s.isFlagged ? "Yes" : "No",
      sanitizeCell(s.adminNotes),
      s.createdAt.toISOString(),
    ];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="submissions-${campaign.slug}${redacted ? "-redacted" : ""}.csv"`,
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
