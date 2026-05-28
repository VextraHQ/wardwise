"use client";

import { LandingSectionEyebrow } from "@/features/public-site/components/shared/landing-section-eyebrow";
import { securityHighlights } from "@/features/public-site/lib/landing-data";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export function SecuritySection() {
  return (
    <section
      id="security"
      className="border-border/40 bg-muted text-foreground relative overflow-hidden border-y py-20 lg:py-28"
    >
      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6">
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <LandingSectionEyebrow
              align="center"
              label="Data & Access"
              hint="Campaign trust"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.15]"
          >
            Serious protection for <br />
            <span className="text-primary font-serif italic">
              supporter and campaign data.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto mt-8 max-w-2xl text-base leading-relaxed font-medium sm:text-lg"
          >
            WardWise keeps field capture organized, access controlled, and
            sensitive supporter records visible only to the people who should
            see them.
          </motion.p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {securityHighlights.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border-border/60 bg-card/90 flex flex-col rounded-sm border p-7 shadow-none transition-colors duration-300"
            >
              <div className="bg-primary/5 text-primary border-primary/20 mb-6 flex size-11 items-center justify-center rounded-sm border">
                <item.icon className="size-5" aria-hidden />
              </div>

              <div className="flex flex-1 flex-col space-y-3">
                <h3 className="text-foreground text-base font-bold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="border-border/40 mt-6 flex items-center gap-2 border-t pt-5">
                <div className="bg-brand-emerald size-1.5 rounded-full" />
                <span className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                  Access controlled
                </span>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="border-border/60 bg-card/40 flex w-full max-w-3xl flex-col items-center gap-5 rounded-sm border px-6 py-5 sm:flex-row sm:justify-between">
            {[
              { label: "Data handling", value: "Secure record flow" },
              { label: "Team access", value: "Role-based visibility" },
              { label: "Privacy controls", value: "Cleaner supporter data" },
            ].map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  "flex flex-col items-center text-center sm:items-start sm:text-left",
                  index > 0 && "border-border/60 sm:border-l sm:pl-8",
                  index > 0 && "border-t pt-5 sm:border-t-0 sm:pt-0",
                )}
              >
                <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                  {item.label}
                </p>
                <p className="text-foreground mt-1 text-xs font-bold">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
