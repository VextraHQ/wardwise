import { featureCards, nigeriaGradient } from "@/lib/landing-data";

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-background text-foreground relative overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(70,194,167,0.22),transparent_52%),radial-gradient(circle_at_12%_88%,rgba(17,60,51,0.14),transparent_58%)]"
        aria-hidden={true}
      />
      <div
        className={`absolute inset-0 ${nigeriaGradient} opacity-[0.25] mix-blend-multiply`}
        aria-hidden={true}
      />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-14 px-6">
        <div className="max-w-3xl space-y-5">
          <p className="text-accent text-xs font-semibold tracking-[0.32em] uppercase">
            Why use WardWise?
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Built from the ground up for Nigeria&apos;s political landscape.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
            WardWise helps candidates and civic leaders connect with voters,
            understand their needs, and build stronger communities—every feature
            is engineered for ward-level accuracy.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {featureCards.map((feature, index) => (
            <article
              key={feature.title}
              className="group border-border/60 bg-card/80 hover:border-primary/50 relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"
            >
              <div
                className="absolute inset-0 bg-linear-to-br from-white/8 via-transparent to-white/12 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden={true}
              />
              <span
                className="bg-primary/15 absolute top-0 -right-10 size-32 rounded-full blur-3xl transition-transform duration-300 group-hover:translate-x-4"
                aria-hidden={true}
              />
              <div className="relative flex items-start gap-4">
                <div className="border-primary/30 bg-primary/10 text-accent relative flex size-14 items-center justify-center rounded-2xl border shadow-inner">
                  <feature.icon className="size-7" aria-hidden={true} />
                  <span
                    className="bg-primary/90 absolute -top-1 -right-1 size-3 rounded-full border border-white/60 shadow-md"
                    aria-hidden={true}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-foreground text-lg font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              <dl className="relative mt-8 space-y-4">
                <div className="text-foreground/80 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm backdrop-blur group-hover:border-white/20">
                  <div className="space-y-1">
                    <dt className="text-primary/80 text-[11px] font-semibold tracking-[0.28em] uppercase">
                      {feature.metricLabel}
                    </dt>
                    <dd className="text-foreground text-base font-semibold">
                      {feature.metricValue}
                    </dd>
                  </div>
                  <span
                    className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium"
                    aria-label={`${feature.metricTrend} change in ${feature.metricLabel}`}
                  >
                    <svg
                      className="size-3"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden={true}
                    >
                      <path
                        d="M2.5 7.5 5.25 4.5l2 2L9.5 4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {feature.metricTrend}
                  </span>
                </div>

                <div className="relative flex items-center gap-2">
                  <div className="from-primary/30 via-primary/60 to-primary h-1 flex-1 rounded-full bg-linear-to-r"></div>
                  <span className="text-primary/70 text-[11px] font-medium tracking-[0.28em] uppercase">
                    Nigeria-wide
                  </span>
                </div>
              </dl>

              <div className="text-accent/70 relative mt-6 flex items-center justify-between text-xs font-semibold tracking-[0.26em] uppercase">
                <span>WardWise Core • 0{index + 1}</span>
                <span className="text-primary inline-flex items-center gap-2">
                  Signal ready
                  <span
                    className="bg-primary size-1.5 animate-pulse rounded-full"
                    aria-hidden={true}
                  />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
