import type { Metadata } from "next";
import { PrivacyContent } from "@/components/legal/privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how WardWise collects, uses, and protects your personal information on our civic intelligence platform.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyContent />;
}
