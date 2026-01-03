"use client";

import { motion } from "motion/react";
import { HiArrowRight } from "react-icons/hi";
import { processSteps } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

const stepRoleInfo = {
  "01": {
    actor: "Voters",
    tagline: "Point of Entry",
    theme: "primary",
    borderClass: "border-primary/20",
    bgClass: "bg-primary/5",
    textClass: "text-primary",
  },
  "02": {
    actor: "Canvassers",
    tagline: "Validation Layer",
    theme: "orange",
    borderClass: "border-orange-500/20",
    bgClass: "bg-orange-500/5",
    textClass: "text-orange-600",
  },
  "03": {
    actor: "Candidates",
    tagline: "Strategic Core",
    theme: "emerald",
    borderClass: "border-emerald-500/20",
    bgClass: "bg-emerald-500/5",
    textClass: "text-emerald-600",
  },
};

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-border/40 relative border-y bg-slate-50/40 py-16 sm:py-20 lg:py-24"
    >
      {/* Subtle Technical Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem",
        }}
        aria-hidden={true}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="relative mx-auto mb-12 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 flex flex-col items-center"
          >
            <div className="flex items-center gap-3">
              <span className="text-primary border-primary/30 border-l-2 pl-4 text-[10px] font-black tracking-[0.4em] uppercase">
                Methodology
              </span>
              <span className="text-muted-foreground/30 font-mono text-[9px] tracking-widest uppercase">
                Protocol_V2
              </span>
            </div>
            <div className="bg-primary/20 mt-4 h-px w-12" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground text-4xl font-extrabold tracking-tight sm:text-6xl lg:leading-[1.1]"
          >
            A systematic path <br />
            <span className="text-primary font-serif italic">
              to political victory.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto mt-10 max-w-2xl text-base leading-relaxed font-medium sm:text-lg"
          >
            Bridging the gap between field-level granular data and high-level
            campaign strategy through a validated, three-layered intelligence
            loop.
          </motion.p>
        </div>

        <div className="mt-20 lg:mt-28">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
            {processSteps.map((step, index) => {
              const info =
                stepRoleInfo[step.number as keyof typeof stepRoleInfo];

              return (
                <div key={step.number} className="relative">
                  {/* Connection Arrows (Desktop) */}
                  {index < processSteps.length - 1 && (
                    <div className="absolute top-1/2 -right-10 hidden -translate-y-1/2 lg:block">
                      <HiArrowRight className="text-border size-8 opacity-40" />
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="flex flex-col space-y-8"
                  >
                    {/* Role Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex size-14 items-center justify-center rounded-xl border-2 shadow-sm transition-all duration-300",
                            info.borderClass,
                            info.bgClass,
                            info.textClass,
                          )}
                        >
                          <step.icon className="size-7" />
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "text-[10px] font-black tracking-tighter uppercase",
                              info.textClass,
                            )}
                          >
                            Role: {info.actor}
                          </span>
                          <span className="text-foreground text-sm font-bold">
                            {info.tagline}
                          </span>
                        </div>
                      </div>
                      <span className="text-border/60 text-5xl font-black italic">
                        {step.number}
                      </span>
                    </div>

                    {/* Content Card */}
                    <div className="border-border/60 bg-card rounded-2xl border p-8 shadow-xs transition-shadow duration-300 hover:shadow-md">
                      <h3 className="text-foreground text-xl font-bold tracking-tight">
                        {step.name}
                      </h3>
                      <p className="text-muted-foreground mt-4 text-[15px] leading-relaxed">
                        {step.description}
                      </p>

                      <div className="border-border/40 mt-8 flex flex-col gap-3 border-t pt-6">
                        <p className="text-foreground text-[11px] font-semibold tracking-wider uppercase">
                          System Output:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {index === 0 && (
                            <>
                              <span className="bg-primary/5 text-primary border-primary/10 rounded-md border px-2 py-1 text-[10px] font-medium">
                                Verified Profiles
                              </span>
                              <span className="bg-primary/5 text-primary border-primary/10 rounded-md border px-2 py-1 text-[10px] font-medium">
                                Sentiment Tags
                              </span>
                            </>
                          )}
                          {index === 1 && (
                            <>
                              <span className="rounded-md border border-orange-500/10 bg-orange-500/5 px-2 py-1 text-[10px] font-medium text-orange-600">
                                Ward-Level Integrity
                              </span>
                              <span className="rounded-md border border-orange-500/10 bg-orange-500/5 px-2 py-1 text-[10px] font-medium text-orange-600">
                                Fraud Detection
                              </span>
                            </>
                          )}
                          {index === 2 && (
                            <>
                              <span className="rounded-md border border-emerald-500/10 bg-emerald-500/5 px-2 py-1 text-[10px] font-medium text-emerald-600">
                                Resource Mapping
                              </span>
                              <span className="rounded-md border border-emerald-500/10 bg-emerald-500/5 px-2 py-1 text-[10px] font-medium text-emerald-600">
                                Victory Modelling
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
