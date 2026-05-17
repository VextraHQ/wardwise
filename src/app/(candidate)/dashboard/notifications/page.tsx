import type { Metadata } from "next";
import { NotificationsContent } from "@/features/candidate-dashboard/components/notifications-content";

export const metadata: Metadata = {
  title: "Notifications",
  description:
    "Stay updated with campaign activities, new supporters, canvasser updates, and campaign progress.",
};

export default function NotificationsPage() {
  return <NotificationsContent />;
}
