import type { Metadata } from "next";
import { OtpVerifyStep } from "@/components/voter/steps/otp-verify-step";

export const metadata: Metadata = {
  title: "Verify Your Phone | WardWise Registration",
  description: "Enter the verification code sent to your phone number.",
};

export default function VerifyPage() {
  return (
    <div className="from-background via-muted/30 to-background relative min-h-[calc(100vh-4rem)] bg-gradient-to-br">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(70,194,167,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(29,69,58,0.1),transparent_50%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <OtpVerifyStep />
      </div>
    </div>
  );
}
