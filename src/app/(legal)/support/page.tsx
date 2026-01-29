import type { Metadata } from "next";
import { SupportContent } from "@/components/legal/support-content";

export const metadata: Metadata = {
  title: "Support Center",
  description:
    "Get help with WardWise. Find answers to frequently asked questions and contact our support team.",
};

export default function SupportCenterPage() {
  return <SupportContent />;
}
