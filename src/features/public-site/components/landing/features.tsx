"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LandingSectionEyebrow } from "@/features/public-site/components/shared/landing-section-eyebrow";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { HiArrowRight } from "react-icons/hi";

const fieldTeamAvatars = [
  {
    src: "/images/avatars/agent-1.png",
    alt: "Field agent Adewale",
    initials: "AO",
  },
  {
    src: "/images/avatars/agent-2.png",
    alt: "Field agent Ngozi",
    initials: "NE",
  },
  {
    src: "/images/avatars/agent-3.png",
    alt: "Field agent Chukwudi",
    initials: "CB",
  },
  {
    src: "/images/avatars/agent-4.png",
    alt: "Field agent Amina",
    initials: "AM",
  },
] as const;

const features = [
  {
    id: "geo",
    tag: "Electoral map",
    title: "Real Electoral Geography",
    description:
      "WardWise organizes supporter data the same way campaigns work on the ground: state, LGA, ward, and polling unit.",
    visual: (
      <div className="bg-muted/20 relative h-full w-full overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#0A645A 1px, transparent 1px), linear-gradient(to right, #0A645A 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
          aria-hidden
        />

        <svg
          className="absolute inset-0 h-full w-full p-8"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
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

          {[
            { x: 60, y: 220, label: "Polling unit" },
            { x: 200, y: 150, label: "Jambutu" },
            { x: 340, y: 80, label: "Yola North" },
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
                className="fill-primary"
              />
              <motion.text
                x={node.x + 12}
                y={node.y + 4}
                initial={{ opacity: 0, x: -5 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.2 }}
                className="fill-muted-foreground text-[9px] font-bold tracking-wide uppercase"
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
    tag: "Field sync",
    title: "Low-Signal Field Sync",
    description:
      "Field teams can keep capturing supporters on mobile and sync their work once network signal returns.",
    visual: (
      <div className="bg-muted/10 relative flex h-full w-full flex-col justify-center px-12">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
            Field sync
          </span>
          <div className="flex items-center gap-1.5">
            <div className="bg-brand-emerald size-1.5 animate-pulse rounded-full" />
            <span className="text-brand-lagoon text-[9px] font-bold uppercase">
              Active
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-background border-border relative flex h-10 w-full items-center justify-between overflow-hidden rounded-sm border px-4">
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
          <div className="text-muted-foreground flex items-center justify-between text-[9px] font-bold tracking-wide uppercase">
            <span>Offline safe</span>
            <span>Sync ready</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sec",
    tag: "Access control",
    title: "Trusted Team Access",
    description:
      "Canvassers, managers, and candidates each get the level of access they need while campaign records stay controlled.",
    visual: (
      <div className="bg-muted/20 relative flex h-full w-full flex-col justify-center gap-6 p-10 lg:p-14">
        {[
          { role: "Admin", color: "bg-primary", percentage: 100 },
          { role: "Candidate", color: "bg-brand-emerald", percentage: 75 },
          { role: "Canvasser", color: "bg-orange-500", percentage: 40 },
        ].map((item, i) => (
          <div key={i} className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn("size-2 shrink-0 rounded-full", item.color)}
                />
                <span className="text-foreground text-[10px] font-bold tracking-wide">
                  {item.role}
                </span>
              </div>
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
      className="bg-background text-foreground border-border/40 relative overflow-hidden border-b py-16 sm:py-20 lg:py-24"
    >
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <LandingSectionEyebrow
                align="left"
                label="Built for campaigns"
                hint="Field-ready design"
              />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.15]"
            >
              Built for the way <br />
              <span className="text-primary font-serif italic">
                campaigns actually work.
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
              WardWise is more than a form. It gives campaigns structured
              supporter capture, low-friction field sync, and reporting
              organized by real electoral geography.
            </p>
          </motion.div>
        </div>

        <div className="border-border/60 bg-border relative grid gap-px overflow-hidden rounded-sm border shadow-none">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-background group relative flex min-h-[380px] flex-col lg:grid lg:grid-cols-2 lg:items-center"
            >
              <div className="order-last p-8 sm:p-12 lg:order-0">
                <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                  Capability {index + 1}
                </p>

                <h3 className="text-foreground group-hover:text-primary mt-4 mb-4 text-2xl font-bold tracking-tight transition-colors duration-500 sm:text-3xl">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground mb-8 max-w-md text-base leading-relaxed">
                  {feature.description}
                </p>

                <div className="flex items-center gap-3">
                  <div className="bg-border group-hover:bg-primary h-px w-8 transition-all duration-500 group-hover:w-12" />
                  <span className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                    {feature.tag}
                  </span>
                </div>
              </div>

              <div className="border-border/60 group-hover:bg-muted/5 h-[280px] border-b transition-colors duration-700 lg:h-full lg:border-b-0 lg:border-l">
                {feature.visual}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="border-border/40 mt-16 flex flex-col items-start justify-between gap-10 border-t pt-14 lg:flex-row lg:items-center"
        >
          <div className="max-w-xl">
            <h4 className="text-foreground mb-3 text-xl font-bold tracking-tight">
              Campaign-ready controls
            </h4>
            <p className="text-muted-foreground text-base leading-relaxed">
              Unlike generic field tools, WardWise keeps field work readable and
              auditable so campaigns can trust what they are seeing without
              turning operations into spreadsheet cleanup.
            </p>
          </div>

          <div className="border-border/40 bg-muted/20 flex w-full flex-col items-center gap-6 rounded-sm border p-6 sm:w-auto sm:flex-row sm:gap-8">
            <div className="flex shrink-0 -space-x-3">
              {fieldTeamAvatars.map((agent) => (
                <Avatar
                  key={agent.src}
                  className="border-background size-10 border-2"
                >
                  <AvatarImage src={agent.src} alt={agent.alt} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">
                    {agent.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="border-border flex flex-col items-center border-t pt-5 text-center sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6 sm:text-left">
              <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                Audit trail
              </p>
              <p className="text-muted-foreground mt-1 max-w-[220px] text-xs leading-relaxed sm:max-w-none">
                Sensitive changes stay traceable across every active workspace.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
