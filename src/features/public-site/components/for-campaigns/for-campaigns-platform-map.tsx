"use client";

import { motion } from "motion/react";
import { HiCheckCircle } from "react-icons/hi";
import { LandingSectionEyebrow } from "@/features/public-site/components/shared/landing-section-eyebrow";
import { platformModules } from "@/features/public-site/lib/for-campaigns-data";

export function ForCampaignsPlatformMap() {
  return (
    <section
      id="platform"
      className="bg-muted/40 border-border/40 relative border-b py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <LandingSectionEyebrow
            label="Platform Map"
            hint="How modules fit"
            align="center"
          />
          <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            WardWise is the platform.{" "}
            <span className="text-primary font-serif italic">
              Collect is the first module.
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-sm leading-7 sm:text-base">
            Each module solves one part of the campaign field-operations
            problem. They run on the same electoral geography so the data stays
            consistent end-to-end.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {platformModules.map((mod, index) => (
            <motion.article
              key={mod.module}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="border-border/60 bg-background relative flex flex-col overflow-hidden border"
            >
              <div className="border-primary absolute top-0 left-0 size-4 border-t border-l" />
              <div className="border-primary absolute top-0 right-0 size-4 border-t border-r" />

              <div className="border-border/60 bg-muted/30 flex items-center justify-between border-b px-5 py-3">
                <span className="text-muted-foreground font-mono text-[10px] font-black tracking-[0.28em] uppercase">
                  0{index + 1} · {mod.module}
                </span>
                <span
                  className={
                    mod.status === "Live"
                      ? "text-primary border-primary/30 bg-primary/10 rounded-sm border px-2 py-0.5 font-mono text-[9px] font-black tracking-widest uppercase"
                      : mod.status === "Active"
                        ? "text-foreground border-border/60 bg-background rounded-sm border px-2 py-0.5 font-mono text-[9px] font-black tracking-widest uppercase"
                        : "text-muted-foreground border-border/60 bg-muted/40 rounded-sm border px-2 py-0.5 font-mono text-[9px] font-black tracking-widest uppercase"
                  }
                >
                  {mod.status}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-5 p-6">
                <h3 className="text-foreground text-lg leading-snug font-bold tracking-tight">
                  {mod.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-6">
                  {mod.description}
                </p>

                <ul className="border-border/40 mt-auto space-y-2.5 border-t pt-5">
                  {mod.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="text-foreground/80 flex items-start gap-2.5 text-sm leading-6"
                    >
                      <HiCheckCircle
                        className="text-primary mt-0.5 size-4 shrink-0"
                        aria-hidden
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
