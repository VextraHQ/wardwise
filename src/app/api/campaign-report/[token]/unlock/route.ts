import { NextResponse } from "next/server";
import {
  validateReportToken,
  verifyPasscode,
  signReportCookie,
  touchReportLastViewed,
  REPORT_COOKIE_NAME,
} from "@/lib/server/report-access";
import { reportUnlockRateLimit, getClientIp } from "@/lib/core/rate-limit";
import { logAudit } from "@/lib/core/audit";

type RouteParams = { params: Promise<unknown> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { token } = (await params) as { token: string };

    // Rate limit
    if (reportUnlockRateLimit) {
      const ip = getClientIp(request);
      const { success } = await reportUnlockRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many attempts. Please wait a moment." },
          { status: 429 },
        );
      }
    }

    const campaign = await validateReportToken(token);
    if (!campaign) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (!campaign.clientReportPasscodeHash) {
      return NextResponse.json(
        { error: "Report access not configured" },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const passcode = typeof body.passcode === "string" ? body.passcode : "";

    const valid = await verifyPasscode(
      passcode,
      campaign.clientReportPasscodeHash,
    );

    void logAudit(
      valid ? "report.unlock.success" : "report.unlock.failed",
      "campaign",
      campaign.id,
      null,
      { ip: getClientIp(request) },
    );

    if (!valid) {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
    }

    // Update last viewed
    void touchReportLastViewed(campaign.id);

    // Set signed access cookie
    const cookieValue = signReportCookie(
      token,
      campaign.clientReportPasscodeHash,
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set(REPORT_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Error unlocking report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
