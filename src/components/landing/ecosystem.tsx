"use client";

import { motion } from "framer-motion";
import { ecosystemRoles } from "@/lib/landing-data";
import { HiCheck } from "react-icons/hi";
import { cn } from "@/lib/utils";

const roleColorMap = {
  teal: {
    border: "group-hover:border-primary/50",
    bg: "bg-primary/5",
    icon: "text-primary",
    tag: "text-primary/70",
    check: "bg-primary/20 text-primary",
  },
  orange: {
    border: "group-hover:border-orange-500/50",
    bg: "bg-orange-500/5",
    icon: "text-orange-600",
    tag: "text-orange-600/70",
    check: "bg-orange-500/20 text-orange-600",
  },
  emerald: {
    border: "group-hover:border-emerald-500/50",
    bg: "bg-emerald-500/5",
    icon: "text-emerald-600",
    tag: "text-emerald-600/70",
    check: "bg-emerald-500/20 text-emerald-600",
  },
};

export function EcosystemSection() {
  return (
    <section
      id="ecosystem"
      className="border-border/40 bg-background relative border-b py-24 lg:py-32"
    >
      <div className="container mx-auto px-6">
        <div className="mb-20 space-y-4 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary text-[11px] font-black tracking-[0.3em] uppercase"
          >
            Connected Infrastructure
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
          >
            One Platform. Three Pillars.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto max-w-2xl text-lg"
          >
            WardWise unifies citizen voices, field verification, and data-driven
            leadership into a single, cohesive movement.
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {ecosystemRoles.map((role, index) => {
            const colors =
              roleColorMap[role.color as keyof typeof roleColorMap] ||
              roleColorMap.teal;
            return (
              <motion.div
                key={role.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div
                  className={cn(
                    "border-border/60 bg-card relative flex h-full flex-col space-y-8 rounded-4xl border p-10 transition-all duration-500",
                    colors.border,
                    "hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)]",
                  )}
                >
                  <div className="space-y-6">
                    <div
                      className={cn(
                        "flex size-16 items-center justify-center rounded-2xl shadow-sm transition-transform duration-500 group-hover:scale-110",
                        colors.bg,
                        colors.icon,
                      )}
                    >
                      <role.icon className="size-9" />
                    </div>

                    <div className="space-y-1.5">
                      <p
                        className={cn(
                          "text-[11px] font-black tracking-widest uppercase",
                          colors.tag,
                        )}
                      >
                        {role.role}
                      </p>
                      <h3 className="text-foreground text-2xl font-bold tracking-tight">
                        {role.title}
                      </h3>
                    </div>

                    <p className="text-muted-foreground text-[15px] leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  <ul className="border-border/40 grow space-y-4 border-t pt-8">
                    {role.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-foreground/80 flex items-center gap-4 text-[14px] font-semibold"
                      >
                        <div
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-lg",
                            colors.check,
                          )}
                        >
                          <HiCheck className="size-3.5" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {role.role === "Canvassers" && (
                  <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2">
                    <span className="ring-background inline-flex items-center rounded-full bg-orange-600 px-4 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-lg ring-4 shadow-orange-500/30">
                      Primary Sync
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
