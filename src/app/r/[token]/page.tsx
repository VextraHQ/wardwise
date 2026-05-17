import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  validateReportToken,
  verifyReportCookie,
  REPORT_COOKIE_NAME,
} from "@/features/reporting/server/report-access";
import {
  createDefaultOpenGraph,
  createDefaultTwitter,
  getSiteUrl,
} from "@/lib/core/metadata";
import { ReportGate } from "@/features/reporting/components/report-gate";
import { ReportUnavailable } from "@/features/reporting/components/report-unavailable";
import { CampaignInsights } from "@/features/reporting/components/campaign-insights";
import {
  getCampaignBrandingType,
  getCampaignDisplayHeadline,
} from "@/features/collect/lib/branding";

type PageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token } = await params;
  const campaign = await validateReportToken(token);

  if (!campaign) {
    return { title: "Report Unavailable" };
  }

  const headline = getCampaignDisplayHeadline(campaign);
  const title = `${headline} — Campaign Insights`;
  const description = `Live campaign insights for ${headline} (${campaign.party}) in ${campaign.constituency} — supporter activity, field performance, and local reporting.`;
  const url = `${getSiteUrl()}/r/${token}`;

  return {
    title,
    description,
    openGraph: createDefaultOpenGraph({ title, description, url }),
    twitter: createDefaultTwitter({ title, description }),
    robots: { index: false, follow: false },
  };
}

export default async function ReportPage({ params }: PageProps) {
  const { token } = await params;
  const campaign = await validateReportToken(token);

  if (!campaign) {
    return <ReportUnavailable />;
  }

  // Check for valid access cookie
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(REPORT_COOKIE_NAME)?.value;
  const hasAccess =
    cookieValue &&
    campaign.clientReportPasscodeHash &&
    verifyReportCookie(cookieValue, token, campaign.clientReportPasscodeHash);

  if (!hasAccess) {
    return (
      <ReportGate
        token={token}
        candidateName={campaign.candidateName}
        candidateTitle={campaign.candidateTitle}
        brandingType={getCampaignBrandingType(campaign.brandingType)}
        displayName={campaign.displayName}
        party={campaign.party}
        constituency={campaign.constituency}
        expiredSession={Boolean(cookieValue)}
      />
    );
  }

  return <CampaignInsights token={token} />;
}
