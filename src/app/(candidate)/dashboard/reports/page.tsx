import type { Metadata } from "next";
import { ReportsContent } from "@/components/candidate-dashboard/reports-content";

export const metadata: Metadata = {
  title: "Campaign Reports",
  description:
    "View and download campaign reports including verification summaries, deduplication analysis, and coverage breakdowns.",
};

export default function ReportsPage() {
  return <ReportsContent />;
}
