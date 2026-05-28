"use client";

import {
  coreStats,
  impactHighlights,
} from "@/features/public-site/lib/landing-data";
import { LandingSectionEyebrow } from "@/features/public-site/components/shared/landing-section-eyebrow";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";

type RolloutState = {
  state: string;
  status: "live" | "growing" | "planned";
  stage: string;
  paths: { lga: string; ward: string; unit: string }[];
  coverage: string;
  note: string;
};

function rolloutStatusClass(status: RolloutState["status"]) {
  if (status === "live") return "bg-primary/10 text-primary";
  if (status === "growing") return "bg-orange-500/10 text-orange-600";
  return "bg-muted text-muted-foreground";
}

function RolloutStatePicker({
  states,
  selectedState,
  onSelect,
}: {
  states: RolloutState[];
  selectedState: RolloutState;
  onSelect: (state: RolloutState) => void;
}) {
  const pickerButtonClass = (isActive: boolean) =>
    cn(
      "w-full rounded-sm border border-border/60 text-left transition-colors px-4 py-3.5",
      isActive
        ? "border-primary/40 bg-primary/5"
        : "bg-background/80 hover:border-primary/30 hover:bg-muted/30",
    );

  return (
    <>
      <div
        role="tablist"
        aria-label="Rollout states"
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {states.map((item) => {
          const isActive = item.state === selectedState.state;
          return (
            <button
              key={item.state}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(item)}
              className={cn(
                pickerButtonClass(isActive),
                "inline-flex w-auto shrink-0",
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-foreground text-sm font-bold">
                  {item.state}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[8px] font-black tracking-widest uppercase",
                    rolloutStatusClass(item.status),
                  )}
                >
                  {item.status}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="hidden space-y-2 lg:block">
        {states.map((item) => {
          const isActive = item.state === selectedState.state;
          return (
            <button
              key={item.state}
              type="button"
              onClick={() => onSelect(item)}
              className={pickerButtonClass(isActive)}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-foreground text-sm font-bold">
                  {item.state}
                </p>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[8px] font-black tracking-widest uppercase",
                    rolloutStatusClass(item.status),
                  )}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-[11px] leading-relaxed">
                {item.stage}
              </p>
            </button>
          );
        })}
      </div>
    </>
  );
}

const rolloutStates: RolloutState[] = [
  {
    state: "Adamawa",
    status: "live",
    stage: "Live campaign proof point",
    paths: [
      {
        lga: "Yola North",
        ward: "Jambutu Ward",
        unit: "Polling units mapped",
      },
      {
        lga: "Yola South",
        ward: "Ajiya Ward",
        unit: "Follow-up routes active",
      },
      {
        lga: "Girei",
        ward: "Karewa Ward",
        unit: "Daily field sync complete",
      },
    ],
    coverage: "14 LGAs active",
    note: "This is how WardWise works today in a live state campaign — one structure from state down to polling unit.",
  },
  {
    state: "Bauchi",
    status: "growing",
    stage: "Strong next-step expansion",
    paths: [
      {
        lga: "Bauchi",
        ward: "Ward structure ready",
        unit: "PU hierarchy staged",
      },
      {
        lga: "Katagum",
        ward: "Field routes mappable",
        unit: "Rollout lane open",
      },
      {
        lga: "Misau",
        ward: "LGA segmentation ready",
        unit: "Campaign onboarding ready",
      },
    ],
    coverage: "Pilot geography staged",
    note: "A state like Bauchi keeps the same field structure without changing how campaigns read the map.",
  },
  {
    state: "Yobe",
    status: "planned",
    stage: "Rollout-ready geography",
    paths: [
      {
        lga: "Damaturu",
        ward: "Ward structure ready",
        unit: "PU hierarchy preserved",
      },
      {
        lga: "Potiskum",
        ward: "LGA expansion ready",
        unit: "Field teams onboardable",
      },
      {
        lga: "Geidam",
        ward: "Coverage lanes mapped",
        unit: "State rollout queued",
      },
    ],
    coverage: "Expansion lane identified",
    note: "The rollout path stays consistent when a campaign moves into a new state.",
  },
  {
    state: "Kano",
    status: "planned",
    stage: "High-scale deployment path",
    paths: [
      {
        lga: "Nassarawa",
        ward: "Urban ward structure",
        unit: "Dense PU coverage",
      },
      { lga: "Tarauni", ward: "Field-team routing", unit: "High-volume ready" },
      {
        lga: "Fagge",
        ward: "Ward segmentation ready",
        unit: "Large-state ready",
      },
    ],
    coverage: "Large-state ready",
    note: "WardWise can scale into larger markets without turning geo data into a messy list.",
  },
  {
    state: "Kaduna",
    status: "planned",
    stage: "State-ready growth lane",
    paths: [
      {
        lga: "Kaduna North",
        ward: "Ward structure ready",
        unit: "PU mapping ready",
      },
      {
        lga: "Zaria",
        ward: "LGA segmentation ready",
        unit: "Phased rollout ready",
      },
      {
        lga: "Sabon Gari",
        ward: "Field lanes mapped",
        unit: "Expansion lane open",
      },
    ],
    coverage: "Expansion lane identified",
    note: "The same operating logic carries from one campaign state into the next.",
  },
];

function GeoRolloutPath({ paths }: { paths: RolloutState["paths"] }) {
  return (
    <div className="space-y-3">
      {paths.map((path) => (
        <div
          key={`${path.lga}-${path.ward}`}
          className="bg-muted/30 space-y-2 rounded-sm border border-transparent p-4"
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
            <span className="text-foreground font-bold">{path.lga}</span>
            <span className="text-muted-foreground/60" aria-hidden>
              /
            </span>
            <span className="text-foreground font-semibold">{path.ward}</span>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            <span className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
              Polling unit ·{" "}
            </span>
            {path.unit}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ImpactSection() {
  const [selectedState, setSelectedState] = useState<RolloutState>(
    rolloutStates[0],
  );

  return (
    <section
      id="impact"
      className="bg-background text-foreground border-border/40 relative overflow-hidden border-b py-16 sm:py-20 lg:py-24"
    >
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <LandingSectionEyebrow
                align="left"
                label="Impact"
                hint="Growth path"
              />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.15]"
            >
              Built around where <br />
              <span className="text-primary font-serif italic">
                support is actually won.
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5"
          >
            <p className="text-muted-foreground border-border border-l pl-6 text-sm leading-relaxed font-medium sm:text-base">
              Start with one live state campaign, then expand into Bauchi, Yobe,
              Kano, Kaduna, and beyond — without changing how geo data is
              structured.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 xl:grid-cols-12 xl:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-border/60 bg-card relative rounded-sm border p-6 shadow-none sm:p-8 xl:col-span-8 xl:p-10"
          >
            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <h3 className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                  Geo rollout path
                </h3>
                <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
                  Pick a state, then follow the same hierarchy from LGA to ward
                  to polling unit.
                </p>
              </div>
              <div className="shrink-0 sm:text-right">
                <span className="text-primary text-xl font-black sm:text-2xl">
                  1 live · 4 next
                </span>
                <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                  Rollout ladder
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(11rem,13.5rem)_minmax(0,1fr)] lg:items-start lg:gap-6">
              <RolloutStatePicker
                states={rolloutStates}
                selectedState={selectedState}
                onSelect={setSelectedState}
              />

              <div className="border-border/60 bg-background/80 min-w-0 rounded-sm border p-5 sm:p-6">
                <div className="border-border/60 flex flex-col gap-4 border-b border-dashed pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                      Selected state
                    </p>
                    <h4 className="text-foreground mt-2 text-2xl font-black tracking-tight">
                      {selectedState.state}
                    </h4>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {selectedState.note}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-[8px] font-black tracking-widest uppercase",
                      rolloutStatusClass(selectedState.status),
                    )}
                  >
                    {selectedState.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="bg-muted/30 rounded-sm border border-transparent p-4">
                    <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                      Coverage
                    </p>
                    <p className="text-foreground mt-2 text-sm font-bold">
                      {selectedState.coverage}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-sm border border-transparent p-4">
                    <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                      Rollout stage
                    </p>
                    <p className="text-foreground mt-2 text-sm font-bold">
                      {selectedState.stage}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                    State → LGA → ward → PU
                  </p>
                  <div className="mt-4">
                    <GeoRolloutPath paths={selectedState.paths} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-border/40 mt-8 flex flex-wrap gap-6 border-t pt-8 sm:mt-10 sm:gap-8 sm:pt-10">
              <div className="flex items-center gap-3">
                <div className="bg-primary size-3 rounded-sm" />
                <span className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                  Live today
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-sm border border-orange-500/60 bg-orange-500/40" />
                <span className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                  Next expansion
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted/40 border-border/60 size-3 rounded-sm border" />
                <span className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                  Wider rollout path
                </span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6 xl:col-span-4">
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
              {coreStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="border-border/60 bg-card/90 flex flex-col justify-between rounded-sm border p-6 shadow-none transition-colors duration-300"
                >
                  <div>
                    <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                      {stat.label}
                    </p>
                    <div className="mt-2 flex items-baseline gap-3">
                      <h4 className="text-foreground text-4xl font-black tracking-tighter">
                        {stat.value}
                      </h4>
                      <span className="text-sm font-black text-orange-500">
                        {stat.delta}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-muted-foreground text-[10px] font-medium">
                      {stat.caption}
                    </p>
                    <div className="bg-primary/20 h-1 w-16 overflow-hidden rounded-full">
                      <div className="bg-primary h-full w-[70%]" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="border-border/40 bg-muted/20 space-y-4 rounded-sm border p-6">
              <h4 className="text-primary border-primary/40 border-l-2 pl-4 text-[10px] font-black tracking-[0.4em] uppercase">
                Why this matters
              </h4>
              <div className="space-y-4">
                {impactHighlights.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="bg-primary/20 mt-1.5 size-1.5 shrink-0 rounded-full" />
                    <p className="text-muted-foreground text-[13px] leading-relaxed">
                      <span className="text-foreground font-bold">
                        {item.title}:
                      </span>{" "}
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
