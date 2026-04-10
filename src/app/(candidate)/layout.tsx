import { CandidateShell } from "@/components/candidate-dashboard/candidate-shell";
import { requirePageRole } from "@/lib/auth/guards";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageRole("candidate");

  return <CandidateShell>{children}</CandidateShell>;
}
