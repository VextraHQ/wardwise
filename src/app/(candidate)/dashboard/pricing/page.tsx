import type { Metadata } from "next";
import { PricingContent } from "@/features/candidate-dashboard/components/pricing-content";

export const metadata: Metadata = {
  title: "Plans & Pricing",
  description:
    "Choose your WardWise plan for voter data access and verification.",
};

export default function PricingPage() {
  return <PricingContent />;
}
