import Link from "next/link";

import { Button } from "@/components/ui/button";
import { heroSupportingCopy, trustIndicators } from "@/lib/landing-data";

const benefitPoints = [
  "Your voice reaches your chosen candidate directly",
  "Share what matters most in your community",
  "Organized by your exact polling unit location",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2346C2A7' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Accent shapes */}
      <div
        className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#46C2A7] opacity-[0.08] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#1D453A] opacity-[0.06] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Left column - Content */}
          <div className="flex flex-col justify-center space-y-10">
            <div className="inline-flex">
              <span className="inline-flex items-center gap-2 rounded-md border border-[#46C2A7]/20 bg-[#46C2A7]/5 px-3 py-1.5 text-xs font-medium tracking-wider text-[#1D453A] uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#46C2A7]" />
                Civic Insight Platform
              </span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl leading-[1.1] font-bold tracking-tight text-[#0f2b24] sm:text-6xl lg:text-7xl">
                From Ward
                <br />
                to Victory
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-[#3b6558]">
                {heroSupportingCopy}
              </p>
            </div>

            <ul className="space-y-4">
              {benefitPoints.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#46C2A7]">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-base leading-relaxed text-[#0f2b24]">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-6 pt-4 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-12 rounded-lg bg-[#46C2A7] px-8 text-base font-semibold text-white transition-all hover:bg-[#3ba890]"
                asChild
              >
                <Link href="/register">Register to Support a Candidate</Link>
              </Button>
              <div className="text-sm text-[#3b6558]">
                For candidates:{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#0f2b24] underline decoration-[#46C2A7]/30 decoration-2 underline-offset-4 transition-colors hover:decoration-[#46C2A7]"
                >
                  Login to dashboard
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-[#46C2A7]/10 pt-8">
              {trustIndicators.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs font-medium text-[#3b6558]"
                >
                  <div className="h-1 w-1 rounded-full bg-[#46C2A7]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Dashboard preview */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Dashboard card */}
              <div className="overflow-hidden rounded-2xl border border-[#dcece6] bg-white">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#dcece6] bg-linear-to-br from-[#f8fbfa] to-white px-6 py-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-[#1D453A] uppercase">
                      Live Metrics
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#3b6558]">
                      Supporters syncing every hour
                    </p>
                  </div>
                  <span className="rounded-full border border-[#46C2A7]/20 bg-[#46C2A7]/10 px-3 py-1 text-xs font-medium text-[#1D453A]">
                    Dashboard
                  </span>
                </div>

                {/* Main content */}
                <div className="relative bg-linear-to-br from-[#124438] via-[#0f2b24] to-[#0b1e1a] p-6">
                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-[#46C2A7] opacity-10 blur-2xl" />
                  <div className="absolute right-0 bottom-0 h-24 w-24 rounded-full bg-[#46C2A7] opacity-10 blur-2xl" />

                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-medium tracking-wider text-white/60 uppercase">
                      <span>Adamawa Overview</span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                        Updated 3m ago
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                        <span className="text-sm text-white/70">
                          Polling units mapped
                        </span>
                        <span className="text-xl font-bold text-white">
                          420
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                        <span className="text-sm text-white/70">
                          Supporters verified
                        </span>
                        <span className="text-xl font-bold text-white">
                          10,000+
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                        <span className="text-sm text-white/70">
                          Top issue today
                        </span>
                        <span className="text-xl font-bold text-white">
                          Youth jobs
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {["State", "LGA", "Ward"].map((label) => (
                        <div
                          key={label}
                          className="rounded-lg border border-white/10 bg-white/5 py-2 text-center text-xs font-medium text-white/70 backdrop-blur-sm"
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="space-y-3 border-t border-[#dcece6] bg-linear-to-br from-white to-[#f8fbfa] px-6 py-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#3b6558]">Next ward outreach</span>
                    <span className="font-semibold text-[#0f2b24]">
                      Jimeta • Ward 08
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#3b6558]">Field agents active</span>
                    <span className="font-semibold text-[#0f2b24]">27</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#3b6558]">Household follow-ups</span>
                    <span className="font-semibold text-[#0f2b24]">
                      312 scheduled
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating accent card */}
              <div className="absolute -bottom-6 -left-6 rounded-xl border border-[#46C2A7]/20 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#46C2A7]/10">
                    <svg
                      className="h-5 w-5 text-[#46C2A7]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#3b6558]">
                      Growth this week
                    </p>
                    <p className="text-lg font-bold text-[#0f2b24]">+24%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
