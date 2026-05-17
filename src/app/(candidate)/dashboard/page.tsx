import type { Metadata } from "next";
import { DashboardContent } from "@/features/candidate-dashboard/components/dashboard-content";
import {
  getCandidateNameForMetadata,
  generateCandidateTitle,
} from "@/features/candidate-dashboard/lib/metadata-helpers";

export async function generateMetadata(): Promise<Metadata> {
  const candidateName = await getCandidateNameForMetadata();
  const title = generateCandidateTitle("Dashboard", candidateName);

  return {
    title,
    description:
      "View your campaign analytics, supporter insights, ward coverage, and field data.",
  };
}

export default function Page() {
  return <DashboardContent />;
}
