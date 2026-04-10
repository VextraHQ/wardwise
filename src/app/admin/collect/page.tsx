import { CampaignList } from "@/components/admin/collect/campaign-list";
import { createAdminMetadata } from "@/lib/core/metadata";

export const metadata = createAdminMetadata({
  title: "Collect",
  description: "Manage voter/supporter registration campaigns.",
});

export default function AdminCollectPage() {
  return <CampaignList />;
}
