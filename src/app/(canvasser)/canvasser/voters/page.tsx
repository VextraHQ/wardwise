import { Metadata } from "next";
import { CanvasserVotersList } from "@/components/canvasser/canvasser-voters-list";

export const metadata: Metadata = {
  title: "My Voters | WardWise Canvasser",
  description: "View all voters you have registered.",
};

export default function CanvasserVotersPage() {
  return <CanvasserVotersList />;
}
