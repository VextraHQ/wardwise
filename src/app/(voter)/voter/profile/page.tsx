import type { Metadata } from "next";
import { VoterProfile } from "@/components/voter/voter-profile";

export const metadata: Metadata = {
  title: "My Profile | WardWise",
  description: "View and manage your voter registration information.",
};

export default function VoterProfilePage() {
  return (
    <div className="from-background via-muted/30 to-background relative min-h-[calc(100vh-4rem)] bg-gradient-to-br">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(70,194,167,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(29,69,58,0.1),transparent_50%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <VoterProfile />
      </div>
    </div>
  );
}
