import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/core/prisma";
import { CampaignRegistrationForm } from "@/components/collect/campaign-registration-form";
import type { PublicCampaign } from "@/types/collect";
import {
  createDefaultOpenGraph,
  createDefaultTwitter,
  getSiteUrl,
} from "@/lib/core/metadata";
import {
  getCampaignBrandingType,
  getEffectiveCampaignName,
} from "@/lib/collect/branding";

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
      displayName: true,
      party: true,
      constituency: true,
    },
  });

  if (!campaign) {
    return { title: "Campaign Not Found" };
  }

  const campaignName = getEffectiveCampaignName(campaign);
  const title = `${campaignName} - Supporter Registration`;
  const description = `Register your support for ${campaignName} in ${campaign.constituency} on WardWise, Nigeria's campaign intelligence platform for supporter mobilisation and field insights.`;
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
