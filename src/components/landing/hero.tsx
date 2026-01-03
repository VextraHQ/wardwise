"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { HiArrowRight } from "react-icons/hi";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { heroSupportingCopy } from "@/lib/landing-data";
import { HiArrowUpRight } from "react-icons/hi2";

const benefitPoints = [
  "Supporters share what matters most in their community",
  "Canvassers verify voters with ward-level precision",
  "Candidates drive strategy with real-time field data",
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
    <section className="bg-background border-border relative overflow-hidden border-b py-8 sm:py-10 lg:py-12">
      {/* Subtle blueprint grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
        aria-hidden={true}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          {/* Left: Campaign Strategy */}
          <div className="flex flex-col justify-center space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex"
            >
              <div className="border-primary/40 flex items-center gap-3 border-l-2 pl-4">
                <span className="text-primary text-[10px] font-black tracking-[0.4em] uppercase">
                  Campaign Intelligence
                </span>
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span className="text-muted-foreground/50 font-mono text-[9px] font-bold tracking-widest uppercase">
                  STAGED_SYNC_V1
                </span>
              </div>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-foreground text-5xl leading-[1.1] font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
              >
                From Ward <br />
                <span className="text-primary font-serif italic">
                  to Victory.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground max-w-xl text-base leading-relaxed font-medium sm:text-lg"
              >
                {heroSupportingCopy}
              </motion.p>
            </div>

            {/* Campaign Proof Points */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2.5"
            >
              {benefitPoints.map((point, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-500/10">
                    <div className="size-1.5 rounded-full bg-orange-500" />
                  </div>
                  <span className="text-foreground/80 text-sm font-bold tracking-tight">
                    {point}
                  </span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-5 pt-2"
            >
              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-13 min-w-[200px] rounded-xl px-10 text-base font-black transition-all duration-300"
                  asChild
                >
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-3"
                  >
                    Support a Candidate
                    <HiArrowRight className="size-5" />
                  </Link>
                </Button>

                <Link
                  href="/canvasser"
                  className="group border-border bg-muted/30 hover:bg-muted/50 flex h-13 items-center justify-center gap-3 rounded-xl border px-6 transition-all duration-300"
                >
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-muted-foreground mb-1 text-[8px] font-black tracking-widest uppercase">
                      Personnel Portal
                    </span>
                    <span className="text-foreground text-sm font-bold">
                      Canvasser Access
                    </span>
                  </div>
                  <HiArrowUpRight className="text-muted-foreground group-hover:text-primary size-4 transition-colors" />
                </Link>
              </div>

              {/* Secondary Access Points */}
              <div className="flex flex-col gap-3 text-xs sm:flex-row sm:items-center">
                <div className="bg-muted/50 border-border inline-flex items-center gap-2 rounded-lg border px-3 py-2">
                  <span className="text-muted-foreground font-medium">
                    Already Registered?
                  </span>
                  <Link
                    href="/voter-login"
                    className="text-primary hover:text-primary/80 font-bold transition-colors"
                  >
                    Voter Login
                  </Link>
                </div>
                <div className="bg-muted/50 border-border inline-flex items-center gap-2 rounded-lg border px-3 py-2">
                  <span className="text-muted-foreground font-medium">
                    For Admin & Candidates
                  </span>
                  <Link
                    href={loginHref}
                    className="text-primary hover:text-primary/80 font-bold transition-colors"
                  >
                    {loginText}
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Sub-Header Trust Indicators */}
            <div className="border-border/60 flex flex-wrap items-center gap-8 border-t pt-8">
              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
                  Platform Foundation
                </span>
                <span className="text-foreground text-xs font-bold">
                  WardWise Strategic V1.0
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                {["Encrypted Data", "Real-Time Sync", "Field-Optimized"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="size-1.5 rounded-full bg-orange-500" />
                      <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                        {item}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Metrics Board */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative lg:justify-end"
          >
            <div className="relative mx-auto w-full max-w-md">
              {/* Central Dashboard Card */}
              <div className="border-border bg-card overflow-hidden rounded-4xl border shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
                {/* Board Header */}
                <div className="border-border bg-muted/30 flex items-center justify-between border-b px-6 py-4">
                  <div>
                    <p className="text-foreground/80 text-[10px] font-black tracking-widest uppercase">
                      Live Ward Metrics
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-[9px]">
                      State-Wide Command Centre
                    </p>
                  </div>
                  <div className="border-primary/20 bg-primary/10 flex items-center gap-2 rounded-full border px-3 py-1">
                    <div className="bg-primary size-1.5 animate-pulse rounded-full" />
                    <span className="text-primary text-[9px] font-bold tracking-widest uppercase">
                      Active Data
                    </span>
                  </div>
                </div>

                {/* Primary Stats Area */}
                <div className="from-accent relative bg-linear-to-br via-[#0d2620] to-[#091a16] p-8">
                  <div className="relative space-y-5">
                    <div className="flex items-center justify-between font-mono text-[9px] font-bold tracking-[0.2em] text-white/40 uppercase">
                      <span>Adamawa Overview</span>
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[8px] text-emerald-400">
                        Sync: Jimeta • Ward 08
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          label: "Polling Units Mapped",
                          val: "420",
                          highlight: false,
                        },
                        {
                          label: "Supporters Verified",
                          val: "10,244",
                          highlight: false,
                        },
                        {
                          label: "Active Canvassers",
                          val: "128",
                          highlight: true,
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 backdrop-blur-sm transition-colors hover:bg-white/10"
                        >
                          <span className="text-sm font-medium text-white/60">
                            {item.label}
                          </span>
                          <span
                            className={`text-xl font-black ${item.highlight ? "text-orange-400" : "text-white"}`}
                          >
                            {item.val}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {["State", "LGA", "Ward", "P.U"].map((label) => (
                        <div
                          key={label}
                          className="rounded-lg border border-white/10 bg-white/5 py-1.5 text-center text-[9px] font-bold text-white/50 backdrop-blur-sm"
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Strategy Snapshot Footer */}
                <div className="border-border bg-background grid grid-cols-2 divide-x border-t">
                  <div className="space-y-1 p-5 text-center">
                    <p className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase">
                      Verification
                    </p>
                    <p className="text-foreground text-sm font-black">
                      84% Complete
                    </p>
                  </div>
                  <div className="space-y-1 p-5 text-center">
                    <p
                      className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase"
                      title="Daily Goal"
                    >
                      Outreach
                    </p>
                    <p className="text-sm font-black text-orange-400">
                      312 Scheduled
                    </p>
                  </div>
                </div>
              </div>

              {/* Victory Metric Overlay */}
              <div className="bg-card absolute -bottom-12 -left-12 rounded-2xl border border-orange-500/20 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/10">
                    <HiArrowUpRight className="size-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[8px] font-black tracking-widest uppercase">
                      Field Growth
                    </p>
                    <p className="text-lg font-black tracking-tight text-orange-400">
                      +24%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
