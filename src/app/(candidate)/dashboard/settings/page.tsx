import type { Metadata } from "next";
import { SettingsContent } from "@/components/candidate-dashboard/settings-content";

export const metadata: Metadata = {
  title: "Settings | WardWise",
  description: "Manage your account and dashboard preferences.",
};

export default function SettingsPage() {
  return <SettingsContent />;
}
