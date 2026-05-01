"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LegalFooter } from "@/components/legal/legal-footer";
import { supportNavigation } from "@/lib/data/support-data";
import { cn } from "@/lib/utils";

type PublicSupportLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function PublicSupportLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: PublicSupportLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="bg-background min-h-screen">
      <Header
        badge="Support & Contact"
        hideMobileBadge
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground font-mono text-[10px] font-bold tracking-widest uppercase transition-colors"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground font-mono text-[10px] font-bold tracking-widest uppercase transition-colors"
            >
              Login
            </Link>
          </div>
        }
      />

      <main className="relative">
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
          <div className="border-border/60 bg-card relative overflow-hidden border shadow-none">
            <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
            <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

            <div className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 sm:px-6">
              <p className="text-primary font-mono text-[10px] font-black tracking-[0.24em] uppercase">
                {eyebrow}
              </p>

              <nav
                className="border-border/60 bg-background inline-flex flex-wrap items-center gap-1 rounded-sm border p-1"
                aria-label="Support & Contact pages"
              >
                {supportNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-sm px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.18em] uppercase transition-colors",
                      pathname === item.href
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="max-w-3xl space-y-3">
                <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
                  {title}
                </h1>
                <p className="text-muted-foreground max-w-2xl text-sm leading-7 sm:text-base">
                  {subtitle}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <span className="border-border/60 bg-background text-muted-foreground rounded-sm border px-3 py-2 font-mono text-[10px] font-bold tracking-[0.16em] uppercase">
                  Reply window: 24-48h
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:pb-10">
          {children}
        </section>
      </main>

      <LegalFooter pathname={pathname} />
    </div>
  );
}
