import type { Metadata } from "next";
import { DuplicateCheckStep } from "@/components/voter/steps/duplicate-check-step";

export const metadata: Metadata = {
  title: "Checking Your Registration | WardWise Registration",
  description: "Checking if you're already registered in the system.",
};

export default function CheckPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <DuplicateCheckStep />
      </div>
    </div>
  );
}
