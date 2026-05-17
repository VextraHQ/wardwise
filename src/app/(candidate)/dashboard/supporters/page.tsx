import type { Metadata } from "next";
import { SupportersContent } from "@/features/candidate-dashboard/components/supporters-content";

export const metadata: Metadata = {
  title: "Supporters",
  description:
    "View and manage all voters supporting your campaign. Search, filter, and track supporter information.",
};

export default function SupportersPage() {
  return <SupportersContent />;
}
