import { securityHighlights } from "@/lib/landing-data";

export function SecuritySection() {
  return (
    <section
      id="security"
      className="bg-background text-foreground relative overflow-hidden py-24"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(70,194,167,0.14),transparent_55%),radial-gradient(circle_at_86%_12%,rgba(18,68,56,0.1),transparent_65%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6">
        <div className="max-w-3xl space-y-4">
          <p className="text-accent text-xs font-semibold tracking-[0.32em] uppercase">
            Security & compliance
          </p>
          <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Privacy-first architecture designed for Nigerian campaigns.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            WardWise protects supporter data with bank-grade encryption, local
            hosting, and role-based access built for campaign teams, analysts,
            and field operations.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {securityHighlights.map((item) => (
            <article
              key={item.title}
              className="border-border bg-card/70 hover:border-primary/60 hover:bg-card relative flex h-full flex-col gap-4 rounded-3xl border p-7 shadow-[0_14px_32px_rgba(12,39,32,0.08)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(12,39,32,0.12)]"
            >
              <div className="border-primary/30 bg-primary/12 text-accent flex size-10 items-center justify-center rounded-full border">
                <item.icon className="size-5" aria-hidden="true" />
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
