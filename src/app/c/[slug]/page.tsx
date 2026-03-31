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

  return {
    title: `Register — ${campaign.candidateName} (${campaign.party})`,
    description: `Join ${campaign.candidateName}'s supporter registration for ${campaign.constituency}.`,
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
