"use client";

import { platformPillars } from "@/lib/landing-data";
import { motion } from "motion/react";

export function PlatformPillarsSection() {
  return (
    <section
      id="platform-pillars"
      className="border-border/40 text-foreground bg-muted relative overflow-hidden border-b py-16 sm:py-20 lg:py-24"
    >
      <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-6">
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 flex flex-col items-center"
          >
            <div className="flex items-center gap-2">
              <span className="text-primary border-primary/30 border-l-2 pl-4 text-[10px] font-black tracking-[0.4em] uppercase">
                Ecosystem
              </span>
              <span className="text-muted-foreground font-mono text-[9px] tracking-widest uppercase">
                MOD_CORE
              </span>
            </div>
            <div className="bg-primary/20 mt-4 h-px w-12" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.15]"
          >
            An end-to-end <br />
            <span className="text-primary font-serif italic">
              civic intelligence engine.
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-muted-foreground mx-auto mt-8 max-w-2xl text-base leading-relaxed font-medium sm:text-lg">
              WardWise unifies field registration, data validation, and campaign
              activation so candidates and civic leaders can move in sync.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {platformPillars.map((pillar, index) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group border-border/60 bg-card hover:border-primary/50 relative flex flex-col overflow-hidden rounded-4xl border shadow-sm transition-all duration-300 hover:shadow-sm"
            >
              {/* Module Header Area */}
              <div className="border-border/60 bg-muted/30 flex flex-wrap items-start justify-between gap-2.5 border-b px-5 py-4 sm:px-6">
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-primary/40 font-mono text-[10px] font-black tracking-widest uppercase">
                    MOD_CORE_0{index + 1}
                  </span>
                  <div className="bg-primary/20 h-3 w-px" />
                  <span className="text-muted-foreground min-w-0 text-[10px] font-bold tracking-widest uppercase">
                    {pillar.focus}
                  </span>
                </div>
                <div
                  className={`shrink-0 rounded-full border px-2 py-0.5 ${index === 2 ? "border-orange-500/20 bg-orange-500/10" : "border-primary/20 bg-primary/10"}`}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`size-1 animate-pulse rounded-full ${index === 2 ? "bg-orange-500" : "bg-primary"}`}
                    />
                    <span
                      className={`text-[8px] font-bold uppercase ${index === 2 ? "text-orange-600" : "text-primary"}`}
                    >
                      {index === 2 ? "Active" : "Ready"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex flex-1 flex-col p-8">
                <div className="mb-6 flex items-start justify-between">
                  <div className="border-primary/20 text-primary flex size-12 items-center justify-center rounded-2xl border bg-linear-to-br from-white to-slate-50 text-3xl font-black">
                    {index + 1}
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase">
                      System Priority
                    </p>
                    <p className="text-foreground text-xs font-bold">
                      Critical_Path
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-foreground text-2xl font-bold tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                {/* Activation Signal - Dashboard Detail */}
                <div className="mt-auto space-y-6 pt-8">
                  <div className="bg-muted/40 border-border/60 flex min-h-[140px] flex-col justify-between rounded-2xl border p-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-primary/70 text-[9px] font-black tracking-widest uppercase">
                          Activation Signal
                        </span>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1 w-3 rounded-full ${i <= index + 2 ? "bg-primary" : "bg-primary/10"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed font-semibold">
                        {pillar.signal}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 border-border/40 hover:bg-muted/50 flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-colors">
                      <p className="text-muted-foreground mb-1 text-[8px] font-black tracking-[0.2em] uppercase">
                        Efficiency
                      </p>
                      <p
                        className={`text-sm font-black tracking-tight ${index === 2 ? "text-orange-500" : "text-primary"}`}
                      >
                        {pillar.metric.value}
                      </p>
                    </div>
                    <div className="bg-muted/30 border-border/40 hover:bg-muted/50 flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-colors">
                      <p className="text-muted-foreground mb-1 text-[8px] font-black tracking-[0.2em] uppercase">
                        Metric
                      </p>
                      <p className="text-foreground/80 text-[10px] font-black tracking-tight uppercase">
                        {pillar.metric.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Footer Area */}
              <div className="border-border/40 bg-muted/20 flex items-center justify-center border-t py-3">
                <span className="text-muted-foreground/40 font-mono text-[8px] font-bold tracking-widest uppercase">
                  Integrity_Check_OK • Latency_14ms
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
