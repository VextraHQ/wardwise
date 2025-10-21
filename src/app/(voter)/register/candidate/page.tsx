import type { Metadata } from "next";
import { CandidateSelectionStep } from "@/components/voter/steps/candidate-selection-step";

export const metadata: Metadata = {
  title: "Choose Your Candidate | WardWise Registration",
  description:
    "Select the candidate you want to support based on your survey responses.",
};

export default function CandidatePage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <CandidateSelectionStep />
      </div>
    </div>
  );
}
