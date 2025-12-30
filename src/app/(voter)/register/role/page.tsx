import { createRegistrationMetadata } from "@/lib/metadata";
import { RoleSelectionStep } from "@/components/voter/steps/role-selection-step";

export const metadata = createRegistrationMetadata({
  title: "Select Role",
  description: "Choose your role as a Voter or Supporter.",
});

export default function RoleSelectionPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <RoleSelectionStep />
      </div>
    </div>
  );
}
