"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { HiClock } from "react-icons/hi";
import { Header } from "@/components/layout/header";
import { LegalFooter } from "@/components/legal/legal-footer";
import {
  COMPANY_INFO,
  legalNavigation,
  LEGAL_LAST_UPDATED,
  formatLegalDate,
} from "@/lib/data/legal-data";
import type { LegalSection } from "@/lib/data/legal-data";
import { cn } from "@/lib/utils";
import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";

/**
 * LegalPageLayout - Shared layout component for legal and support pages.
 *
 * Features:
 * - Uses existing Header component for DRY code
 * - Desktop: Sidebar navigation
 * - Mobile: Uses footer for navigation (industry standard)
 * - Print-friendly styles (hides nav/footer when printing)
 * - Consistent styling with app theme
 */

export interface LegalPageLayoutProps {
  /** Page title displayed in the header */
  title: string;
  /** Page subtitle/description */
  subtitle?: string;
  /** System code displayed in the header (e.g., "LEGAL_PRIV_001") */
  systemCode: string;
  /** Icon displayed in the header */
  icon: IconType | LucideIcon;
  /** Children to render in the main content area */
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  subtitle,
  systemCode,
  icon: Icon,
  children,
}: LegalPageLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="bg-background min-h-screen">
      {/* Header - hidden when printing */}
      <div className="print:hidden">
        <Header badge="Legal & Support" />
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10 print:max-w-none print:px-8 print:py-4">
        <div className="flex gap-10">
          {/* Desktop Sidebar Navigation (hidden when printing) */}
          <aside className="hidden shrink-0 lg:block lg:w-56 print:hidden">
            <nav className="sticky top-24">
              <div className="border-border/60 bg-card overflow-hidden rounded-sm border shadow-none">
                <div className="border-border/60 bg-muted/30 border-b px-4 py-3">
                  <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                    Legal & Support
                  </span>
                </div>
                <ul className="space-y-0.5 p-2">
                  {legalNavigation.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-primary/10 text-primary border-primary border-l-[3px]"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </aside>

          {/* Content Area */}
          <div className="min-w-0 flex-1">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="print:transform-none! print:opacity-100!"
            >
              {/* Page Header */}
              <div className="border-border/60 bg-card relative overflow-hidden border shadow-none print:border-none print:bg-transparent">
                {/* Corner Markers (hidden when printing) */}
                <div className="border-primary absolute top-0 left-0 size-5 border-t border-l print:hidden" />
                <div className="border-primary absolute top-0 right-0 size-5 border-t border-r print:hidden" />

                {/* System Code */}
                <div className="absolute top-3 right-4 flex items-center gap-1.5 opacity-50 print:hidden">
                  <div className="bg-primary size-1.5 rounded-full" />
                  <span className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
                    {systemCode}
                  </span>
                </div>

                <div className="p-5 sm:p-6 print:p-0">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary border-primary/20 flex size-11 shrink-0 items-center justify-center rounded-sm border print:hidden">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl print:text-3xl">
                        {title}
                      </h1>
                      {subtitle && (
                        <p className="text-muted-foreground text-sm print:text-base">
                          {subtitle}
                        </p>
                      )}
                      <div className="text-muted-foreground flex items-center gap-1.5 pt-1 text-xs">
                        <HiClock className="size-3.5 print:hidden" />
                        <span>
                          Last Updated: {formatLegalDate(LEGAL_LAST_UPDATED)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="border-border/60 bg-card mt-4 overflow-hidden rounded-sm border shadow-none print:mt-6 print:border-none print:bg-transparent">
                <div className="p-5 sm:p-6 print:p-0">{children}</div>

                {/* Content Footer (hidden when printing) */}
                <div className="border-border/60 bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 print:hidden">
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {systemCode} :: {COMPANY_INFO.name}
                  </span>
                  <Link
                    href={`mailto:${COMPANY_INFO.supportEmail}`}
                    className="text-muted-foreground hover:text-primary text-xs transition-colors"
                  >
                    {COMPANY_INFO.supportEmail}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <LegalFooter pathname={pathname} />
    </div>
  );
}

/**
 * LegalSectionContent - Renders content sections for legal pages
 */
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
