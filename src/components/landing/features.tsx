import { featureCards, nigeriaGradient } from "@/lib/landing-data";

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-background text-foreground relative overflow-hidden py-24"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(70,194,167,0.22),transparent_55%),radial-gradient(circle_at_85%_0%,rgba(17,60,51,0.12),transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className={`absolute inset-0 ${nigeriaGradient} opacity-[0.35]`}
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6">
        <div className="max-w-3xl">
          <p className="text-accent text-xs font-semibold tracking-[0.32em] uppercase">
            Why use WardWise?
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Built from the ground up for Nigeria&apos;s political landscape.
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            WardWise helps candidates and civic leaders connect with voters,
            understand their needs, and build stronger communities.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((feature, index) => (
            <article
              key={feature.title}
              className="group border-border bg-card/70 hover:border-primary/60 hover:bg-card relative overflow-hidden rounded-3xl border p-8 shadow-[0_14px_32px_rgba(12,39,32,0.08)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(12,39,32,0.12)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-0 transition duration-300 group-hover:opacity-100" />
              <div className="relative flex items-start gap-4">
                <div className="border-primary/30 bg-primary/12 text-accent relative flex size-12 items-center justify-center rounded-2xl border shadow-inner">
                  <feature.icon className="size-6" aria-hidden="true" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <span className="text-accent/70 mt-auto inline-flex w-fit items-center gap-2 text-xs font-semibold tracking-[0.28em] uppercase">
                    Built for Nigeria
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
