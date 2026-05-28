"use client";

import Link from "next/link";
import { HiArrowRight, HiLocationMarker } from "react-icons/hi";
import { Button } from "@/components/ui/button";

export function ForCampaignsCta() {
  return (
    <section className="bg-background relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="border-border/60 bg-muted/30 relative overflow-hidden border px-6 py-12 sm:px-10 sm:py-16">
          <div className="border-primary absolute -top-px -left-px size-3 border-t-2 border-l-2" />
          <div className="border-primary absolute -top-px -right-px size-3 border-t-2 border-r-2" />
          <div className="border-primary absolute -bottom-px -left-px size-3 border-b-2 border-l-2" />
          <div className="border-primary absolute -right-px -bottom-px size-3 border-r-2 border-b-2" />

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
            <div className="space-y-4">
              <span className="text-primary font-mono text-[10px] font-black tracking-[0.32em] uppercase">
                Next Step
              </span>
              <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
                See how WardWise fits{" "}
                <span className="text-primary font-serif italic">
                  your race.
                </span>
              </h2>
              <p className="text-muted-foreground text-sm leading-7 sm:text-base">
                Request a walkthrough with the WardWise team. We'll show
                Collect on a real campaign view and talk through how reporting
                connects to it.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-sm text-sm font-black tracking-wide"
                asChild
              >
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2"
                >
                  Request a Demo
                  <HiArrowRight className="size-4" />
                </Link>
              </Button>
              <Link
                href="/support"
                className="border-border bg-background hover:border-primary/40 hover:text-primary flex h-12 items-center justify-center gap-2 rounded-sm border px-5 font-mono text-[10px] font-black tracking-widest uppercase transition-colors"
              >
                <HiLocationMarker className="size-4" aria-hidden />
                Read FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
