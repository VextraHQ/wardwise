"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { HiCheckCircle, HiArrowRight } from "react-icons/hi";

import { Button } from "@/components/ui/button";
import { heroSupportingCopy, trustIndicators } from "@/lib/landing-data";
import { HiArrowUpRight } from "react-icons/hi2";

const benefitPoints = [
  "Your voice reaches your chosen candidate directly",
  "Share what matters most in your community",
  "Organized by your exact polling unit location",
];

export function HeroSection() {
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
      ? "Go to dashboard"
      : isAuthenticated && session.user.role === "admin"
        ? "Go to admin"
        : "Login to dashboard";

  return (
    <section className="bg-background relative overflow-hidden py-10 sm:py-12 lg:py-16">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231f6b5e' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Accent shapes */}
      <div
        className="bg-primary absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-[0.08] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="bg-accent absolute -bottom-32 -left-32 h-80 w-80 rounded-full opacity-[0.06] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Left column - Content */}
          <div className="flex flex-col justify-center space-y-7 sm:space-y-8">
            <div className="inline-flex">
              <span className="border-primary/20 bg-primary/5 text-foreground/80 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wider uppercase">
                <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                Civic Insight Platform
              </span>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <h1 className="text-foreground text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                From Ward
                <br />
                <span className="text-primary">to Victory</span>
              </h1>
              <p className="text-muted-foreground max-w-xl text-base leading-relaxed sm:text-lg">
                {heroSupportingCopy}
              </p>
            </div>

            <ul className="space-y-3.5 sm:space-y-4">
              {benefitPoints.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <div className="bg-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                    <HiCheckCircle className="text-primary-foreground h-3 w-3" />
                  </div>
                  <span className="text-foreground text-sm leading-relaxed sm:text-base">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-4">
              {/* Primary CTA - Full width on mobile, auto on desktop */}
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-lg px-8 text-base font-semibold transition-all duration-200 hover:shadow-lg sm:w-auto"
                asChild
              >
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2"
                >
                  Register to Support a Candidate
                  <HiArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              {/* Secondary links */}
              <div className="flex flex-col gap-2.5 text-sm md:flex-row">
                <div className="text-muted-foreground">
                  Already registered?{" "}
                  <Link
                    href="/voter-login"
                    className="text-foreground decoration-primary/30 hover:decoration-primary font-semibold underline decoration-2 underline-offset-4 transition-colors"
                  >
                    Access your profile
                  </Link>
                </div>
                <span className="text-muted-foreground hidden sm:inline">
                  •
                </span>
                <div className="text-muted-foreground">
                  For candidates:{" "}
                  <Link
                    href={loginHref}
                    className="text-foreground decoration-primary/30 hover:decoration-primary font-semibold underline decoration-2 underline-offset-4 transition-colors"
                  >
                    {loginText}
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-border/50 flex flex-wrap items-center gap-4 border-t pt-6 sm:pt-8">
              {trustIndicators.map((item) => (
                <div
                  key={item}
                  className="text-muted-foreground flex items-center gap-2 text-xs font-medium"
                >
                  <div className="bg-primary h-1 w-1 rounded-full" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Dashboard preview */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Dashboard card */}
              <div className="border-border bg-card overflow-hidden rounded-2xl border">
                {/* Header */}
                <div className="border-border from-muted/50 to-card flex items-center justify-between border-b bg-linear-to-br px-6 py-4">
                  <div>
                    <p className="text-foreground/80 text-xs font-semibold tracking-wider uppercase">
                      Live Metrics
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                      Supporters syncing every hour
                    </p>
                  </div>
                  <span className="border-primary/20 bg-primary/10 text-foreground rounded-full border px-3 py-1 text-xs font-medium">
                    Dashboard
                  </span>
                </div>

                {/* Main content */}
                <div className="from-accent relative bg-linear-to-br via-[#0f2b24] to-[#0b1e1a] p-6">
                  {/* Decorative elements */}
                  <div className="bg-primary absolute top-0 left-0 h-32 w-32 rounded-full opacity-10 blur-2xl" />
                  <div className="bg-primary absolute right-0 bottom-0 h-24 w-24 rounded-full opacity-10 blur-2xl" />

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
                <div className="border-border from-card to-muted/30 space-y-3 border-t bg-linear-to-br px-6 py-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Next ward outreach
                    </span>
                    <span className="text-foreground font-semibold">
                      Jimeta • Ward 08
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Field agents active
                    </span>
                    <span className="text-foreground font-semibold">27</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Household follow-ups
                    </span>
                    <span className="text-foreground font-semibold">
                      312 scheduled
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating accent card */}
              <div className="border-primary/20 bg-card absolute -bottom-6 -left-6 rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <HiArrowUpRight className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium">
                      Growth this week
                    </p>
                    <p className="text-foreground text-lg font-bold">+24%</p>
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
