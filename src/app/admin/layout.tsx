import { AdminShell } from "@/features/admin/components/admin-shell";
import { requirePageRole } from "@/features/auth/lib/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageRole("admin");

  return <AdminShell>{children}</AdminShell>;
}
