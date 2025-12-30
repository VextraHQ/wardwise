import type { Metadata } from "next";
import { ExportContent } from "@/components/candidate-dashboard/export-content";

export const metadata: Metadata = {
  title: "Export Data",
  description:
    "Export supporter lists, survey responses, and analytics data in various formats (CSV, Excel, PDF).",
};

export default function ExportPage() {
  return <ExportContent />;
}
