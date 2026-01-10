import { createRegistrationMetadata } from "@/lib/metadata";
import { CandidateSelectionStep } from "@/components/voter/steps/candidate-selection-step";

export const metadata = createRegistrationMetadata({
  title: "Choose Your Candidates",
  description:
    "Select candidates for all 5 positions: President, Governor, Senator, House of Representatives, and State Assembly.",
});

export default function CandidatePage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <CandidateSelectionStep />
      </div>
    </div>
  );
}
