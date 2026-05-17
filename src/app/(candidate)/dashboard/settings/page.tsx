import type { Metadata } from "next";
import { SettingsContent } from "@/features/candidate-dashboard/components/settings-content";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account and dashboard preferences.",
};

export default function SettingsPage() {
  return <SettingsContent />;
}
