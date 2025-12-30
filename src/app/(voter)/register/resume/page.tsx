import { createRegistrationMetadata } from "@/lib/metadata";
import { ResumeRegistrationStep } from "@/components/voter/steps/resume-registration-step";

export const metadata = createRegistrationMetadata({
  title: "Resume Your Registration",
  description: "Continue your incomplete voter registration.",
});

export default function ResumePage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <ResumeRegistrationStep />
      </div>
    </div>
  );
}
