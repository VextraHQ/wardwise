import { CreateCandidateForm } from "@/components/admin/candidates/create-candidate-form";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata = createAdminMetadata({
  title: "New Candidate",
  description: "Create a new candidate account on WardWise.",
});

export default function NewCandidatePage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-4 md:p-6">
      <CreateCandidateForm />
    </div>
  );
}
