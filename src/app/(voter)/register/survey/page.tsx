import type { Metadata } from "next";
import { SurveyStep } from "@/components/voter/steps/survey-step";

export const metadata: Metadata = {
  title: "Share Your Priorities | WardWise Registration",
  description:
    "Help us understand what matters most to you by completing this survey.",
};

export default function SurveyPage() {
  return (
    <div className="from-background via-muted/30 to-background relative min-h-[calc(100vh-4rem)] bg-gradient-to-br">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(70,194,167,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(29,69,58,0.1),transparent_50%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <SurveyStep />
      </div>
    </div>
  );
}
