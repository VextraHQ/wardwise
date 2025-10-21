import type { Metadata } from "next";
import { ProfileStep } from "@/components/voter/steps/profile-step";

export const metadata: Metadata = {
  title: "Tell Us About Yourself | WardWise Registration",
  description: "Complete your profile to continue with voter registration.",
};

export default function ProfilePage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <ProfileStep />
      </div>
    </div>
  );
}
