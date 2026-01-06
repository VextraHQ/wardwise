"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { HiArrowRight } from "react-icons/hi";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { heroSupportingCopy } from "@/lib/landing-data";
import { HiArrowUpRight } from "react-icons/hi2";
import { cn } from "@/lib/utils";

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
    <section className="bg-background border-border/40 relative overflow-hidden border-b py-8 sm:py-10 lg:py-16">
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

          {/* Right: The High-Fidelity Campaign Command Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative lg:block"
          >
            <div className="relative mx-auto w-full max-w-xl">
              {/* The Command Dashboard Hub - "Silver Glass" Aesthetic */}
              <div className="relative overflow-hidden border border-slate-200/60 bg-slate-50/80 shadow-[0_48px_96px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                {/* Minimal Architectural Frame */}
                <div className="border-primary absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2" />
                <div className="border-primary absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2" />

                {/* Header: Project Context */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white/40 px-6 py-3.5">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                        State Command Hub
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500">
                        Node: Adamawa Central • Northern Geo-Zone
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-600">
                      LIVE
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-50">
                  {/* Section 1: Progress Overview */}
                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                          Verification Progress
                        </p>
                        <p className="text-4xl font-black tracking-tighter text-slate-900">
                          84.2%
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <HiArrowUpRight className="text-emerald-500" />
                          <span className="text-sm font-black text-emerald-600">
                            +12% this week
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Target: Oct 2024
                        </p>
                      </div>
                    </div>
                    {/* Premium Progress Bar */}
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/50 p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "84.2%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="from-primary to-primary/80 relative h-full rounded-full bg-linear-to-r"
                      >
                        <div className="absolute inset-0 animate-pulse bg-white/10" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Section 2: Ward Coverage Grid & Meta */}
                  <div className="grid grid-cols-12">
                    <div className="col-span-12 border-b border-slate-100 p-5 md:col-span-7 md:border-r md:border-b-0">
                      <p className="mb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        Field Coverage Index
                      </p>
                      {/* Detailed Coverage Matrix */}
                      <div className="grid grid-cols-7 gap-1.5">
                        {[...Array(28)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-5 rounded-sm border transition-all duration-300",
                              i < 20
                                ? "bg-primary/10 border-primary/20"
                                : i < 24
                                  ? "animate-pulse border-orange-500/20 bg-orange-500/10"
                                  : "border-slate-100 bg-slate-50",
                            )}
                          />
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                        <span>LGA Core</span>
                        <span>Ward Boundary</span>
                      </div>
                    </div>
                    <div className="col-span-12 flex flex-col justify-center space-y-3 bg-white/40 p-5 md:col-span-5">
                      {[
                        {
                          label: "Polling Units",
                          val: "420",
                          subtitle: "Fully Mapped",
                        },
                        {
                          label: "Verified Voters",
                          val: "10,244",
                          subtitle: "Valid ID Check",
                        },
                      ].map((stat, i) => (
                        <div key={i} className="space-y-0.5">
                          <p className="text-[9px] font-black text-slate-400 uppercase">
                            {stat.label}
                          </p>
                          <p className="text-2xl font-black tracking-tighter text-slate-900">
                            {stat.val}
                          </p>
                          <p className="text-[9px] font-bold text-emerald-600">
                            {stat.subtitle}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Live Field Activity Feed */}
                  <div className="p-5">
                    <p className="mb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Latest Field Activity
                    </p>
                    <div className="space-y-3">
                      {[
                        {
                          ward: "Ward 04",
                          act: "+42 Voters Verified",
                          time: "2m ago",
                          status: "success",
                        },
                        {
                          ward: "Ward 12",
                          act: "Daily Goal Reached",
                          time: "15m ago",
                          status: "alert",
                        },
                        {
                          ward: "Ward 08",
                          act: "Sync Complete",
                          time: "24m ago",
                          status: "success",
                        },
                      ].map((log, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between border-b border-slate-50 py-1.5 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "size-2 rounded-full",
                                log.status === "success"
                                  ? "bg-emerald-500"
                                  : "bg-orange-500",
                              )}
                            />
                            <span className="text-xs font-black text-slate-800">
                              {log.ward}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              {log.act}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {log.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer: User Context */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-white/40 px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="size-8 rounded-full border-2 border-white bg-slate-200"
                        />
                      ))}
                    </div>
                    <p className="text-[11px] font-bold text-slate-600">
                      Active Field Agents:{" "}
                      <span className="text-primary font-black">128</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-primary size-1.5 rounded-full" />
                    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                      Sys_Nominal
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative Support Elements */}
              <div className="absolute -top-8 -left-8 -z-10 h-32 w-32 rounded-full border border-slate-100 opacity-60" />
              <div className="absolute -right-12 -bottom-12 -z-10 h-48 w-48 rounded-full border border-slate-100 opacity-60" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
