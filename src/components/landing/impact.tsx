"use client";

import { impactHighlights } from "@/lib/landing-data";
import { motion } from "motion/react";

const coreStats = [
  {
    label: "Supporters verified",
    value: "10,284",
    delta: "+12%",
    caption: "Past 30 days",
  },
  {
    label: "Polling units mapped",
    value: "420",
    delta: "+18",
    caption: "State coverage",
  },
];

export function ImpactSection() {
  return (
    <section
      id="impact"
      className="bg-background text-foreground border-border/40 relative overflow-hidden border-b py-16 sm:py-20 lg:py-24"
    >
      {/* <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(70,194,167,0.2),transparent_52%),radial-gradient(circle_at_88%_22%,rgba(18,68,56,0.12),transparent_60%)]"
        aria-hidden={true}
      />
      <div
        className="absolute inset-x-0 top-1/2 h-[120%] -translate-y-1/2 bg-linear-to-b from-[#0f2b24]/5 via-transparent to-[#46C2A7]/10"
        aria-hidden={true}
      /> */}
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
                <span className="text-muted-foreground/30 font-mono text-[9px] tracking-widest uppercase">
                  TRK_GEN_08
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
              National ambition meets <br />
              <span className="text-primary font-serif italic">
                polling-unit reality.
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
              Scaling across all 36 states, WardWise provides campaigns and
              governments with precise, polling-unit level intelligence.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div className="border-border/60 bg-card/90 relative overflow-hidden rounded-2xl border backdrop-blur-xl sm:rounded-3xl">
            <div
              className="bg-primary/15 absolute top-1/2 -left-32 hidden size-112 -translate-y-1/2 rounded-full mix-blend-screen blur-3xl lg:block"
              aria-hidden={true}
            />
            <div className="relative flex flex-col gap-6 p-6 sm:gap-8 sm:p-8 lg:p-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <p className="text-primary/80 text-xs font-semibold tracking-[0.28em] uppercase">
                    Live movement feed
                  </p>
                  <p className="text-foreground mt-2 text-2xl font-semibold sm:text-3xl lg:text-4xl">
                    Real-world adoption across Nigeria
                  </p>
                </div>
                <div className="border-primary/20 bg-primary/10 text-primary relative flex w-fit items-center gap-3 rounded-full border px-4 py-2 text-[11px] font-semibold tracking-[0.28em] uppercase">
                  Syncing
                  <span
                    className="bg-primary inline-flex size-1.5 animate-pulse rounded-full"
                    aria-hidden={true}
                  />
                </div>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                {coreStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="text-foreground/80 relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:rounded-2xl sm:p-6"
                  >
                    <dt className="text-primary/70 text-xs font-semibold tracking-[0.26em] uppercase">
                      {stat.label}
                    </dt>
                    <dd className="text-foreground mt-2 flex items-baseline gap-2 text-2xl font-semibold sm:mt-3 sm:gap-3 sm:text-3xl">
                      {stat.value}
                      <span
                        className="text-primary text-xs font-medium sm:text-sm"
                        aria-label={`${stat.delta} change in ${stat.label}`}
                      >
                        {stat.delta}
                      </span>
                    </dd>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {stat.caption}
                    </p>
                    <div
                      className="from-primary/20 via-primary/50 to-primary mt-3 h-1 rounded-full bg-linear-to-r sm:mt-4"
                      aria-hidden={true}
                    />
                  </div>
                ))}
              </dl>

              <div className="text-foreground/80 grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur sm:grid-cols-2 sm:gap-4 sm:rounded-2xl sm:p-6">
                <div className="space-y-2">
                  <p className="text-primary/70 text-xs font-semibold tracking-[0.26em] uppercase">
                    Coverage heartbeats
                  </p>
                  <p className="text-muted-foreground">
                    From Adamawa to Lagos, WardWise launches are coordinated
                    with field teams and partner organizations.
                  </p>
                </div>
                <div className="text-primary/80 flex flex-col flex-wrap gap-2 text-xs font-semibold tracking-[0.26em] uppercase sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
                  <span className="border-primary/30 bg-primary/10 text-primary inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1 whitespace-nowrap">
                    17
                    <span className="text-[10px] font-medium">
                      Wards pending
                    </span>
                  </span>
                  <span className="border-primary/30 bg-primary/10 text-primary inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1 whitespace-nowrap">
                    86%
                    <span className="text-[10px] font-medium">Coverage</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {impactHighlights.map((item) => (
              <article
                key={item.title}
                className="group border-border/60 bg-card/80 hover:border-primary/50 relative flex flex-col gap-3 rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:gap-4 sm:rounded-3xl sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="border-primary/30 bg-primary/12 text-accent flex size-10 items-center justify-center rounded-2xl border">
                    <item.icon className="size-5" aria-hidden={true} />
                  </div>
                  <h3 className="text-foreground text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
                <span className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-[0.26em] uppercase">
                  Impact signal
                  <span
                    className="bg-primary size-1.5 animate-pulse rounded-full"
                    aria-hidden={true}
                  />
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
