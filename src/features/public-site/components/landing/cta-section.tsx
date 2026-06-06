"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { HiArrowRight } from "react-icons/hi";
import { Button } from "@/components/ui/button";

export function CallToActionSection() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && session?.user;
  const accessHref =
    isAuthenticated && session.user.role === "candidate"
      ? "/dashboard"
      : isAuthenticated && session.user.role === "admin"
        ? "/admin"
        : "/admin";

  const accessText =
    isAuthenticated && session.user.role === "candidate"
      ? "Control Panel"
      : isAuthenticated && session.user.role === "admin"
        ? "Field Portal"
        : "Workspace Login";

  return (
    <section className="border-border/40 bg-muted relative overflow-hidden border-t py-24 lg:py-40">
      {/* Structural Anchor Line */}
      <div
        className="bg-border/40 absolute top-0 left-1/2 hidden h-full w-px -translate-x-1/2 lg:block"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="border-border/60 bg-background relative border px-8 py-16 sm:px-12 sm:py-24 lg:px-20">
          {/* Corner Precision Markers */}
          <div className="border-primary absolute -top-px -left-px size-3 border-t-2 border-l-2" />
          <div className="border-primary absolute -top-px -right-px size-3 border-t-2 border-r-2" />
          <div className="border-primary absolute -bottom-px -left-px size-3 border-b-2 border-l-2" />
          <div className="border-primary absolute -right-px -bottom-px size-3 border-r-2 border-b-2" />

          <div className="flex flex-col items-center text-center">
            <div className="mb-10 flex items-center gap-6">
              <span className="text-primary font-mono text-[9px] font-black tracking-[0.4em] uppercase">
                Book a walkthrough
              </span>
              <div className="bg-border/60 h-px w-8" />
              <span className="text-muted-foreground font-mono text-[9px] font-black tracking-[0.4em] uppercase">
                Campaign-ready
              </span>
            </div>

            <div className="max-w-4xl space-y-8">
              <h2 className="text-foreground text-4xl leading-[1.1] font-extrabold tracking-tighter sm:text-6xl lg:text-7xl">
                Ready to see WardWise on a <br />
                <span className="text-primary font-serif font-normal italic">
                  real campaign?
                </span>
              </h2>

              <p className="text-muted-foreground mx-auto max-w-xl text-base leading-relaxed font-medium sm:text-lg">
                We can show you how WardWise Collect captures supporters,
                organizes them by ward and polling unit, and turns field
                activity into reporting your team can actually use.
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

                {status === "loading" ? (
                  <div className="border-foreground/5 text-foreground/50 flex cursor-wait items-center gap-2 border-b-2 pb-1 font-mono text-[10px] font-black tracking-widest uppercase transition-all">
                    <div className="border-primary size-2.5 animate-spin rounded-full border-[1.5px] border-t-transparent" />
                    Validating...
                  </div>
                ) : (
                  <Link
                    href={accessHref}
                    className="border-foreground/10 text-foreground hover:border-primary/40 hover:text-primary border-b-2 pb-1 font-mono text-[10px] font-black tracking-widest uppercase transition-all"
                  >
                    {accessText}
                  </Link>
                )}
              </div>
            </div>

            <div className="border-border/40 mt-20 w-full max-w-4xl border-t pt-10">
              <div className="flex flex-col items-center justify-between gap-8 text-left sm:flex-row">
                <div className="flex flex-col items-center sm:items-start">
                  <p className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase">
                    Mobile capture
                  </p>
                  <p className="text-foreground text-[10px] font-bold uppercase">
                    Built for field teams
                  </p>
                </div>
                <div className="bg-border hidden h-6 w-px sm:block" />
                <div className="flex flex-col items-center sm:items-start">
                  <p className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase">
                    Electoral structure
                  </p>
                  <p className="text-foreground text-[10px] font-bold uppercase">
                    LGA, ward, and polling unit
                  </p>
                </div>
                <div className="bg-border hidden h-6 w-px sm:block" />
                <div className="flex flex-col items-center sm:items-start">
                  <p className="text-muted-foreground font-mono text-[8px] font-black tracking-widest uppercase">
                    Reporting view
                  </p>
                  <p className="text-foreground text-[10px] font-bold uppercase">
                    Clearer campaign decisions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
