"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { HiArrowRight } from "react-icons/hi";
import { HiArrowUpRight } from "react-icons/hi2";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { heroSupportingCopy } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

const benefitPoints = [
  "Monitor campaign metrics with ward-level precision",
  "Candidates drive strategy with real-time field data",
  "Every canvasser interaction tracked to your dashboard",
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
        : "Candidate Login";

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
                    href="/contact"
                    className="flex items-center justify-center gap-3"
                  >
                    Request a Demo
                    <HiArrowRight className="size-5" />
                  </Link>
                </Button>

                {status === "loading" ? (
                  <div className="border-border bg-muted/10 flex h-13 w-full min-w-[200px] cursor-wait items-center justify-center gap-3 rounded-xl border px-6 transition-all duration-300 sm:w-auto">
                    <div className="flex flex-col items-start leading-none opacity-50">
                      <span className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[8px] font-black tracking-widest uppercase">
                        <div className="bg-primary/70 size-1.5 animate-pulse rounded-full" />
                        System Check
                      </span>
                      <span className="text-foreground text-sm font-bold">
                        Authenticating...
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={loginHref}
                    className="group border-border bg-muted/30 hover:bg-muted/50 flex h-13 items-center justify-center gap-3 rounded-xl border px-6 transition-all duration-300"
                  >
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-muted-foreground mb-1 text-[8px] font-black tracking-widest uppercase">
                        Existing System?
                      </span>
                      <span className="text-foreground text-sm font-bold">
                        {loginText}
                      </span>
                    </div>
                    <HiArrowRight className="text-muted-foreground group-hover:text-primary size-4 transition-colors" />
                  </Link>
                )}
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
              <div className="border-border/60 bg-card relative overflow-hidden border shadow-[0_48px_96px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                {/* Minimal Architectural Frame */}
                <div className="border-primary absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2" />
                <div className="border-primary absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2" />

                {/* Header: Project Context */}
                <div className="border-border/40 bg-muted/30 flex items-center justify-between border-b px-6 py-3.5">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-foreground text-sm font-black tracking-tight uppercase">
                        State Command Hub
                      </h3>
                      <p className="text-muted-foreground text-[10px] font-bold">
                        Node: Adamawa Central • Northern Geo-Zone
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="bg-brand-emerald size-1.5 animate-pulse rounded-full" />
                    <span className="text-muted-foreground text-[10px] font-bold">
                      LIVE
                    </span>
                  </div>
                </div>

                <div className="divide-border/20 divide-y">
                  {/* Section 1: Progress Overview */}
                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-muted-foreground/70 text-[10px] font-black tracking-widest uppercase">
                          Registration Progress
                        </p>
                        <p className="text-foreground text-4xl font-black tracking-tighter">
                          84.2%
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <HiArrowUpRight className="text-brand-emerald" />
                          <span className="text-brand-lagoon text-sm font-black">
                            +12% this week
                          </span>
                        </div>
                        <p className="text-muted-foreground/70 text-[10px] font-bold uppercase">
                          Target: Oct 2027
                        </p>
                      </div>
                    </div>
                    {/* Premium Progress Bar */}
                    <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full p-0.5">
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
                    <div className="border-border/40 col-span-12 border-b p-5 md:col-span-7 md:border-r md:border-b-0">
                      <p className="text-muted-foreground/70 mb-2 text-[10px] font-black tracking-widest uppercase">
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
                                  : "border-border/40 bg-muted/30",
                            )}
                          />
                        ))}
                      </div>
                      <div className="text-muted-foreground/70 mt-4 flex items-center justify-between text-[9px] font-bold uppercase">
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
                          label: "Registered Voters",
                          val: "10,244",
                          subtitle: "Unique Records",
                        },
                      ].map((stat, i) => (
                        <div key={i} className="space-y-0.5">
                          <p className="text-muted-foreground/70 text-[9px] font-black uppercase">
                            {stat.label}
                          </p>
                          <p className="text-foreground text-2xl font-black tracking-tighter">
                            {stat.val}
                          </p>
                          <p className="text-brand-lagoon text-[9px] font-bold">
                            {stat.subtitle}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Live Field Activity Feed */}
                  <div className="p-5">
                    <p className="text-muted-foreground/70 mb-2 text-[10px] font-black tracking-widest uppercase">
                      Latest Field Activity
                    </p>
                    <div className="space-y-3">
                      {[
                        {
                          ward: "Ward 04",
                          act: "+42 Records Synced",
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
                          className="border-border/20 flex items-center justify-between border-b py-1.5 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "size-2 rounded-full",
                                log.status === "success"
                                  ? "bg-brand-emerald"
                                  : "bg-orange-500",
                              )}
                            />
                            <span className="text-foreground text-xs font-black">
                              {log.ward}
                            </span>
                            <span className="text-muted-foreground text-xs font-medium">
                              {log.act}
                            </span>
                          </div>
                          <span className="text-muted-foreground/70 text-[10px] font-bold uppercase">
                            {log.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer: User Context */}
                <div className="border-border/40 bg-muted/30 flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:px-6">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="flex -space-x-2">
                      {[
                        {
                          src: "/images/avatars/agent-1.png",
                          alt: "Field Agent Adewale",
                          initials: "AO",
                        },
                        {
                          src: "/images/avatars/agent-2.png",
                          alt: "Field Agent Ngozi",
                          initials: "NE",
                        },
                        {
                          src: "/images/avatars/agent-3.png",
                          alt: "Field Agent Chukwudi",
                          initials: "CB",
                        },
                        {
                          src: "/images/avatars/agent-4.png",
                          alt: "Field Agent Amina",
                          initials: "AM",
                        },
                      ].map((agent, i) => (
                        <Avatar
                          key={i}
                          className="border-background size-8 border-2 shadow-sm"
                        >
                          <AvatarImage src={agent.src} alt={agent.alt} />
                          <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">
                            {agent.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {/* Additional agents indicator */}
                      <Avatar className="border-background size-8 border-2 shadow-sm">
                        <AvatarFallback className="bg-primary text-[9px] font-bold text-white">
                          99+
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="text-muted-foreground text-[11px] font-bold whitespace-nowrap">
                      <span className="hidden sm:inline">Active Field </span>
                      Agents:{" "}
                      <span className="text-primary font-black">128</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="bg-primary size-1.5 rounded-full" />
                    <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                      Sys_Nominal
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-border/40 absolute -top-8 -left-8 -z-10 h-32 w-32 rounded-full border opacity-60" />
              <div className="border-border/40 absolute -right-12 -bottom-12 -z-10 h-48 w-48 rounded-full border opacity-60" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
