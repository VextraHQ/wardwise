"use client";

import { HiCheckCircle } from "react-icons/hi";
import { LandingSectionEyebrow } from "@/features/public-site/components/shared/landing-section-eyebrow";
import { beforeAfter } from "@/features/public-site/lib/for-campaigns-data";

export function ForCampaignsComparison() {
  return (
    <section className="bg-muted/40 border-border/40 relative border-b py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <LandingSectionEyebrow
            label="What changes"
            hint="Before & after"
            align="center"
          />
          <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
            What a campaign looks like{" "}
            <span className="text-primary font-serif italic">
              with WardWise
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-sm leading-7">
            The shift is operational, not aesthetic. The campaign keeps working
            in the field, the records, the structure, and the visibility get
            better.
          </p>
        </div>

        <div className="border-border/60 bg-background mt-12 overflow-hidden border">
          <div className="border-border/60 grid border-b sm:grid-cols-2">
            <div className="border-border/60 bg-muted/30 px-5 py-3 sm:border-r sm:px-6">
              <span className="text-muted-foreground font-mono text-[10px] font-black tracking-[0.28em] uppercase">
                Without WardWise
              </span>
            </div>
            <div className="border-border/60 border-t px-5 py-3 sm:border-t-0 sm:px-6">
              <span className="text-primary font-mono text-[10px] font-black tracking-[0.28em] uppercase">
                With WardWise
              </span>
            </div>
          </div>

          <ul className="divide-border/40 divide-y">
            {beforeAfter.map((row, index) => (
              <li key={row.before} className="grid sm:grid-cols-2">
                <div className="border-border/40 bg-muted/10 flex items-start gap-3 px-5 py-5 sm:border-r sm:px-6">
                  <span className="text-muted-foreground/60 font-mono text-[10px] font-black tracking-widest">
                    0{index + 1}
                  </span>
                  <p className="text-foreground/80 text-sm leading-6">
                    {row.before}
                  </p>
                </div>
                <div className="border-border/40 flex items-start gap-3 border-t px-5 py-5 sm:border-t-0 sm:px-6">
                  <HiCheckCircle
                    className="text-primary mt-0.5 size-4 shrink-0"
                    aria-hidden
                  />
                  <p className="text-foreground text-sm leading-6 font-semibold">
                    {row.after}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
