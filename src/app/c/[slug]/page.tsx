import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/core/prisma";
import { CampaignRegistrationForm } from "@/features/collect/components/public/campaign-registration-form";
import type { PublicCampaign } from "@/features/collect/types/collect.types";
import {
  createDefaultOpenGraph,
  createDefaultTwitter,
  getSiteUrl,
} from "@/lib/core/metadata";
import {
  getCampaignBrandingType,
  getCampaignDisplayHeadline,
} from "@/features/collect/lib/branding";

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

  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      candidateName: true,
      candidateTitle: true,
      brandingType: true,
      displayName: true,
      party: true,
      constituency: true,
      constituencyType: true,
      enabledLgaIds: true,
      customQuestion1: true,
      customQuestion2: true,
      status: true,
      updatedAt: true,
      campaignCanvassers: {
        select: { id: true, name: true, phone: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!campaign || campaign.status === "draft") {
    notFound();
  }

  const initialCampaign: PublicCampaign = {
    ...campaign,
    brandingType: getCampaignBrandingType(campaign.brandingType),
    updatedAt: campaign.updatedAt.toISOString(),
  };

  return <CampaignRegistrationForm initialCampaign={initialCampaign} />;
}
