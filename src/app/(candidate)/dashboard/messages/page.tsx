import type { Metadata } from "next";
import { MessagesContent } from "@/components/candidate-dashboard/messages-content";

export const metadata: Metadata = {
  title: "Messages | WardWise",
  description: "Communicate with your supporters, groups, or wards.",
};

export default function MessagesPage() {
  return <MessagesContent />;
}
