"use client";

import { LandingSectionEyebrow } from "@/features/public-site/components/landing/landing-section-eyebrow";
import { platformPillars } from "@/features/public-site/lib/landing-data";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export function PlatformPillarsSection() {
  return (
    <section
      id="platform-pillars"
      className="border-border/40 bg-muted relative overflow-hidden border-y py-20 lg:py-28"
    >
      <div className="relative mx-auto flex max-w-7xl flex-col gap-14 px-6">
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <LandingSectionEyebrow
              align="center"
              label="Platform"
              hint="How it fits together"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.15]"
          >
            One system from <br />
            <span className="text-primary font-serif italic">
              field capture to campaign action.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto mt-8 max-w-2xl text-base leading-relaxed font-medium sm:text-lg"
          >
            WardWise connects supporter capture, data quality, and reporting so
            campaigns stop guessing and start acting on a shared ground picture.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {platformPillars.map((pillar, index) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border-border/60 bg-card hover:border-primary/40 relative flex flex-col overflow-hidden rounded-3xl border shadow-none transition-colors"
            >
              <div className="border-border/60 bg-muted/30 flex flex-wrap items-start justify-between gap-2.5 border-b px-5 py-4 sm:px-6">
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                    Pillar {index + 1}
                  </span>
                  <div className="bg-border h-3 w-px" />
                  <span className="text-muted-foreground text-[10px] font-bold tracking-wide uppercase">
                    {pillar.focus}
                  </span>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[8px] font-black tracking-widest uppercase",
                    "border",
                    index === 2
                      ? "border-orange-500/20 bg-orange-500/10 text-orange-600"
                      : "border-primary/20 bg-primary/10 text-primary",
                  )}
                >
                  {index === 2 ? "Growing" : "Campaign-ready"}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-7">
                <div className="border-primary/20 text-primary mb-6 flex size-11 items-center justify-center rounded-xl border bg-linear-to-br from-white to-slate-50 text-2xl font-black">
                  {index + 1}
                </div>

                <div className="space-y-3">
                  <h3 className="text-foreground text-xl font-bold tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-auto space-y-5 pt-8">
                  <div className="bg-muted/40 border-border/60 flex min-h-[140px] flex-col justify-between rounded-2xl border p-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-primary/70 text-[9px] font-black tracking-widest uppercase">
                          Activation signal
                        </span>
                        <div className="flex gap-1.5" aria-hidden>
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-1 w-3 rounded-full",
                                i <= index + 2 ? "bg-primary" : "bg-primary/10",
                              )}
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
                    <div className="bg-muted/30 rounded-xl border border-transparent p-4">
                      <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                        Proof
                      </p>
                      <p
                        className={cn(
                          "mt-2 text-sm font-black",
                          index === 2 ? "text-orange-500" : "text-primary",
                        )}
                      >
                        {pillar.metric.value}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-xl border border-transparent p-4">
                      <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                        Signal
                      </p>
                      <p className="text-foreground/80 mt-2 text-[10px] font-bold tracking-wide uppercase">
                        {pillar.metric.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
