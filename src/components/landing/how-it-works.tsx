"use client";

import { motion } from "motion/react";
import { processSteps } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

const stepRoleInfo = {
  "01": {
    actor: "Voters",
    theme: "primary",
    accent: "bg-primary",
    textClass: "text-primary",
  },
  "02": {
    actor: "Canvassers",
    theme: "orange",
    accent: "bg-orange-500",
    textClass: "text-orange-600",
  },
  "03": {
    actor: "Candidates",
    theme: "emerald",
    accent: "bg-emerald-500",
    textClass: "text-emerald-600",
  },
};

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-border/40 bg-muted relative border-y py-20 lg:py-28"
    >
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="relative mx-auto mb-16 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 flex flex-col items-center"
          >
            <div className="flex items-center gap-2">
              <span className="border-primary text-primary border-l-2 pl-4 font-mono text-[9px] font-black tracking-[0.4em] uppercase">
                Methodology
              </span>
              <span className="text-muted-foreground/30 font-mono text-[8px] tracking-widest uppercase">
                PROC_FLOW_V1.4
              </span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.1]"
          >
            A systematic path <br />
            <span className="text-primary font-serif font-normal italic">
              to political victory.
            </span>
          </motion.h2>
        </div>

        {/* Horizontal Protocol Pipeline */}
        <div className="border-border/60 bg-background relative border">
          {/* Technical Hardware Corners */}
          <div className="border-primary absolute -top-px -left-px size-3 border-t-2 border-l-2" />
          <div className="border-primary absolute -top-px -right-px size-3 border-t-2 border-r-2" />
          <div className="border-primary absolute -bottom-px -left-px size-3 border-b-2 border-l-2" />
          <div className="border-primary absolute -right-px -bottom-px size-3 border-r-2 border-b-2" />

          <div className="divide-border/60 grid grid-cols-1 divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {processSteps.map((step, index) => {
              const info =
                stepRoleInfo[step.number as keyof typeof stepRoleInfo];

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative flex flex-col p-8 sm:p-12"
                >
                  {/* Subtle Phase ID Overlay */}
                  <div className="text-muted-foreground/10 absolute top-6 right-6 font-mono text-[9px] font-black tracking-widest uppercase">
                    SEG_{step.number}
                  </div>

                  <div className="mb-10 flex flex-col items-start gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "font-mono text-[10px] font-black italic",
                          info.textClass,
                        )}
                      >
                        PHASE
                      </span>
                      <span
                        className={cn(
                          "text-3xl font-black tracking-tighter italic sm:text-4xl",
                          info.textClass,
                        )}
                      >
                        {step.number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn("size-1.5 rounded-full", info.accent)}
                      />
                      <span className="text-muted-foreground font-mono text-[10px] font-black tracking-widest uppercase">
                        Role: {info.actor}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-foreground text-xl font-bold tracking-tight">
                        {step.name}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Operational Output Tooltip */}
                    <div className="bg-muted/30 border-border/40 border-t pt-6">
                      <p className="text-muted-foreground mb-3 font-mono text-[8px] font-black tracking-[0.2em] uppercase">
                        Operational Result:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {index === 0 && (
                          <>
                            <span className="border-primary/20 bg-primary/5 text-primary rounded-sm border px-2 py-0.5 text-[9px] font-black tracking-wider uppercase">
                              Verified Profile
                            </span>
                            <span className="border-primary/20 bg-primary/5 text-primary rounded-sm border px-2 py-0.5 text-[9px] font-black tracking-wider uppercase">
                              Sentiment Map
                            </span>
                          </>
                        )}
                        {index === 1 && (
                          <>
                            <span className="rounded-sm border border-orange-500/20 bg-orange-500/5 px-2 py-0.5 text-[9px] font-black tracking-wider text-orange-600 uppercase">
                              Ward Audit
                            </span>
                            <span className="rounded-sm border border-orange-500/20 bg-orange-500/5 px-2 py-0.5 text-[9px] font-black tracking-wider text-orange-600 uppercase">
                              Field Sync
                            </span>
                          </>
                        )}
                        {index === 2 && (
                          <>
                            <span className="rounded-sm border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[9px] font-black tracking-wider text-emerald-600 uppercase">
                              Resource Ops
                            </span>
                            <span className="rounded-sm border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[9px] font-black tracking-wider text-emerald-600 uppercase">
                              Victory Model
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
