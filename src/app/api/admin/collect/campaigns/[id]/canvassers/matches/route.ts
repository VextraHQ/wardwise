import { NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/lib/guards";
import { prisma } from "@/lib/core/prisma";
import { normalizeNigerianPhoneInput } from "@/lib/schemas/field-schemas";

type RouteParams = { params: Promise<{ id: string }> };

// Keywords that suggest a manual referral name is an organization, not a person.
// If any of these appear in the normalized name, skip person-match suggestions.
const GROUP_KEYWORDS = [
  "movement",
  "team",
  "group",
  "foundation",
  "association",
  "youth",
  "fcn",
  "union",
  "network",
  "coalition",
  "forum",
  "committee",
];

function normalizeNameForMatch(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePhoneForMatch(phone?: string | null): string | null {
  if (!phone) {
    return null;
  }

  const normalized = normalizeNigerianPhoneInput(phone);
  return normalized || null;
}

function isGroupName(normalizedName: string): boolean {
  return GROUP_KEYWORDS.some((kw) => normalizedName.includes(kw));
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id: campaignId } = await params;

    // Fetch roster canvassers and distinct manual referral names in parallel
    const [roster, manualGroups] = await Promise.all([
      prisma.campaignCanvasser.findMany({
        where: { campaignId },
        select: { id: true, name: true, phone: true },
      }),
      prisma.collectSubmission.groupBy({
        by: ["canvasserName", "canvasserPhone"],
        where: {
          campaignId,
          campaignCanvasserId: null,
          canvasserName: { not: null },
        },
        _count: true,
        orderBy: { _count: { canvasserName: "desc" } },
      }),
    ]);

    if (roster.length === 0 || manualGroups.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // Build lookup maps for roster
    const rosterByPhone = new Map<string, (typeof roster)[0]>();
    const rosterNormalized: { id: string; norm: string; name: string; phone: string }[] = [];
    for (const c of roster) {
      const normalizedPhone = normalizePhoneForMatch(c.phone);
      if (normalizedPhone) {
        rosterByPhone.set(normalizedPhone, c);
      }
      rosterNormalized.push({ id: c.id, norm: normalizeNameForMatch(c.name), name: c.name, phone: c.phone });
    }

    const matches: {
      manualName: string;
      manualPhone: string | null;
      submissionCount: number;
      suggestions: { canvasserId: string; canvasserName: string; canvasserPhone: string; confidence: "high" | "medium" }[];
    }[] = [];

    for (const group of manualGroups) {
      const manualName = group.canvasserName!;
      const manualPhone = group.canvasserPhone ?? null;
      const normalizedManualPhone = normalizePhoneForMatch(manualPhone);
      const norm = normalizeNameForMatch(manualName);

      // Skip group/org names
      if (isGroupName(norm)) continue;

      const suggestions: (typeof matches)[0]["suggestions"] = [];

      // High confidence: exact phone match to a roster canvasser
      if (normalizedManualPhone) {
        const phoneMatch = rosterByPhone.get(normalizedManualPhone);
        if (phoneMatch) {
          suggestions.push({
            canvasserId: phoneMatch.id,
            canvasserName: phoneMatch.name,
            canvasserPhone: phoneMatch.phone,
            confidence: "high",
          });
        }
      }

      // Medium confidence: normalized exact name match (not already suggested above)
      const alreadySuggestedIds = new Set(suggestions.map((s) => s.canvasserId));
      for (const candidate of rosterNormalized) {
        if (alreadySuggestedIds.has(candidate.id)) continue;
        if (candidate.norm === norm) {
          suggestions.push({
            canvasserId: candidate.id,
            canvasserName: candidate.name,
            canvasserPhone: candidate.phone,
            confidence: "medium",
          });
        }
      }

      if (suggestions.length > 0) {
        matches.push({
          manualName,
          manualPhone,
          submissionCount: group._count,
          suggestions,
        });
      }
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Error fetching canvasser matches:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
