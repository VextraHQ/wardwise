"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { HiArrowRight, HiShieldCheck } from "react-icons/hi";
import { HiUsers, HiMapPin } from "react-icons/hi2";

import { Button } from "@/components/ui/button";

export function CallToActionSection() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && session?.user;
  const loginHref =
    isAuthenticated && session.user.role === "candidate"
      ? "/dashboard"
      : isAuthenticated && session.user.role === "admin"
        ? "/admin"
        : "/login";
  const loginText =
    isAuthenticated && session.user.role === "candidate"
      ? "Dashboard"
      : isAuthenticated && session.user.role === "admin"
        ? "Admin Dashboard"
        : "Candidate Login";

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-white via-[#f8fbfa] to-white py-16 sm:py-20 lg:py-24">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231D453A' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0V0zm40 40h1v1h-1v-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden={true}
      />

      {/* Accent elements */}
      <div
        className="bg-primary absolute top-1/4 -left-20 h-64 w-64 rounded-full opacity-[0.06] blur-3xl"
        aria-hidden={true}
      />
      <div
        className="bg-accent absolute -right-20 bottom-1/4 h-64 w-64 rounded-full opacity-[0.04] blur-3xl"
        aria-hidden={true}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="border-border bg-card relative overflow-hidden rounded-3xl border backdrop-blur-sm">
          <div className="px-6 py-16 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-8 text-center sm:space-y-10">
              {/* Badge */}
              <div className="border-primary/20 bg-primary/5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 sm:gap-2 sm:px-4 sm:py-2">
                <div className="flex gap-1">
                  <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                  <span className="bg-primary/60 h-1.5 w-1.5 rounded-full" />
                  <span className="bg-primary/30 h-1.5 w-1.5 rounded-full" />
                </div>
                <span className="text-foreground/80 text-[10px] font-semibold tracking-wider uppercase sm:text-xs">
                  Unite citizens, campaigns, and governance
                </span>
              </div>

              {/* Heading */}
              <div className="space-y-4 sm:space-y-5">
                <h2 className="text-foreground text-3xl leading-tight font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Ready to activate your movement with{" "}
                  <span className="relative inline-block">
                    <span className="text-primary relative z-10">
                      ward-level accuracy
                    </span>
                    <span className="bg-primary/20 absolute bottom-1 left-0 h-3 w-full" />
                  </span>
                  ?
                </h2>
                <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed sm:text-lg">
                  WardWise helps campaigns, governments, civil groups, and
                  partners understand Nigerians at scale. Launch in a single
                  state or coordinate nationwide—every supporter interaction
                  stays verified and actionable.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl px-8 text-base font-semibold transition-all duration-200 hover:shadow-lg sm:h-14"
                  asChild
                >
                  <Link href="/register" className="flex items-center gap-2">
                    Register as Voter
                    <HiArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-border bg-card text-foreground hover:border-primary hover:bg-primary/5 h-12 rounded-xl border-2 px-8 text-base font-semibold transition-all duration-200 sm:h-14"
                  asChild
                >
                  <Link href="/voter-login" className="flex items-center gap-2">
                    <HiUsers className="h-4 w-4" />
                    Voter Login
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-border bg-card text-foreground hover:border-primary hover:bg-primary/5 h-12 rounded-xl border-2 px-8 text-base font-semibold transition-all duration-200 sm:h-14"
                  asChild
                >
                  <Link href={loginHref}>{loginText}</Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="border-border/50 text-muted-foreground flex flex-wrap items-center justify-center gap-6 border-t pt-6 text-xs sm:pt-8">
                <div className="flex items-center gap-2">
                  <HiShieldCheck className="text-primary h-4 w-4" />
                  <span className="font-medium">Secure & verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiUsers className="text-primary h-4 w-4" />
                  <span className="font-medium">10,000+ supporters</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiMapPin className="text-primary h-4 w-4" />
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
