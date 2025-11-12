import type { Metadata } from "next";
import { ChartPatternsShowcase } from "@/components/candidate-dashboard/chart-patterns";

export const metadata: Metadata = {
  title: "Charts | WardWise",
  description: "View chart patterns and visualizations for your campaign data.",
};

export default function ChartPatternsPage() {
  return <ChartPatternsShowcase />;
}
