import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | WardWise",
  description:
    "Manage candidates, voters, and platform settings. View analytics and oversee the WardWise platform.",
  openGraph: {
    title: "Admin Dashboard | WardWise",
    description:
      "Manage candidates, voters, and platform settings. View analytics and oversee the WardWise platform.",
  },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
