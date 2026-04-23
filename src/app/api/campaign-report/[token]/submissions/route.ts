import { NextResponse } from "next/server";
import { validateReportRequest } from "@/lib/server/report-access";
import { getRecentSubmissions } from "@/lib/server/collect-reporting";
import {
  parseBooleanParam,
  parseOptionalStringParam,
  parsePaginationParams,
} from "@/lib/server/query-params";

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
    const status = parseOptionalStringParam(searchParams, "status");
    const { page, pageSize } = parsePaginationParams(searchParams);
    const from = parseOptionalStringParam(searchParams, "from");
    const to = parseOptionalStringParam(searchParams, "to");
    const lga = parseOptionalStringParam(searchParams, "lga");

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
      from,
      to,
      lga,
      filters: {
        search: parseOptionalStringParam(searchParams, "search"),
        role: parseOptionalStringParam(searchParams, "role"),
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
