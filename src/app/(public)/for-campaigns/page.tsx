import { ForCampaignsContent } from "@/features/public-site/components/for-campaigns/for-campaigns-content";
import { createPublicMetadata } from "@/lib/core/metadata";

export const metadata = createPublicMetadata({
  title: "For Campaigns",
  description:
    "How WardWise fits a campaign: Collect for field capture, reporting for decisions, and one shared geography across the team.",
});

export default function ForCampaignsPage() {
  return <ForCampaignsContent />;
}
