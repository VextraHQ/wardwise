import type { Metadata } from "next";
import { VoterLogin } from "@/components/voter/voter-login";

export const metadata: Metadata = {
  title: "Voter Login | WardWise",
  description: "Login to access your voter profile and registration details.",
};

export default function VoterLoginPage() {
  return (
    <div className="from-background via-muted/30 to-background relative min-h-[calc(100vh-4rem)] bg-gradient-to-br">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(70,194,167,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(29,69,58,0.1),transparent_50%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <VoterLogin />
      </div>
    </div>
  );
}
