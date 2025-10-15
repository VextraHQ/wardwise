import { impactHighlights } from "@/lib/landing-data";

export function ImpactSection() {
  return (
    <section
      id="impact"
      className="bg-muted text-foreground relative overflow-hidden py-24"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(70,194,167,0.18),transparent_55%),radial-gradient(circle_at_88%_18%,rgba(18,68,56,0.12),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6">
        <div className="max-w-3xl space-y-4">
          <p className="text-accent text-xs font-semibold tracking-[0.32em] uppercase">
            Impact
          </p>
          <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            WardWise connects national ambition with polling-unit reality.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            We are building WardWise to scale across Nigeria, giving campaigns,
            civic groups, and governments the same precise voter intelligence.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {impactHighlights.map((item) => (
            <article
              key={item.title}
              className="group border-border bg-card hover:border-primary/60 relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border p-8 shadow-[0_16px_36px_rgba(12,39,32,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(12,39,32,0.12)]"
            >
              <div className="border-primary/30 bg-primary/12 text-accent flex size-11 items-center justify-center rounded-2xl border">
                <item.icon className="size-6" aria-hidden="true" />
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
