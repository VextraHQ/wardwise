"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { HiArrowRight } from "react-icons/hi";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function CallToActionSection() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && session?.user;
  const loginHref =
    isAuthenticated && session.user.role === "candidate"
      ? "/dashboard"
      : isAuthenticated && session.user.role === "admin"
        ? "/admin"
        : "/login";

  const loginText =
    isAuthenticated && session.user.role === "candidate"
      ? "Control Panel"
      : isAuthenticated && session.user.role === "admin"
        ? "Field Portal"
        : "Candidate Login";

  return (
    <section className="bg-background relative overflow-hidden py-24 lg:py-40">
      {/* Structural Anchor Line */}
      <div
        className="bg-border/40 absolute top-0 left-1/2 hidden h-full w-px -translate-x-1/2 lg:block"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="border-border/60 bg-background relative border px-8 py-16 sm:px-12 sm:py-24 lg:px-20"
        >
          {/* Corner Precision Markers */}
          <div className="border-primary absolute -top-px -left-px size-3 border-t-2 border-l-2" />
          <div className="border-primary absolute -top-px -right-px size-3 border-t-2 border-r-2" />
          <div className="border-primary absolute -bottom-px -left-px size-3 border-b-2 border-l-2" />
          <div className="border-primary absolute -right-px -bottom-px size-3 border-r-2 border-b-2" />

          {/* Metadata Overlay */}
          <div className="text-muted-foreground/30 absolute top-6 left-6 hidden rotate-90 font-mono text-[8px] font-black tracking-widest sm:block">
            DEPLOY_READY_V2.04
          </div>
          <div className="text-muted-foreground/30 absolute right-6 bottom-6 hidden font-mono text-[8px] font-black tracking-widest sm:block">
            NGA_VOTES_SYNC
          </div>

          <div className="flex flex-col items-center text-center">
            {/* Minimalist Legend */}
            <div className="mb-10 flex items-center gap-6">
              <span className="text-primary font-mono text-[9px] font-black tracking-[0.4em] uppercase">
                Phase_04
              </span>
              <div className="bg-border/60 h-px w-8" />
              <span className="text-muted-foreground font-mono text-[9px] font-black tracking-[0.4em] uppercase">
                Vict_Mapping
              </span>
            </div>

            <div className="max-w-4xl space-y-8">
              <h2 className="text-foreground text-4xl leading-[1.1] font-extrabold tracking-tighter sm:text-6xl lg:text-7xl">
                Ready to command your <br />
                <span className="text-primary font-serif font-normal italic">
                  next campaign?
                </span>
              </h2>

              <p className="text-muted-foreground mx-auto max-w-xl text-base leading-relaxed font-medium sm:text-lg">
                Join Nigeria's most trusted digital infrastructure for grassroots campaigns. Request an invite to onboard your team today.
              </p>

              <div className="flex flex-col items-center justify-center gap-6 pt-6 sm:flex-row">
                <Button
                  size="lg"
                  className="group bg-primary text-primary-foreground hover:bg-primary/95 relative h-14 rounded-full px-10 text-xs font-black tracking-widest uppercase transition-all"
                  asChild
                >
                  <Link href="/contact">
                    Request a Demo
                    <HiArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Link
                  href={loginHref}
                  className="border-foreground/10 text-foreground hover:border-primary/40 hover:text-primary border-b-2 pb-1 font-mono text-[10px] font-black tracking-widest uppercase transition-all"
                >
                  {loginText}
                </Link>
              </div>
            </div>

            {/* Architectural Blueprint Footer */}
            <div className="border-border/40 mt-20 w-full max-w-4xl border-t pt-10">
              <div className="flex flex-col items-center justify-between gap-8 text-left sm:flex-row">
                <div className="flex flex-col items-center sm:items-start">
                  <p className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase">
                    Data Sovereignty
                  </p>
                  <p className="text-foreground text-[10px] font-bold uppercase">
                    De-Duplication: Active
                  </p>
                </div>
                <div className="bg-border hidden h-6 w-px sm:block" />
                <div className="flex flex-col items-center sm:items-start">
                  <p className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase">
                    Network status
                  </p>
                  <p className="text-foreground text-[10px] font-bold uppercase">
                    Verified Wards Only
                  </p>
                </div>
                <div className="bg-border hidden h-6 w-px sm:block" />
                <div className="flex flex-col items-center sm:items-start">
                  <p className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase">
                    Compliance
                  </p>
                  <p className="text-foreground text-[10px] font-bold uppercase">
                    Federal Hub Ready
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
