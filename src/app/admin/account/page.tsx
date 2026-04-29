import { AdminAccount } from "@/components/admin/admin-account";
import { createAdminMetadata } from "@/lib/core/metadata";

export const metadata = createAdminMetadata({
  title: "Account",
  description:
    "Manage the signed-in WardWise admin account, security posture, and future operator preferences.",
  openGraph: {
    title: "Account",
    description:
      "Manage the signed-in WardWise admin account, security posture, and future operator preferences.",
  },
});

export default function AdminAccountPage() {
  return <AdminAccount />;
}
