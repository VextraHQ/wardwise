"use client";

import { impactHighlights } from "@/lib/landing-data";
import { motion } from "motion/react";

const coreStats = [
  {
    label: "Supporters verified",
    value: "10,284",
    delta: "+12%",
    caption: "Past 30 days",
  },
  {
    label: "Polling units mapped",
    value: "420",
    delta: "+18",
    caption: "State coverage",
  },
];

export function ImpactSection() {
  return (
    <section
      id="impact"
      className="bg-background text-foreground border-border/40 relative overflow-hidden border-b py-16 sm:py-20 lg:py-24"
    >
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary border-primary/30 border-l-2 pl-4 text-[10px] font-black tracking-[0.4em] uppercase">
                  Impact
                </span>
                <span className="text-muted-foreground/30 font-mono text-[9px] tracking-widest uppercase">
                  TRK_GEN_08
                </span>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.15]"
            >
              National ambition meets <br />
              <span className="text-primary font-serif italic">
                polling-unit reality.
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5"
          >
            <p className="text-muted-foreground border-border border-l pl-6 text-sm leading-relaxed font-medium sm:text-base">
              Scaling across all 36 states, WardWise provides campaigns and
              governments with precise, polling-unit level intelligence.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Main Geographic Momentum Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-border/60 bg-card relative overflow-hidden rounded-4xl border p-8 lg:col-span-7 lg:p-12"
          >
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h3 className="text-foreground text-sm font-black tracking-widest uppercase">
                  National Grid
                </h3>
                <p className="text-muted-foreground mt-1 text-[10px] font-bold">
                  State-by-State Activation Status
                </p>
              </div>
              <div className="text-right">
                <span className="text-primary text-2xl font-black italic">
                  12/36
                </span>
                <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                  States Active
                </p>
              </div>
            </div>

            {/* Matrix Visualization */}
            <div className="grid grid-cols-6 gap-3 sm:grid-cols-9 lg:gap-4">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="group relative aspect-square">
                  {/* Status Box */}
                  <div
                    className={`absolute inset-0 rounded-md transition-all duration-300 ${
                      i < 9
                        ? "bg-primary border-primary"
                        : i < 14
                          ? "border border-orange-500/50 bg-orange-500/20"
                          : "bg-muted/40 border-border/50 border"
                    }`}
                  />
                  {/* Active Indicator */}
                  {i === 11 && (
                    <div className="border-card absolute -top-1 -right-1 size-2 animate-pulse rounded-full border bg-orange-500 shadow-sm" />
                  )}
                </div>
              ))}
            </div>

            {/* Matrix Legend */}
            <div className="border-border/40 mt-12 flex flex-wrap gap-8 border-t pt-10">
              <div className="flex items-center gap-3">
                <div className="bg-primary size-3 rounded-sm shadow-[0_0_10px_rgba(70,194,167,0.4)]" />
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Ready Hub
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-sm border border-orange-500/60 bg-orange-500/40" />
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Live Syncing
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted/40 border-border/60 size-3 rounded-sm border" />
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Scheduled
                </span>
              </div>
            </div>
          </motion.div>

          {/* Strategic Metrics & Summary Sidebar */}
          <div className="space-y-8 lg:col-span-5">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {coreStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="border-border/80 bg-background hover:bg-muted/5 group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-8 transition-all"
                >
                  <div>
                    <p className="text-muted-foreground mb-1 text-[9px] font-black tracking-widest uppercase">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-3">
                      <h4 className="text-foreground text-4xl font-black tracking-tighter">
                        {stat.value}
                      </h4>
                      <span className="text-sm font-black text-orange-500">
                        {stat.delta}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-muted-foreground text-[10px] font-medium">
                      {stat.caption}
                    </p>
                    <div className="bg-primary/20 h-1 w-16 overflow-hidden rounded-full">
                      <div className="bg-primary h-full w-[70%]" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Strategic Summary */}
            <div className="border-border/60 bg-muted/20 space-y-4 rounded-3xl border p-6">
              <h4 className="text-foreground border-primary/40 border-l-2 pl-4 text-[10px] font-black tracking-widest uppercase">
                Strategic Summary
              </h4>
              <div className="space-y-4 pt-2">
                {impactHighlights.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="bg-primary/20 mt-1.5 size-1.5 shrink-0 rounded-full" />
                    <p className="text-muted-foreground text-[13px] leading-relaxed font-medium">
                      <span className="text-foreground font-bold">
                        {item.title}:
                      </span>{" "}
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
