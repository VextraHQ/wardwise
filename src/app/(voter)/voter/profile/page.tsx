import { createVoterMetadata } from "@/lib/metadata";
import { VoterProfile } from "@/components/voter/voter-profile";

export const metadata = createVoterMetadata({
  title: "My Profile",
  description: "View and manage your voter registration information.",
});

export default function VoterProfilePage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <VoterProfile />
      </div>
    </div>
  );
}
