import type { Metadata } from "next";
import { VoterLogin } from "@/components/voter/voter-login";

export const metadata: Metadata = {
  title: "Voter Login | WardWise",
  description: "Login to access your voter profile and registration details.",
};

export default function VoterLoginPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <VoterLogin />
      </div>
    </div>
  );
}
