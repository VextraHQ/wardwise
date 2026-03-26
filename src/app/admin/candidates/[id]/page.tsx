import { CandidateDetail } from "@/components/admin/candidates/candidate-detail";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata = createAdminMetadata({
  title: "Candidate Detail",
  description: "View and manage candidate details, campaigns, and account.",
});

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <CandidateDetail paramsPromise={params} />;
}
