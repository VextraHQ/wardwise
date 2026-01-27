import type { Metadata } from "next";
import { VerificationContent } from "@/components/candidate-dashboard/verification-content";

export const metadata: Metadata = {
  title: "Voter Verification",
  description:
    "Verify voters in your constituency with NIN identity checks.",
};

export default function VerificationPage() {
  return <VerificationContent />;
}
