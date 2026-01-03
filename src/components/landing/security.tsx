"use client";

import { securityHighlights } from "@/lib/landing-data";
import { motion } from "motion/react";

export function SecuritySection() {
  return (
    <section
      id="security"
      className="border-border/40 text-foreground relative overflow-hidden border-b bg-slate-50/40 py-16 sm:py-20 lg:py-24"
    >
      {/* <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_84%_82%,rgba(70,194,167,0.14),transparent_55%),radial-gradient(circle_at_14%_88%,rgba(18,68,56,0.1),transparent_65%)]"
        aria-hidden={true}
      /> */}
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6">
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 flex flex-col items-center"
          >
            <div className="flex items-center gap-3">
              <span className="text-primary border-primary/30 border-l-2 pl-4 text-[10px] font-black tracking-[0.4em] uppercase">
                Protocols
              </span>
              <span className="text-muted-foreground/30 font-mono text-[9px] tracking-widest uppercase">
                ENC_V1.0
              </span>
            </div>
            <div className="bg-primary/20 mt-4 h-px w-12" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.15]"
          >
            Privacy-first architecture <br />
            <span className="text-primary font-serif italic">
              tailored for Nigeria.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto mt-8 max-w-2xl text-base leading-relaxed font-medium sm:text-lg"
          >
            WardWise protects supporter data with bank-grade encryption,
            hosting, and role-based access built specifically for large-scale
            field operations.
          </motion.p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {securityHighlights.map((item) => (
            <article
              key={item.title}
              className="border-border bg-card/70 hover:border-primary/50 hover:bg-card relative flex h-full flex-col gap-4 rounded-3xl border p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="border-primary/30 bg-primary/12 text-accent flex size-10 items-center justify-center rounded-full border">
                <item.icon className="size-5" aria-hidden={true} />
              </div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
