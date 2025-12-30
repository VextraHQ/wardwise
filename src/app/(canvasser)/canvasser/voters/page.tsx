import { createCanvasserMetadata } from "@/lib/metadata";
import { CanvasserVotersList } from "@/components/canvasser/canvasser-voters-list";

export const metadata = createCanvasserMetadata({
  title: "My Voters",
  description: "View all voters you have registered.",
});

export default function CanvasserVotersPage() {
  return <CanvasserVotersList />;
}
