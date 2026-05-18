import { SupportContent } from "@/features/public-site/components/support/support-content";
import { createPublicMetadata } from "@/lib/core/metadata";

export const metadata = createPublicMetadata({
  title: "Support Center",
  description:
    "Get help with WardWise, review the most common questions, and reach the right contact path quickly.",
});

export default function SupportCenterPage() {
  return <SupportContent />;
}
