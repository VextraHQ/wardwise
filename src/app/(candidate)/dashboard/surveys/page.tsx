import type { Metadata } from "next";
import { SurveysContent } from "@/components/candidate-dashboard/surveys-content";

export const metadata: Metadata = {
  title: "Surveys",
  description:
    "Manage and analyze your campaign surveys. Create surveys, view responses, and track completion rates.",
};

export default function SurveysPage() {
  return <SurveysContent />;
}
