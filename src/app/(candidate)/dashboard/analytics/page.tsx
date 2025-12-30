import type { Metadata } from "next";
import { AnalyticsContent } from "@/components/candidate-dashboard/analytics-content";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "View detailed campaign analytics, registration trends, demographics, and performance metrics.",
};

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
