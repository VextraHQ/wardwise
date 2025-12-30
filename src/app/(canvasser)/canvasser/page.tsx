import { createCanvasserMetadata } from "@/lib/metadata";
import { CanvasserDashboard } from "@/components/canvasser/canvasser-dashboard";

export const metadata = createCanvasserMetadata({
  title: "Dashboard",
  description: "Manage your voter registrations and track your performance.",
});

export default function CanvasserPage() {
  return <CanvasserDashboard />;
}
