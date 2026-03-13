import { CandidateManagement } from "@/components/admin/candidate-management";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata = createAdminMetadata({
  title: "Candidates",
  description:
    "Search, filter, and manage candidate accounts from the dedicated WardWise Super Admin candidates workspace.",
  openGraph: {
    title: "Candidates",
    description:
      "Search, filter, and manage candidate accounts from the dedicated WardWise Super Admin candidates workspace.",
  },
});

export default function AdminCandidatesPage() {
  return <CandidateManagement />;
}
