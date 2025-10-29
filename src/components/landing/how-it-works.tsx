"use client";

import { motion } from "motion/react";

import { processSteps } from "@/lib/landing-data";

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="from-background via-muted to-background relative overflow-hidden bg-gradient-to-b py-24"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(70,194,167,0.15),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(15,43,36,0.12),transparent_55%)]"
        aria-hidden="true"
      />
      <div className="text-foreground mx-auto flex max-w-7xl flex-col gap-12 px-6">
        <div className="max-w-2xl">
          <p className="text-accent text-xs font-semibold tracking-[0.3em] uppercase">
            How it works
          </p>
          <h2 className="text-foreground mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Nigeria&apos;s electoral structure, distilled into three decisive
            steps.
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            WardWise synchronises citizen input with Nigeria&apos;s electoral
            geography so campaign teams see exactly who supports them, what they
            care about, and where to focus ground operations.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {processSteps.map((step, index) => (
            <motion.article
              key={step.number}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="group border-border bg-card/90 hover:border-primary/60 relative flex flex-col gap-5 overflow-hidden rounded-3xl border p-8 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5"
            >
              <div className="from-primary/8 to-accent/8 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
              <div className="relative flex items-center gap-4">
                <div className="border-primary/30 bg-primary/12 text-accent flex size-12 items-center justify-center rounded-2xl border shadow-inner">
                  <step.icon className="size-6" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                  <span className="text-accent text-xs font-semibold tracking-[0.28em] uppercase">
                    Step {step.number}
                  </span>
                  <h3 className="text-foreground text-lg font-semibold tracking-tight">
                    {step.name}
                  </h3>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
