import { Metadata } from "next";
import { CanvasserDashboard } from "@/components/canvasser/canvasser-dashboard";

export const metadata: Metadata = {
  title: "Canvasser Dashboard | WardWise Canvasser",
  description: "Manage your voter registrations and track your performance.",
};

export default function CanvasserPage() {
  return <CanvasserDashboard />;
}
