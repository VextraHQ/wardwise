import { createAdminMetadata } from "@/lib/metadata";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata = createAdminMetadata({
  title: "Admin Dashboard",
  description:
    "Monitor candidate coverage, recent admin activity, and platform readiness from the WardWise Super Admin dashboard.",
  openGraph: {
    title: "Admin Dashboard",
    description:
      "Monitor candidate coverage, recent admin activity, and platform readiness from the WardWise Super Admin dashboard.",
  },
});

export default function AdminPage() {
  return <AdminDashboard />;
}
