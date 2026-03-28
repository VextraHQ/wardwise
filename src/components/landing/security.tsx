"use client";

import { securityHighlights } from "@/lib/landing-data";
import { motion } from "motion/react";

export function SecuritySection() {
  return (
    <section
      id="security"
      className="border-border/40 text-foreground bg-muted relative overflow-hidden border-b py-16 sm:py-20 lg:py-24"
    >
      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6">
        {/* Centered Header (Restoring Section Rhythm: Centered/Split Alternation) */}
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 flex flex-col items-center"
          >
            <div className="flex items-center gap-3">
              <span className="text-primary border-primary/30 border-l-2 pl-4 text-[10px] font-black tracking-[0.4em] uppercase">
                Privacy Guard
              </span>
              <span className="text-muted-foreground font-mono text-[9px] tracking-widest uppercase">
                SEC_STABLE
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
            Incorruptible protection for <br />
            <span className="text-primary font-serif italic">
              your campaign's inner circle.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto mt-8 max-w-2xl text-base leading-relaxed font-medium sm:text-lg"
          >
            Campaign strategies are won on secrets. WardWise creates a
            "Sovereign Vault" ensuring your field data is visible only to those
            you trust, and invisible to the competition.
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {securityHighlights.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group border-border/80 bg-card/80 hover:border-primary/50 relative flex flex-col overflow-hidden rounded-4xl border p-8 transition-all duration-300"
            >
              {/* Trust Stamp Header */}
              <div className="mb-8 flex items-start justify-between">
                <div className="bg-primary/5 text-primary border-primary/20 flex size-12 items-center justify-center rounded-2xl border shadow-inner">
                  <item.icon className="size-6" aria-hidden={true} />
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase">
                    Guard Level
                  </p>
                  <p className="text-foreground text-[10px] font-black">
                    Military Grade
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col space-y-3">
                <h3 className="text-foreground text-lg font-black tracking-tight uppercase">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-[13px] leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>

              {/* Humanity-First Security Footer */}
              <div className="border-border/40 mt-8 border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-emerald size-1.5 animate-pulse rounded-full shadow-[0_0_8px_rgba(2,201,136,0.5)]" />
                    <span className="text-muted-foreground font-mono text-[8px] font-black tracking-[0.2em] uppercase">
                      Verified Agent
                    </span>
                  </div>
                  <span className="text-muted-foreground/30 font-mono text-[8px] font-black uppercase">
                    VAULT_STABLE
                  </span>
                </div>
              </div>

              {/* Subtle metallic bevel effect on hover */}
              <div className="group-hover:border-primary/10 pointer-events-none absolute inset-0 rounded-4xl border-2 border-transparent transition-colors" />
            </motion.article>
          ))}
        </div>

        {/* Bottom Trust Notation - Translated to Human Policy terms */}
        <div className="mt-6 flex flex-col items-center justify-center gap-4 text-center">
          <div className="border-border/60 bg-card/40 flex flex-col items-center gap-6 rounded-2xl border px-8 py-4 sm:flex-row">
            <div className="flex flex-col items-center sm:items-start sm:px-4">
              <p className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase">
                Privacy Protocol
              </p>
              <p className="text-foreground text-xs font-black">
                STRATEGY_SHIELD
              </p>
            </div>
            <div className="bg-border h-px w-full sm:h-6 sm:w-px" />
            <div className="flex flex-col items-center sm:items-start sm:px-4">
              <p className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase">
                In-Country Hosting
              </p>
              <p className="text-foreground text-xs font-black">
                SOVEREIGN_RESERVE
              </p>
            </div>
            <div className="bg-border h-px w-full sm:h-6 sm:w-px" />
            <div className="flex flex-col items-center sm:items-start sm:px-4">
              <p className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase">
                Field Integrity
              </p>
              <p className="text-foreground text-xs font-black">
                ZERO_FRAUD_PROTOCOL
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
