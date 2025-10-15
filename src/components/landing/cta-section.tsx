import Link from "next/link";
import { HiArrowRight, HiShieldCheck } from "react-icons/hi";
import { HiUsers, HiMapPin } from "react-icons/hi2";

import { Button } from "@/components/ui/button";

export function CallToActionSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f8fbfa] to-white py-16 sm:py-20 lg:py-24">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231D453A' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0V0zm40 40h1v1h-1v-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Accent elements */}
      <div
        className="absolute top-1/4 -left-20 h-64 w-64 rounded-full bg-[#46C2A7] opacity-[0.06] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-20 bottom-1/4 h-64 w-64 rounded-full bg-[#1D453A] opacity-[0.04] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#dcece6] bg-white shadow-[0_14px_32px_rgba(12,39,32,0.08)] backdrop-blur-3xl">
          <div className="sm:py-20">
            <div className="mx-auto max-w-3xl space-y-10 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#46C2A7]/20 bg-[#46C2A7]/5 px-4 py-2">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#46C2A7]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#46C2A7]/60" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#46C2A7]/30" />
                </div>
                <span className="text-xs font-medium tracking-wider text-[#1D453A] uppercase">
                  Unite citizens, campaigns, and governance
                </span>
              </div>

              {/* Heading */}
              <div className="space-y-5">
                <h2 className="text-3xl leading-tight font-bold tracking-tight text-[#0f2b24] sm:text-4xl lg:text-5xl">
                  Ready to activate your movement with{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10">ward-level accuracy</span>
                    <span className="absolute bottom-1 left-0 h-3 w-full bg-[#46C2A7]/20" />
                  </span>
                  ?
                </h2>
                <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#3b6558] sm:text-lg">
                  WardWise helps campaigns, governments, civil groups, and
                  partners understand Nigerians at scale. Launch in a single
                  state or coordinate nationwide—every supporter interaction
                  stays verified and actionable.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="bg-secondary-foreground hover:bg-secondary-foreground/90 h-12 rounded-xl px-8 text-base font-semibold text-white transition-all duration-200 hover:shadow-lg sm:h-14"
                  asChild
                >
                  <Link href="/register">
                    Register as Voter
                    <HiArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-muted-foreground hover:bg-primary/10 hover:text-muted-foreground h-12 rounded-xl border-2 border-[#dcece6] bg-white px-8 text-base font-semibold transition-all duration-200 hover:border-[#46C2A7] sm:h-14"
                  asChild
                >
                  <Link href="/login">Candidate Login</Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 border-t border-[#dcece6] pt-8 text-xs text-[#3b6558]">
                <div className="flex items-center gap-2">
                  <HiShieldCheck className="h-4 w-4 text-[#46C2A7]" />
                  <span className="font-medium">Secure & verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiUsers className="h-4 w-4 text-[#46C2A7]" />
                  <span className="font-medium">10,000+ supporters</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiMapPin className="h-4 w-4 text-[#46C2A7]" />
                  <span className="font-medium">420 polling units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
