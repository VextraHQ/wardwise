import type { Metadata } from "next";
import { CandidateSurveyStep } from "@/components/voter/steps/candidate-survey-step";

export const metadata: Metadata = {
  title: "Help Your Candidate Understand You | WardWise Registration",
  description:
    "Answer a few quick questions to help your selected candidate understand what matters most to you and your community.",
};

export default function SurveyPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <CandidateSurveyStep />
      </div>
    </div>
  );
}
