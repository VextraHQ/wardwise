"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { HiArrowRight } from "react-icons/hi";
import Image from "next/image";

const features = [
  {
    id: "geo",
    tag: "GEOSPATIAL",
    title: "Granular Ward Mapping",
    description:
      "Our proprietary mapping engine structures data exactly as the election is conducted—down to the specific polling unit level.",
    visual: (
      <div className="bg-muted/20 relative h-full w-full overflow-hidden">
        {/* Technical Coordinate System */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#0A645A 1px, transparent 1px), linear-gradient(to right, #0A645A 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <svg
          className="absolute inset-0 h-full w-full p-8"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connection Path */}
          <motion.path
            d="M60 220 Q 180 240, 200 150 T 340 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/30"
            strokeDasharray="4 6"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Nodes */}
          {[
            { x: 60, y: 220, label: "PU_001" },
            { x: 200, y: 150, label: "WARD_X" },
            { x: 340, y: 80, label: "ZONE_A" },
          ].map((node, i) => (
            <g key={i}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="4"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.6 + i * 0.2,
                }}
                className="fill-primary shadow-sm"
              />
              <motion.text
                x={node.x + 12}
                y={node.y + 4}
                initial={{ opacity: 0, x: -5 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.2 }}
                className="fill-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase"
              >
                {node.label}
              </motion.text>
            </g>
          ))}
        </svg>
      </div>
    ),
  },
  {
    id: "sync",
    tag: "OPERATIONAL",
    title: "Field Synchronization",
    description:
      "Proprietary low-latency sync protocols allow canvassers to register supporters in offline wards and auto-sync upon reconnection.",
    visual: (
      <div className="bg-muted/10 relative flex h-full w-full flex-col justify-center px-12">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-muted-foreground font-mono text-[9px] tracking-[0.2em]">
            NODE_SYNC_BASE
          </span>
          <div className="flex items-center gap-1.5">
            <div className="bg-brand-emerald size-1.5 animate-pulse rounded-full" />
            <span className="text-brand-lagoon font-mono text-[9px] font-bold uppercase">
              Active
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-background border-border relative flex h-10 w-full items-center justify-between overflow-hidden rounded-lg border px-4">
            <motion.div
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="via-primary/20 absolute top-0 left-0 h-full w-24 bg-linear-to-r from-transparent to-transparent"
            />
            <div className="relative z-10 flex gap-1.5">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-primary/20 h-3 w-1 rounded-sm"
                  animate={{
                    backgroundColor: [
                      "rgba(10,100,90,0.1)",
                      "rgba(10,100,90,0.4)",
                      "rgba(10,100,90,0.1)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <HiArrowRight className="text-muted-foreground/40 size-3" />
            <div className="flex gap-1.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-border h-3 w-1 rounded-sm" />
              ))}
            </div>
          </div>
          <div className="text-muted-foreground flex items-center justify-between font-mono text-[8px] tracking-widest">
            <span>PKT_SIZE: 128KB</span>
            <span>LATENCY: 12MS</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sec",
    tag: "GOVERNANCE",
    title: "Role-Based Integrity",
    description:
      "Every constituent record is cryptographically signed and auditable, with restricted access for canvassers, analysts, and candidates.",
    visual: (
      <div className="bg-muted/20 relative flex h-full w-full flex-col justify-center gap-6 p-10 lg:p-14">
        {[
          {
            role: "MANAGER",
            color: "bg-primary",
            percentage: 100,
            access: "RW_CORE",
          },
          {
            role: "CANDIDATE",
            color: "bg-brand-emerald",
            percentage: 75,
            access: "R_ANALYTICS",
          },
          {
            role: "CANVASSER",
            color: "bg-orange-500",
            percentage: 40,
            access: "W_FIELD",
          },
        ].map((item, i) => (
          <div key={i} className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn("size-2 shrink-0 rounded-full", item.color)}
                />
                <span className="text-foreground text-[10px] leading-none font-bold tracking-widest">
                  {item.role}
                </span>
              </div>
              <span className="text-muted-foreground font-mono text-[8px] tracking-tighter opacity-60">
                {item.access}
              </span>
            </div>
            <div className="bg-background border-border/80 h-2 w-full overflow-hidden rounded-full border">
              <motion.div
                initial={{ width: "0%" }}
                whileInView={{ width: `${item.percentage}%` }}
                transition={{
                  duration: 1.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.4 + i * 0.1,
                }}
                className={cn("h-full", item.color)}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-background border-border/40 relative border-b py-16 sm:py-20 lg:py-24"
    >
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header - Technical & Compact */}
        <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-8 flex items-center gap-2"
            >
              <span className="text-primary border-primary/30 border-l-2 pl-4 text-[10px] font-black tracking-[0.4em] uppercase">
                Infrastructure
              </span>
              <span className="text-muted-foreground font-mono text-[9px] tracking-widest uppercase">
                SYS_ARCH
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.15]"
            >
              Precision tools for a <br />
              <span className="text-primary font-serif italic">
                data-driven campaign.
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
              WardWise mirrors the physical reality of the Nigerian electoral
              process, providing high-fidelity data structures for every
              stakeholder in the movement.
            </p>
          </motion.div>
        </div>

        {/* Feature Matrix - Advanced Grid */}
        <div className="bg-border border-border mx-auto grid max-w-7xl gap-px overflow-hidden rounded-[3rem] border shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 1 }}
              className="bg-background group relative flex min-h-[400px] flex-col lg:grid lg:grid-cols-2 lg:items-center"
            >
              {/* Text Module */}
              <div className="order-last p-10 sm:p-16 lg:order-0">
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-muted-foreground/40 font-mono text-[9px] font-bold tracking-widest uppercase">
                    SYS_MODULE_0{index + 1}
                  </span>
                  <div className="bg-border h-px w-4" />
                </div>

                <h3 className="text-foreground group-hover:text-primary mb-6 text-3xl font-bold tracking-tight transition-colors duration-500">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground mb-10 max-w-md text-base leading-relaxed">
                  {feature.description}
                </p>

                <button className="text-primary group/btn flex items-center gap-2 text-[10px] font-black tracking-widest uppercase">
                  <span>Explore Protocol</span>
                  <HiArrowRight className="size-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover/btn:translate-x-0 group-hover/btn:opacity-100" />
                </button>

                <div className="mt-12 flex items-center gap-3">
                  <div className="bg-border group-hover:bg-primary h-px w-8 transition-all duration-500 group-hover:w-12" />
                  <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                    {feature.tag}
                  </span>
                </div>
              </div>

              {/* Visual Module */}
              <div className="border-border group-hover:bg-muted/5 h-[320px] border-b transition-colors duration-700 lg:h-full lg:border-b-0 lg:border-l">
                {feature.visual}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Audit Validation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="border-border/40 mt-24 flex flex-col items-center justify-between gap-12 border-t pt-20 lg:flex-row"
        >
          <div className="flex-1">
            <h4 className="text-foreground mb-4 text-xl font-bold tracking-tight">
              Integrity-First Architecture
            </h4>
            <p className="text-muted-foreground max-w-lg text-base leading-relaxed">
              Unlike generic field tools, WardWise is architected to handle the
              complexity of large-scale field operations with absolute data
              transparency.
            </p>
          </div>

          <div className="bg-muted/30 border-border flex w-full flex-col items-center gap-6 rounded-3xl border p-8 sm:w-auto sm:flex-row sm:gap-8 sm:px-10 sm:py-6">
            <div className="flex shrink-0 -space-x-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="border-background bg-muted size-10 overflow-hidden rounded-full border-4"
                >
                  <Image
                    src={`https://i.pravatar.cc/100?u=${i + 60}`}
                    alt="System Auditor"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover opacity-60 grayscale transition-all duration-500 hover:grayscale-0"
                  />
                </div>
              ))}
            </div>
            <div className="border-border flex flex-col items-center border-t pt-6 text-center sm:block sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8 sm:text-left">
              <p className="text-foreground mb-2 text-[11px] font-black tracking-[0.2em] whitespace-nowrap uppercase sm:mb-1 sm:text-[10px] sm:tracking-[0.3em]">
                Audit Log Active
              </p>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <div className="bg-primary size-1.5 shrink-0 rounded-full" />
                <p className="text-muted-foreground max-w-[200px] text-xs font-medium tracking-wide sm:max-w-none sm:text-[10px]">
                  Validation Layer synced across all 36 States
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
