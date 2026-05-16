import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/core/prisma";
import { CampaignRegistrationForm } from "@/features/collect/components/public/campaign-registration-form";
import {
  createDefaultOpenGraph,
  createDefaultTwitter,
  getSiteUrl,
} from "@/lib/core/metadata";
import { getCampaignDisplayHeadline } from "@/features/collect/lib/branding";
import { getPublicCampaign } from "@/features/collect/server/get-public-campaign";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    select: {
      candidateName: true,
      candidateTitle: true,
      brandingType: true,
      displayName: true,
      party: true,
      constituency: true,
    },
  });

  if (!campaign) {
    return { title: "Campaign Not Found" };
  }

  const headline = getCampaignDisplayHeadline(campaign);
  const title = `${headline} — Supporter Registration`;
  const description = `Register your support for ${headline} (${campaign.party}) in ${campaign.constituency}. Add your name on WardWise to help mobilise the campaign.`;
  const url = `${getSiteUrl()}/c/${slug}`;

  return {
    title,
    description,
    openGraph: createDefaultOpenGraph({
      title,
      description,
      url,
    }),
    twitter: createDefaultTwitter({
      title,
      description,
    }),
  };
}

export default async function CampaignPage({ params }: PageProps) {
  const { slug } = await params;
  const initialCampaign = await getPublicCampaign(slug);

  if (!initialCampaign) {
    notFound();
  }

  return <CampaignRegistrationForm initialCampaign={initialCampaign} />;
}
