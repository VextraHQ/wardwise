"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HiArrowRight } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { heroStats } from "@/features/public-site/lib/for-campaigns-data";

export function ForCampaignsHero() {
  return (
    <section className="bg-background border-border/40 relative overflow-hidden border-b py-12 sm:py-16 lg:py-24">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-7 text-center"
        >
          <div className="flex justify-center">
            <div className="border-primary/30 flex items-center gap-2.5 border-l-2 pl-4">
              <span className="text-primary text-[10px] font-black tracking-[0.4em] uppercase">
                For Campaigns
              </span>
              <span
                className="text-muted-foreground/35 text-[10px] font-bold"
                aria-hidden
              >
                ·
              </span>
              <span className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                Product Overview
              </span>
            </div>
          </div>

          <h1 className="text-foreground mx-auto max-w-4xl text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            A campaign field-operations platform built around the{" "}
            <span className="text-primary font-serif italic">
              geography you actually run.
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed sm:text-lg">
            WardWise gives your campaign one clear system for capturing
            supporters from the field, organizing them by LGA, ward, and polling
            unit, and turning that activity into a reporting view your team can
            actually use.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row sm:gap-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 min-w-[200px] rounded-sm px-8 text-sm font-black tracking-wide"
              asChild
            >
              <Link href="/contact" className="flex items-center gap-2">
                Request a Demo
                <HiArrowRight className="size-4" />
              </Link>
            </Button>
            <Link
              href="#platform"
              className="text-muted-foreground hover:text-foreground font-mono text-[10px] font-black tracking-widest uppercase transition-colors"
            >
              See how it fits together
            </Link>
          </div>
        </motion.div>

        <div className="border-border/40 mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3 border-t pt-8 sm:grid-cols-3 sm:gap-6">
          {heroStats.map((item) => (
            <div key={item.label} className="text-center sm:text-left">
              <p className="text-muted-foreground font-mono text-[9px] font-black tracking-[0.28em] uppercase">
                {item.label}
              </p>
              <p className="text-foreground mt-1 text-sm font-bold tracking-tight">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
