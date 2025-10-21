import type { Metadata } from "next";
import { SurveyStep } from "@/components/voter/steps/survey-step";

export const metadata: Metadata = {
  title: "Share Your Priorities | WardWise Registration",
  description:
    "Help us understand what matters most to you by completing this survey.",
};

export default function SurveyPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <SurveyStep />
      </div>
    </div>
  );
}
