import { platformPillars } from "@/lib/landing-data";

export function PlatformPillarsSection() {
  return (
    <section
      id="platform-pillars"
      className="bg-background text-foreground relative overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(70,194,167,0.18),transparent_52%),radial-gradient(circle_at_88%_12%,rgba(12,39,32,0.12),transparent_58%)]"
        aria-hidden="true"
      />
      <div
        className="from-primary/0 via-primary/30 absolute inset-x-1/2 top-0 h-[120%] w-px -translate-x-1/2 bg-linear-to-b to-transparent"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-6">
        <div className="max-w-3xl space-y-5">
          <p className="text-accent text-xs font-semibold tracking-[0.32em] uppercase">
            Platform pillars
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            An end-to-end civic intelligence engine for modern campaigns.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
            WardWise unifies field registration, data validation, analytics, and
            campaign activation so candidates, governments, and civic leaders
            can move in sync.
          </p>
        </div>

        <div className="relative flex flex-col gap-6 md:flex-row md:items-stretch md:justify-between">
          <div
            className="from-primary/0 via-primary/30 pointer-events-none absolute top-0 left-[6%] hidden h-full w-px bg-linear-to-b to-transparent md:block"
            aria-hidden="true"
          />
          <div
            className="from-primary/0 via-primary/20 pointer-events-none absolute top-0 left-[38%] hidden h-full w-px bg-linear-to-b to-transparent lg:block"
            aria-hidden="true"
          />
          <div
            className="from-primary/0 via-primary/20 pointer-events-none absolute top-0 left-[68%] hidden h-full w-px bg-linear-to-b to-transparent xl:block"
            aria-hidden="true"
          />

          <div className="flex flex-1 flex-col gap-6 md:gap-8">
            {platformPillars.map((pillar, index) => (
              <article
                key={pillar.title}
                className="group border-border/60 bg-card/80 hover:border-primary/50 relative flex h-full flex-col gap-4 rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:gap-5 sm:p-6 md:gap-6 md:p-8 lg:rounded-3xl lg:p-9"
              >
                <span
                  className="bg-primary/20 absolute top-10 -left-10 hidden size-16 rounded-full mix-blend-screen blur-2xl md:block"
                  aria-hidden="true"
                />
                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <span className="border-primary/30 bg-primary/10 text-accent inline-flex w-fit items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.28em] uppercase">
                    {pillar.focus}
                  </span>
                  <div className="text-primary/80 flex items-center gap-2 text-xs font-semibold tracking-[0.26em] uppercase">
                    Step 0{index + 1}
                    <span
                      className="bg-primary size-1.5 animate-pulse rounded-full"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    {pillar.description}
                  </p>
                </div>

                <div className="text-foreground/80 relative flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur sm:gap-4 sm:rounded-2xl sm:p-5">
                  <p className="text-primary/80 text-[11px] font-semibold tracking-[0.26em] uppercase">
                    Activation signal
                  </p>
                  <p>{pillar.signal}</p>
                  <div className="text-primary/70 flex flex-col gap-2 text-[11px] font-semibold tracking-[0.26em] uppercase sm:flex-row sm:items-center sm:gap-3">
                    <span className="border-primary/30 bg-primary/10 text-primary inline-flex w-fit items-center gap-1 rounded-full border px-2 py-1 text-[10px]">
                      {pillar.metric.label}
                      <span className="bg-primary/90 rounded-full px-1 text-[10px] text-white">
                        {pillar.metric.value}
                      </span>
                    </span>
                    <span className="text-primary/80">
                      {pillar.metric.context}
                    </span>
                  </div>
                </div>

                <div
                  className="absolute inset-y-0 -right-10 hidden w-10 items-center justify-center md:flex"
                  aria-hidden="true"
                >
                  <div className="from-primary/0 via-primary/40 relative h-16 w-px rounded-full bg-linear-to-b to-transparent sm:h-20 lg:h-24">
                    <span className="bg-primary/80 absolute -top-3 left-1/2 size-2 -translate-x-1/2 rounded-full border border-white/40 shadow-lg sm:-top-4 sm:size-3" />
                    <span className="bg-primary/40 absolute -bottom-3 left-1/2 size-2 -translate-x-1/2 rounded-full border border-white/40 sm:-bottom-4 sm:size-3" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
