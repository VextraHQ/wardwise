import type { Metadata } from "next";
import { NotificationsContent } from "@/components/candidate-dashboard/notifications-content";

export const metadata: Metadata = {
  title: "Notifications | WardWise",
  description:
    "Stay updated with campaign activities, new supporters, survey responses, and campaign updates.",
};

export default function NotificationsPage() {
  return <NotificationsContent />;
}
