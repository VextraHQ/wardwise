import { createAdminMetadata } from "@/lib/metadata";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata = createAdminMetadata({
  title: "Candidate Management",
  description:
    "Create and manage candidate accounts, review campaign readiness, and oversee the active WardWise admin workspace.",
  openGraph: {
    title: "Candidate Management",
    description:
      "Create and manage candidate accounts, review campaign readiness, and oversee the active WardWise admin workspace.",
  },
});

export default function AdminPage() {
  return <AdminDashboard />;
}
