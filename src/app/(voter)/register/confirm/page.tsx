import { createRegistrationMetadata } from "@/lib/metadata";
import { ConfirmationStep } from "@/components/voter/steps/confirmation-step";

export const metadata = createRegistrationMetadata({
  title: "Confirm Your Registration",
  description:
    "Review and confirm your voter registration details before submitting.",
});

export default function ConfirmPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <ConfirmationStep />
      </div>
    </div>
  );
}
