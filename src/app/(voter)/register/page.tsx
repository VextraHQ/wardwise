import { createRegistrationMetadata } from "@/lib/metadata";
import { NinEntryStep } from "@/components/voter/steps/nin-entry-step";

export const metadata = createRegistrationMetadata({
  title: "Enter Your NIN",
  description:
    "Start your voter registration by entering your National Identification Number (NIN). We'll verify it with NIMC.",
});

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <NinEntryStep />
      </div>
    </div>
  );
}
