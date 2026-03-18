import { CampaignWizard } from "@/components/admin/collect/wizard/campaign-wizard";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata = createAdminMetadata({
  title: "New Campaign",
  description: "Create a new registration campaign.",
});

export default function NewCampaignPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-4 md:p-6">
      <CampaignWizard />
    </div>
  );
}
