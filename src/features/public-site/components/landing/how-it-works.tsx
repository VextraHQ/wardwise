"use client";

import { motion } from "motion/react";
import { LandingSectionEyebrow } from "@/features/public-site/components/shared/landing-section-eyebrow";
import { processSteps } from "@/features/public-site/lib/landing-data";
import { cn } from "@/lib/utils";

const stepRoleInfo = {
  "01": {
    actor: "Supporters",
    accent: "bg-primary",
    textClass: "text-primary",
    pills: ["Shared form", "Supporter record"],
    pillClass:
      "border-primary/20 bg-primary/5 text-primary border px-2.5 py-1 text-[9px] font-bold tracking-wide uppercase",
  },
  "02": {
    actor: "Field teams",
    accent: "bg-orange-500",
    textClass: "text-orange-600",
    pills: ["Ward tagged", "Field sync"],
    pillClass:
      "border border-orange-500/20 bg-orange-500/5 px-2.5 py-1 text-[9px] font-bold tracking-wide text-orange-600 uppercase",
  },
  "03": {
    actor: "Campaign leads",
    accent: "bg-brand-emerald",
    textClass: "text-brand-lagoon",
    pills: ["Coverage view", "Next moves"],
    pillClass:
      "border-brand-emerald/20 bg-brand-emerald/5 text-brand-lagoon border px-2.5 py-1 text-[9px] font-bold tracking-wide uppercase",
  },
};

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-border/40 bg-muted text-foreground relative overflow-hidden border-y py-20 lg:py-28"
    >
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="relative mx-auto mb-14 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <LandingSectionEyebrow
              align="center"
              label="How It Works"
              hint="Field to campaign action"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.15]"
          >
            How support moves <br />
            <span className="text-primary font-serif italic">
              from the field to campaign action.
            </span>
          </motion.h2>
        </div>

        <div className="border-border/60 bg-card relative grid grid-cols-1 gap-px overflow-hidden rounded-sm border p-px shadow-none">
          <div className="divide-border/60 bg-card grid grid-cols-1 divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {processSteps.map((step, index) => {
              const info =
                stepRoleInfo[step.number as keyof typeof stepRoleInfo];

              return (
                <motion.article
                  key={step.number}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative flex flex-col p-8 sm:p-10"
                >
                  <div className="mb-8 flex flex-col items-start gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-[10px] font-black tracking-widest uppercase",
                          info.textClass,
                        )}
                      >
                        Step {step.number}
                      </span>
                      <span
                        className={cn(
                          "text-3xl font-black tracking-tighter sm:text-4xl",
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
                      <span className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                        {info.actor}
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

                    <div className="border-border/40 border-t pt-6">
                      <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                        You get
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {info.pills.map((pill) => (
                          <span key={pill} className={info.pillClass}>
                            {pill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
