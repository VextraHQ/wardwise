import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  validateReportToken,
  verifyReportCookie,
  REPORT_COOKIE_NAME,
} from "@/lib/server/report-access";
import {
  createDefaultOpenGraph,
  createDefaultTwitter,
  getSiteUrl,
} from "@/lib/metadata";
import { ReportGate } from "@/components/campaign-report/report-gate";
import { ReportUnavailable } from "@/components/campaign-report/report-unavailable";
import { CampaignInsights } from "@/components/campaign-report/campaign-insights";

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

  const title = `Campaign Insights — ${campaign.candidateName} (${campaign.party})`;
  const description = `Private campaign reporting for ${campaign.candidateName} in ${campaign.constituency}.`;
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
        party={campaign.party}
        constituency={campaign.constituency}
      />
    );
  }

  return <CampaignInsights token={token} />;
}
