import { platformPillars } from "@/lib/landing-data";

export function PlatformPillarsSection() {
  return (
    <section
      id="platform-pillars"
      className="bg-background text-foreground relative overflow-hidden py-24"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(70,194,167,0.16),transparent_55%),radial-gradient(circle_at_85%_22%,rgba(18,68,56,0.1),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6">
        <div className="max-w-3xl space-y-4">
          <p className="text-accent text-xs font-semibold tracking-[0.32em] uppercase">
            Platform pillars
          </p>
          <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            An end-to-end civic intelligence engine for modern campaigns.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            WardWise unifies field registration, data validation, analytics, and
            campaign activation so candidates, governments, and civic leaders
            can move in sync.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {platformPillars.map((pillar) => (
            <article
              key={pillar.title}
              className="group border-border bg-card hover:border-primary/60 relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border p-8 shadow-[0_16px_36px_rgba(12,39,32,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(12,39,32,0.12)]"
            >
              <span className="border-primary/30 bg-primary/10 text-accent inline-flex w-fit items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.28em] uppercase">
                {pillar.focus}
              </span>
              <h3 className="text-foreground text-lg font-semibold tracking-tight">
                {pillar.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {pillar.description}
              </p>
              <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                <div className="from-primary/12 to-accent/12 absolute inset-0 bg-gradient-to-br via-transparent" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
