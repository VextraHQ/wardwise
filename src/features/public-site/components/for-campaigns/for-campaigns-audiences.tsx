"use client";

import { motion } from "motion/react";
import { HiSparkles } from "react-icons/hi";
import { LandingSectionEyebrow } from "@/features/public-site/components/shared/landing-section-eyebrow";
import { audiences } from "@/features/public-site/lib/for-campaigns-data";

export function ForCampaignsAudiences() {
  return (
    <section className="bg-background border-border/40 relative border-b py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
          <div className="space-y-5">
            <LandingSectionEyebrow
              label="Built for"
              hint="Campaign roles"
              align="left"
            />
            <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
              Different people on the same campaign.{" "}
              <span className="text-primary font-serif italic">
                One shared picture.
              </span>
            </h2>
            <p className="text-muted-foreground max-w-md text-sm leading-7 sm:text-base">
              WardWise is designed so candidates, managers, and field teams each
              get the view they need without anyone working from a different
              copy of the truth.
            </p>

            <div className="border-primary/20 bg-primary/5 mt-6 inline-flex items-center gap-2.5 rounded-sm border px-3 py-2">
              <HiSparkles className="text-primary size-4" aria-hidden />
              <span className="text-foreground text-xs font-bold tracking-wide">
                Same data. Different jobs. Same map.
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {audiences.map((audience, index) => {
              const Icon = audience.icon;
              return (
                <motion.div
                  key={audience.role}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-border/60 bg-muted/30 hover:border-primary/30 hover:bg-muted/40 group flex gap-5 border p-5 transition-colors sm:p-6"
                >
                  <div className="bg-background text-primary border-border/60 flex size-12 shrink-0 items-center justify-center rounded-sm border">
                    <Icon className="size-5" aria-hidden />
                  </div>

                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-muted-foreground font-mono text-[10px] font-black tracking-[0.24em] uppercase">
                        For {audience.role}
                      </span>
                    </div>
                    <h3 className="text-foreground text-base leading-snug font-bold tracking-tight sm:text-lg">
                      {audience.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-6">
                      {audience.description}
                    </p>
                    <ul className="flex flex-wrap gap-1.5 pt-1">
                      {audience.outcomes.map((outcome) => (
                        <li
                          key={outcome}
                          className="border-border/60 bg-background text-foreground/80 rounded-sm border px-2.5 py-1 text-[11px] font-medium"
                        >
                          {outcome}
                        </li>
                      ))}
                    </ul>
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
