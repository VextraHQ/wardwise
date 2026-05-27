"use client";

import {
  coreStats,
  impactHighlights,
} from "@/features/public-site/lib/landing-data";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";

type RolloutState = {
  state: string;
  status: "live" | "growing" | "planned";
  stage: string;
  lgas: string[];
  wardView: string[];
  unitView: string;
  coverage: string;
  note: string;
};

type RolloutStatus = RolloutState["status"];

function rolloutStatusClassName(status: RolloutStatus) {
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
                "inline-flex shrink-0 flex-col rounded-2xl border px-4 py-3 text-left transition-colors",
                isActive
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/60 bg-background/80 hover:border-primary/30 hover:bg-muted/30",
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-foreground text-sm font-bold">
                  {item.state}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[8px] font-black tracking-widest uppercase",
                    rolloutStatusClassName(item.status),
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
              className={cn(
                "w-full rounded-2xl border px-4 py-3.5 text-left transition-colors",
                isActive
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/60 bg-background/80 hover:border-primary/30 hover:bg-muted/30",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-foreground text-sm font-bold">
                  {item.state}
                </p>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[8px] font-black tracking-widest uppercase",
                    rolloutStatusClassName(item.status),
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
    lgas: ["Yola North", "Yola South", "Girei"],
    wardView: ["Jambutu Ward", "Ajiya Ward", "Karewa Ward"],
    unitView: "Polling-unit mapping active",
    coverage: "14 LGAs active",
    note: "This shows how WardWise works today in a live state campaign environment.",
  },
  {
    state: "Bauchi",
    status: "growing",
    stage: "Strong next-step expansion",
    lgas: ["Bauchi", "Katagum", "Misau"],
    wardView: [
      "Ward structure ready",
      "Field routes mappable",
      "Polling units align cleanly",
    ],
    unitView: "Ready for state rollout",
    coverage: "Pilot geography staged",
    note: "A state like Bauchi can use the same field structure without changing the model.",
  },
  {
    state: "Yobe",
    status: "planned",
    stage: "Rollout-ready geography",
    lgas: ["Damaturu", "Potiskum", "Geidam"],
    wardView: [
      "Ward structure ready",
      "LGA expansion ready",
      "Polling-unit hierarchy preserved",
    ],
    unitView: "Ready for campaign onboarding",
    coverage: "Expansion lane identified",
    note: "The rollout path stays consistent even when the campaign moves into a new state.",
  },
  {
    state: "Kano",
    status: "planned",
    stage: "High-scale deployment path",
    lgas: ["Nassarawa", "Tarauni", "Fagge"],
    wardView: [
      "Urban ward structure",
      "Field-team routing",
      "Polling-unit ready",
    ],
    unitView: "Designed for dense coverage",
    coverage: "Large-state ready",
    note: "WardWise can scale into larger political markets without becoming messy.",
  },
  {
    state: "Kaduna",
    status: "planned",
    stage: "State-ready growth lane",
    lgas: ["Kaduna North", "Zaria", "Sabon Gari"],
    wardView: [
      "Ward structure ready",
      "LGA segmentation ready",
      "Polling-unit mapping ready",
    ],
    unitView: "Ready for phased rollout",
    coverage: "Expansion lane identified",
    note: "The same operating logic can carry from one campaign state into the next.",
  },
];

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
              className="mb-6"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary border-primary/30 border-l-2 pl-4 text-[10px] font-black tracking-[0.4em] uppercase">
                  Impact
                </span>
                <span className="text-muted-foreground font-mono text-[9px] tracking-widest uppercase">
                  Growth path
                </span>
              </div>
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
              WardWise can start with one live state campaign and still expand
              cleanly into Bauchi, Yobe, Kano, Kaduna, and beyond without
              changing how geo data is structured.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 xl:grid-cols-12 xl:items-start">
          {/* Main Geographic Momentum Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-border/60 bg-card relative rounded-4xl border p-6 sm:p-8 xl:col-span-8 xl:p-10"
          >
            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <h3 className="text-foreground text-sm font-black tracking-widest uppercase">
                  Geo Rollout Path
                </h3>
                <p className="text-muted-foreground mt-1 max-w-md text-[10px] leading-relaxed font-bold">
                  Select a state, then see how the same structure carries from
                  LGA to ward and polling unit.
                </p>
              </div>
              <div className="shrink-0 sm:text-right">
                <span className="text-primary text-xl font-black italic sm:text-2xl">
                  1 Live / 4 Next
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

              <div className="border-border/60 bg-background/70 @container/detail min-w-0 rounded-3xl border p-5 sm:p-6">
                <div className="flex flex-col gap-4 border-b border-dashed pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                      Selected state
                    </p>
                    <h4 className="text-foreground mt-2 text-2xl font-black tracking-tight">
                      {selectedState.state}
                    </h4>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {selectedState.note}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-[9px] font-black tracking-widest uppercase",
                      rolloutStatusClassName(selectedState.status),
                    )}
                  >
                    {selectedState.status}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                  {(
                    [
                      { label: "Coverage", value: selectedState.coverage },
                      { label: "Rollout stage", value: selectedState.stage },
                      {
                        label: "Polling-unit view",
                        value: selectedState.unitView,
                      },
                    ] as const
                  ).map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-muted/30 rounded-2xl border border-transparent p-4"
                    >
                      <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                        {stat.label}
                      </p>
                      <p className="text-foreground mt-2 text-sm leading-snug font-bold text-pretty sm:text-base">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="border-border/60 rounded-2xl border p-5">
                    <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                      LGA path
                    </p>
                    <div className="mt-4 space-y-3">
                      {selectedState.lgas.map((lga) => (
                        <div
                          key={lga}
                          className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-dashed pb-3 last:border-b-0 last:pb-0"
                        >
                          <span className="text-foreground text-sm font-semibold">
                            {selectedState.state}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            / {lga}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-border/60 rounded-2xl border p-5">
                    <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                      Ward structure
                    </p>
                    <div className="mt-4 space-y-3">
                      {selectedState.wardView.map((ward) => (
                        <div
                          key={ward}
                          className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-dashed pb-3 last:border-b-0 last:pb-0"
                        >
                          <span className="text-foreground text-sm font-semibold">
                            {ward}
                          </span>
                          <span className="text-muted-foreground shrink-0 text-xs">
                            / polling-unit ready
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-border/40 mt-8 flex flex-wrap gap-6 border-t pt-8 sm:mt-10 sm:gap-8 sm:pt-10">
              <div className="flex items-center gap-3">
                <div className="bg-primary size-3 rounded-sm" />
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Live today
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-sm border border-orange-500/60 bg-orange-500/40" />
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Next expansion
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted/40 border-border/60 size-3 rounded-sm border" />
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Wider rollout path
                </span>
              </div>
            </div>
          </motion.div>

          {/* Strategic Metrics & Summary Sidebar */}
          <div className="space-y-8 xl:col-span-4">
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-1">
              {coreStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="border-border/80 bg-background hover:bg-muted/5 group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-8 transition-all"
                >
                  <div>
                    <p className="text-muted-foreground mb-1 text-[9px] font-black tracking-widest uppercase">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-3">
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

            {/* Quick Strategic Summary */}
            <div className="border-border/60 bg-muted/20 space-y-4 rounded-3xl border p-6">
              <h4 className="text-foreground border-primary/40 border-l-2 pl-4 text-[10px] font-black tracking-widest uppercase">
                Why this matters
              </h4>
              <div className="space-y-4 pt-2">
                {impactHighlights.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="bg-primary/20 mt-1.5 size-1.5 shrink-0 rounded-full" />
                    <p className="text-muted-foreground text-[13px] leading-relaxed font-medium">
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
