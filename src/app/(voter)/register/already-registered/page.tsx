import type { Metadata } from "next";
import { AlreadyRegisteredStep } from "@/components/voter/steps/already-registered-step";

export const metadata: Metadata = {
  title: "You're Already Registered | WardWise Registration",
  description: "You're already registered in our system.",
};

export default function AlreadyRegisteredPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <AlreadyRegisteredStep />
      </div>
    </div>
  );
}
