import { createRegistrationMetadata } from "@/lib/metadata";
import { LocationStep } from "@/components/voter/steps/location-step";

export const metadata = createRegistrationMetadata({
  title: "Select Your Location",
  description: "Select your state, LGA, ward, and polling unit.",
});

export default function LocationPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <LocationStep />
      </div>
    </div>
  );
}
