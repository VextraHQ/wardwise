import { impactHighlights } from "@/lib/landing-data";

const coreStats = [
  {
    label: "Supporters verified",
    value: "10,284",
    delta: "+12%",
    caption: "Past 30 days",
  },
  {
    label: "Polling units mapped",
    value: "420",
    delta: "+18",
    caption: "State coverage",
  },
];

export function ImpactSection() {
  return (
    <section
      id="impact"
      className="bg-muted text-foreground relative overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(70,194,167,0.2),transparent_52%),radial-gradient(circle_at_88%_22%,rgba(18,68,56,0.12),transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-1/2 h-[120%] -translate-y-1/2 bg-gradient-to-b from-[#0f2b24]/5 via-transparent to-[#46C2A7]/10"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-14 px-6">
        <div className="max-w-3xl space-y-5">
          <p className="text-accent text-xs font-semibold tracking-[0.32em] uppercase">
            Impact
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            WardWise connects national ambition with polling-unit reality.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
            We are building WardWise to scale across Nigeria, giving campaigns,
            civic groups, and governments the same precise voter intelligence.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div className="border-border/60 bg-card/90 relative overflow-hidden rounded-2xl border backdrop-blur-xl sm:rounded-3xl">
            <div
              className="bg-primary/15 absolute top-1/2 -left-32 hidden size-[28rem] -translate-y-1/2 rounded-full mix-blend-screen blur-3xl lg:block"
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-6 p-6 sm:gap-8 sm:p-8 lg:p-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <p className="text-primary/80 text-xs font-semibold tracking-[0.28em] uppercase">
                    Live movement feed
                  </p>
                  <p className="text-foreground mt-2 text-2xl font-semibold sm:text-3xl lg:text-4xl">
                    Real-world adoption across Nigeria
                  </p>
                </div>
                <div className="border-primary/20 bg-primary/10 text-primary relative flex w-fit items-center gap-3 rounded-full border px-4 py-2 text-[11px] font-semibold tracking-[0.28em] uppercase">
                  Syncing
                  <span
                    className="bg-primary inline-flex size-1.5 animate-pulse rounded-full"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                {coreStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="text-foreground/80 relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:rounded-2xl sm:p-6"
                  >
                    <dt className="text-primary/70 text-xs font-semibold tracking-[0.26em] uppercase">
                      {stat.label}
                    </dt>
                    <dd className="text-foreground mt-2 flex items-baseline gap-2 text-2xl font-semibold sm:mt-3 sm:gap-3 sm:text-3xl">
                      {stat.value}
                      <span
                        className="text-primary text-xs font-medium sm:text-sm"
                        aria-label={`${stat.delta} change in ${stat.label}`}
                      >
                        {stat.delta}
                      </span>
                    </dd>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {stat.caption}
                    </p>
                    <div
                      className="from-primary/20 via-primary/50 to-primary mt-3 h-1 rounded-full bg-gradient-to-r sm:mt-4"
                      aria-hidden="true"
                    />
                  </div>
                ))}
              </dl>

              <div className="text-foreground/80 grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur sm:grid-cols-2 sm:gap-4 sm:rounded-2xl sm:p-6">
                <div className="space-y-2">
                  <p className="text-primary/70 text-xs font-semibold tracking-[0.26em] uppercase">
                    Coverage heartbeats
                  </p>
                  <p className="text-muted-foreground">
                    From Adamawa to Lagos, WardWise launches are coordinated
                    with field teams and partner organizations.
                  </p>
                </div>
                <div className="text-primary/80 flex flex-col gap-2 text-xs font-semibold tracking-[0.26em] uppercase sm:flex-row sm:items-center sm:gap-3">
                  <span className="border-primary/30 bg-primary/10 text-primary inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1">
                    17
                    <span className="text-[10px] font-medium">
                      Wards pending
                    </span>
                  </span>
                  <span className="border-primary/30 bg-primary/10 text-primary inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1">
                    86%
                    <span className="text-[10px] font-medium">Coverage</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {impactHighlights.map((item) => (
              <article
                key={item.title}
                className="group border-border/60 bg-card/80 hover:border-primary/70 relative flex flex-col gap-3 rounded-2xl border p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 sm:gap-4 sm:rounded-3xl sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="border-primary/30 bg-primary/12 text-accent flex size-10 items-center justify-center rounded-2xl border">
                    <item.icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-foreground text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
                <span className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-[0.26em] uppercase">
                  Impact signal
                  <span
                    className="bg-primary size-1.5 animate-pulse rounded-full"
                    aria-hidden="true"
                  />
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
