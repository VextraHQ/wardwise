import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CallToActionSection() {
  return (
    <section className="bg-muted relative overflow-hidden py-24">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(70,194,167,0.2),transparent_60%),radial-gradient(circle_at_bottom,_rgba(18,68,56,0.15),transparent_65%)]"
        aria-hidden="true"
      />
      <div className="border-primary/30 from-card via-background to-muted relative mx-auto flex max-w-7xl flex-col items-center gap-10 rounded-[2.5rem] border bg-gradient-to-br px-10 py-20 text-center shadow-[0_20px_48px_rgba(12,39,32,0.12)] backdrop-blur-sm">
        <div className="relative space-y-4">
          <p className="text-accent text-xs font-semibold tracking-[0.36em] uppercase">
            Unite citizens, campaigns, and governance
          </p>
          <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to activate your movement with ward-level accuracy?
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed">
            WardWise helps campaigns, governments, civil groups, and partners
            understand Nigerians at scale. Launch in a single state or
            coordinate nationwide—every supporter interaction stays verified and
            actionable.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            size="lg"
            className="bg-foreground text-background h-14 rounded-full px-8 text-base font-semibold shadow-[0_22px_48px_rgba(15,43,36,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_60px_rgba(15,43,36,0.24)]"
            asChild
          >
            <Link href="/register">Register as Voter</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-border bg-card/70 text-foreground hover:border-primary hover:bg-card h-14 rounded-full px-8 text-base font-semibold shadow-[0_16px_40px_rgba(12,39,32,0.15)] transition duration-300"
            asChild
          >
            <Link href="/login">Candidate Login</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
