import Link from "next/link";

import { Button } from "@/components/ui/button";
import { heroSupportingCopy, trustIndicators } from "@/lib/landing-data";

const benefitPoints = [
  "Your voice reaches your chosen candidate directly",
  "Share what matters most in your community",
  "Organized by your exact polling unit location",
];

export function HeroSection() {
  return (
    <section className="from-background via-muted to-background text-foreground relative overflow-hidden bg-gradient-to-b py-24 lg:py-28">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(70,194,167,0.22),transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(17,60,51,0.12),transparent_55%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 lg:flex-row lg:items-start">
        <div className="w-full max-w-xl space-y-8 lg:max-w-2xl">
          <p className="border-primary/30 bg-card text-accent inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.28em] uppercase">
            Civic insight platform
          </p>
          <div className="space-y-4">
            <h1 className="text-foreground text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              From Ward to Victory
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {heroSupportingCopy}
            </p>
          </div>
          <ul className="text-accent space-y-3 text-sm">
            {benefitPoints.map((benefit) => (
              <li
                key={benefit}
                className="border-border bg-card/95 flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_12px_24px_rgba(15,43,36,0.06)]"
              >
                <span className="bg-primary/15 text-accent mt-1 inline-flex size-5 items-center justify-center rounded-full">
                  ✓
                </span>
                <span className="text-base leading-relaxed">{benefit}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground h-14 rounded-full px-8 text-base font-semibold shadow-[0_18px_36px_rgba(17,60,51,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(17,60,51,0.2)]"
              asChild
            >
              <Link href="/register">Register to Support a Candidate</Link>
            </Button>
            <span className="text-accent text-sm">
              For candidates:{" "}
              <Link
                href="/login"
                className="text-foreground font-semibold underline-offset-4 hover:underline"
              >
                Login to dashboard
              </Link>
            </span>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 pt-4 text-xs font-medium">
            {trustIndicators.map((item) => (
              <span
                key={item}
                className="border-border bg-card/90 inline-flex items-center gap-2 rounded-full border px-4 py-2"
              >
                <span className="bg-primary size-2 rounded-full" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="relative w-full max-w-xl">
          <div
            className="bg-primary/18 absolute top-12 -left-6 h-24 w-24 rounded-full blur-3xl"
            aria-hidden="true"
          />
          <div
            className="bg-accent/12 absolute right-0 bottom-0 h-28 w-28 rounded-full blur-3xl"
            aria-hidden="true"
          />
          <div className="border-border bg-card relative overflow-hidden rounded-[2.5rem] border shadow-[0_16px_32px_rgba(12,39,32,0.08)]">
            <div className="border-border bg-muted flex items-center justify-between border-b px-6 py-4">
              <div className="text-accent space-y-1 text-xs">
                <p className="font-semibold tracking-[0.28em] uppercase">
                  Live metrics
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Supporters syncing every hour
                </p>
              </div>
              <span className="border-primary/40 bg-primary/15 text-accent rounded-full border px-3 py-1 text-xs font-semibold">
                Dashboard view
              </span>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[radial-gradient(circle_at_25%_20%,rgba(70,194,167,0.12),transparent_55%),radial-gradient(circle_at_70%_35%,rgba(22,58,48,0.18),transparent_60%),linear-gradient(155deg,#124438_0%,#0f2b24_65%,#0b1e1a_100%)]">
              <div className="absolute inset-6 rounded-3xl border border-white/10 bg-white/5" />
              <div className="absolute inset-0 flex flex-col gap-4 p-6 text-white/85">
                <div className="flex items-center justify-between text-xs tracking-[0.26em] uppercase">
                  <span className="text-white/70">Adamawa overview</span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/80">
                    Updated 3 mins ago
                  </span>
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                    <span className="text-white/70">Polling units mapped</span>
                    <span className="text-lg font-semibold text-white">
                      420
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                    <span className="text-white/70">Supporters verified</span>
                    <span className="text-lg font-semibold text-white">
                      10,000+
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                    <span className="text-white/70">Top issue today</span>
                    <span className="text-lg font-semibold text-white">
                      Youth jobs
                    </span>
                  </div>
                </div>
                <div className="mt-auto grid grid-cols-3 gap-3 text-[11px] text-white/70">
                  {["State", "LGA", "Ward"].map((label) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-center"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-3 border-t border-[#dcece6] bg-white/90 px-6 py-5 text-xs text-[#3b6558]">
              <div className="flex items-center justify-between">
                <span>Next ward outreach</span>
                <span className="text-sm font-semibold text-[#0f2b24]">
                  Jimeta • Ward 08
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Field agents active</span>
                <span className="text-sm font-semibold text-[#0f2b24]">27</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Household follow-ups</span>
                <span className="text-sm font-semibold text-[#0f2b24]">
                  312 scheduled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
