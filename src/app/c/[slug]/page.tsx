import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CampaignRegistrationForm } from "@/components/collect/campaign-registration-form";
import type { PublicCampaign } from "@/types/collect";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    select: { candidateName: true, party: true, constituency: true },
  });

  if (!campaign) {
    return { title: "Campaign Not Found" };
  }

  const title = `Register — ${campaign.candidateName} (${campaign.party})`;
  const description = `Join ${campaign.candidateName}'s supporter registration for ${campaign.constituency} on WardWise.`;
  const baseUrl =
    process.env.NEXT_PUBLIC_COLLECT_BASE_URL || "https://wardwise.ng";
  const url = `${baseUrl}/c/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "WardWise",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
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
      party: true,
      constituency: true,
      constituencyType: true,
      enabledLgaIds: true,
      customQuestion1: true,
      customQuestion2: true,
      status: true,
      campaignCanvassers: {
        select: { id: true, name: true, phone: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!campaign || campaign.status === "draft") {
    notFound();
  }

  const initialCampaign: PublicCampaign = campaign;

  return <CampaignRegistrationForm initialCampaign={initialCampaign} />;
}
