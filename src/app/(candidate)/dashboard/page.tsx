import type { Metadata } from "next";
import { DashboardContent } from "@/components/candidate-dashboard/dashboard-content";
import {
  getCandidateNameForMetadata,
  generateCandidateTitle,
} from "@/lib/core/metadata-helpers";

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
