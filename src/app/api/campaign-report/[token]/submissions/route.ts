import { NextResponse } from "next/server";
import { validateReportRequest } from "@/lib/server/report-access";
import { getRecentSubmissions } from "@/lib/server/collect-reporting";
import { parseBooleanParam, parseIntegerParam } from "@/lib/exports/shared";

type RouteParams = { params: Promise<unknown> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { token } = (await params) as { token: string };
    const { campaign, error } = await validateReportRequest(token, request);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const status = searchParams.get("status") || undefined;
    const page = parseIntegerParam(searchParams.get("page")) ?? 1;
    const pageSize = parseIntegerParam(searchParams.get("pageSize")) ?? 20;

    const isVerified =
      status === "verified"
        ? true
        : status === "pending"
          ? false
          : parseBooleanParam(searchParams.get("isVerified"));

    const isFlagged =
      status === "flagged"
        ? true
        : status === "pending"
          ? false
          : parseBooleanParam(searchParams.get("isFlagged"));

    const data = await getRecentSubmissions(campaign.id, {
      page,
      pageSize,
      filters: {
        search: searchParams.get("search") || undefined,
        role: searchParams.get("role") || undefined,
        isVerified,
        isFlagged,
      },
    });

    return NextResponse.json({
      ...data,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching report submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
