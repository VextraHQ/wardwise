import type { Metadata } from "next";
import { SupportersContent } from "@/components/candidate-dashboard/supporters-content";

export const metadata: Metadata = {
  title: "Supporters | WardWise",
  description:
    "View and manage all voters supporting your campaign. Search, filter, and track supporter information.",
};

export default function SupportersPage() {
  return <SupportersContent />;
}
