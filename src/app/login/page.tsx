import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#071913] via-[#02100b] to-[#030f0b] px-6 py-24 text-center text-white">
      <div
        className="absolute inset-0 bg-[url('/texture/noise.png')] opacity-[0.08]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,135,81,0.28),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(255,184,28,0.2),_transparent_60%)]" />
      <div className="relative max-w-2xl space-y-6 rounded-3xl border border-white/10 bg-white/10 p-10 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          WardWise Candidate Portal
        </h1>
        <p className="text-base leading-relaxed text-white/75">
          We are onboarding campaign teams and government partners in cohorts to
          ensure data integrity. Our team will provide secure credentials once
          your organisation is verified.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-white/70">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 font-medium text-[#a7f3d0]">
            Private beta
          </span>
          <span>Contact partnerships@wardwise.ng for access</span>
        </div>
        <div className="flex justify-center gap-3">
          <Button
            asChild
            className="bg-gradient-to-r from-[#00a96b] via-[#00c38f] to-[#ffb81c] px-6 text-zinc-900 shadow-[0_18px_44px_rgba(0,135,81,0.5)] hover:shadow-[0_22px_60px_rgba(0,135,81,0.6)]"
          >
            <Link href="/">Back to WardWise</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
