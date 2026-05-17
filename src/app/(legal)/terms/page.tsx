import type { Metadata } from "next";
import { TermsContent } from "@/features/public-site/components/legal/terms-content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the terms and conditions for using WardWise civic intelligence platform.",
};

export default function TermsOfServicePage() {
  return <TermsContent />;
}
