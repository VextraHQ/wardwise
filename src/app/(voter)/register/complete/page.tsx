import type { Metadata } from "next";
import { CompletionStep } from "@/components/voter/steps/completion-step";

export const metadata: Metadata = {
  title: "Your Registration is Complete! | WardWise Registration",
  description:
    "Your voter registration is complete. Thank you for participating!",
};

export default function CompletePage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <CompletionStep />
      </div>
    </div>
  );
}
