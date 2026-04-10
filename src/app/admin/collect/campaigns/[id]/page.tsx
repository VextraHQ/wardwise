import { CampaignDetail } from "@/components/admin/collect/campaign-detail";
import { createAdminMetadata } from "@/lib/core/metadata";

export const metadata = createAdminMetadata({
  title: "Campaign Detail",
  description: "View and manage campaign details, submissions, and settings.",
});

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <CampaignDetail paramsPromise={params} />;
}
