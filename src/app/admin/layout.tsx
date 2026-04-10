import { AdminShell } from "@/components/admin/admin-shell";
import { requirePageRole } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageRole("admin");

  return <AdminShell>{children}</AdminShell>;
}
