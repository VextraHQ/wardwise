"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { SiteFooter } from "@/features/public-site/components/shared/footer";
import { MarketingHeader } from "@/features/public-site/components/shared/marketing-header";
import {
  COMPANY_INFO,
  legalNavigation,
  LEGAL_LAST_UPDATED,
  formatLegalDate,
} from "@/lib/constants/legal-data";
import type { LegalSection } from "@/lib/constants/legal-data";
import { cn } from "@/lib/utils";

function LegalDocNav({
  layout = "inline",
  embedded = false,
  className,
}: {
  layout?: "inline" | "stack";
  embedded?: boolean;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        layout === "inline"
          ? "inline-flex flex-wrap items-center gap-1"
          : "flex flex-col gap-1",
        embedded
          ? "p-0"
          : "border-border/60 bg-background rounded-sm border p-1",
        className,
      )}
      aria-label="Legal documents"
    >
      {legalNavigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-sm px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.18em] uppercase transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  subtitle,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <div className="print:hidden">
        <MarketingHeader variant="back" />
      </div>

      <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-10 print:max-w-none print:px-8 print:py-4">
        <div className="flex gap-10">
          <aside className="hidden shrink-0 lg:block lg:w-56 print:hidden">
            <nav className="sticky top-24" aria-label="Legal documents">
              <div className="border-border/60 bg-card overflow-hidden rounded-sm border shadow-none">
                <div className="border-border/60 bg-muted/30 border-b px-4 py-3">
                  <span className="text-primary font-mono text-[10px] font-bold tracking-widest uppercase">
                    Legal
                  </span>
                </div>
                <div className="bg-background/50 p-2">
                  <LegalDocNav layout="stack" embedded className="w-full" />
                </div>
              </div>
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="print:transform-none! print:opacity-100!"
            >
              <div className="border-border/60 bg-card relative overflow-hidden border shadow-none print:border-none print:bg-transparent">
                <div className="border-primary absolute top-0 left-0 size-5 border-t border-l print:hidden" />
                <div className="border-primary absolute top-0 right-0 size-5 border-t border-r print:hidden" />

                <div className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 sm:px-6 lg:hidden print:hidden">
                  <p className="text-primary font-mono text-[10px] font-black tracking-[0.24em] uppercase">
                    Legal
                  </p>
                  <LegalDocNav layout="inline" />
                </div>

                <div className="space-y-4 p-5 sm:p-6 print:p-0">
                  <div className="max-w-3xl space-y-2">
                    <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl print:text-3xl">
                      {title}
                    </h1>
                    {subtitle ? (
                      <p className="text-muted-foreground text-sm leading-7 sm:text-base print:text-base">
                        {subtitle}
                      </p>
                    ) : null}
                  </div>

                  <span className="border-border/60 bg-background text-muted-foreground inline-flex rounded-sm border px-3 py-2 font-mono text-[10px] font-bold tracking-[0.16em] uppercase">
                    Last updated: {formatLegalDate(LEGAL_LAST_UPDATED)}
                  </span>
                </div>
              </div>

              <div className="border-border/60 bg-card mt-4 overflow-hidden rounded-sm border shadow-none print:mt-6 print:border-none print:bg-transparent">
                <div className="p-5 sm:p-6 print:p-0">{children}</div>

                <div className="border-border/60 bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 print:hidden">
                  <p className="text-muted-foreground flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] font-bold tracking-widest uppercase">
                    <span className="text-foreground/80">
                      {COMPANY_INFO.name}
                    </span>
                    <span
                      className="bg-border size-1 shrink-0 rounded-full"
                      aria-hidden
                    />
                    <span>{COMPANY_INFO.legalName}</span>
                  </p>
                  <Link
                    href={`mailto:${COMPANY_INFO.supportEmail}`}
                    className="text-muted-foreground hover:text-primary shrink-0 text-xs transition-colors"
                  >
                    {COMPANY_INFO.supportEmail}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}

export interface LegalSectionContentProps {
  sections: LegalSection[];
}

export function LegalSectionContent({ sections }: LegalSectionContentProps) {
  return (
    <div className="space-y-7">
      {sections.map((section, index) => (
        <motion.section
          key={section.id}
          id={section.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.25 }}
          className="scroll-mt-32"
        >
          <div className="mb-3 flex items-center gap-2.5">
            <span className="text-primary/50 font-mono text-[10px] font-bold print:hidden">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="text-foreground text-base font-bold sm:text-lg">
              {section.title}
            </h2>
          </div>
          <div className="text-muted-foreground space-y-2.5 pl-6 text-sm leading-relaxed print:pl-0 print:text-base">
            {section.content.map((paragraph, i) => (
              <p
                key={i}
                className="[&_strong]:text-foreground [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{
                  __html: paragraph.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>",
                  ),
                }}
              />
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
