import type { Metadata } from "next";
import { WardsContent } from "@/components/candidate-dashboard/wards-content";

export const metadata: Metadata = {
  title: "Wards",
  description:
    "Track supporter coverage across all wards. View ward details, supporter counts, and coverage statistics.",
};

export default function WardsPage() {
  return <WardsContent />;
}
