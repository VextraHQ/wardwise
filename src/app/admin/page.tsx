import { createAdminMetadata } from "@/lib/metadata";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata = createAdminMetadata({
  title: "Dashboard",
  description:
    "Manage candidates, voters, and platform settings. View analytics and oversee the WardWise platform.",
  openGraph: {
    title: "Dashboard",
    description:
      "Manage candidates, voters, and platform settings. View analytics and oversee the WardWise platform.",
  },
});

export default function AdminPage() {
  return <AdminDashboard />;
}
