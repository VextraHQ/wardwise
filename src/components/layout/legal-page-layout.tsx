"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HiArrowLeft, HiClock } from "react-icons/hi";
import { Logo } from "@/components/layout/logo";
import { COMPANY_INFO, legalNavigation } from "@/lib/data/legal-data";
import type { LegalSection } from "@/lib/data/legal-data";
import { cn } from "@/lib/utils";
import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";

/**
 * LegalPageLayout - Shared layout for all legal and policy pages.
 * Provides consistent styling, navigation, and structure for:
 * - Privacy Policy
 * - Terms of Service
 * - Cookie Policy
 * - Support Center
 * - Contact Page
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
  /** Optional accent color variant */
  variant?: "primary" | "orange" | "emerald";
  /** Children to render in the main content area */
  children: React.ReactNode;
  /** Whether to show the sidebar navigation */
  showSidebar?: boolean;
  /** Active page for sidebar highlighting */
  activePage?: string;
}

const variantStyles = {
  primary: {
    iconBg: "bg-primary/10 border-primary/20 text-primary",
    accent: "text-primary",
    border: "border-primary",
  },
  orange: {
    iconBg: "bg-orange-500/10 border-orange-500/20 text-orange-600",
    accent: "text-orange-600",
    border: "border-orange-500",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
    accent: "text-emerald-600",
    border: "border-emerald-500",
  },
};

export function LegalPageLayout({
  title,
  subtitle,
  systemCode,
  icon: Icon,
  variant = "primary",
  children,
  showSidebar = true,
  activePage,
}: LegalPageLayoutProps) {
  const styles = variantStyles[variant];

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-border/50 bg-card/80 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo size="md" />
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <HiArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Sidebar Navigation */}
          {showSidebar && (
            <aside className="shrink-0 lg:w-64">
              <nav className="lg:sticky lg:top-24">
                <div className="border-border bg-card overflow-hidden rounded-lg border">
                  {/* Sidebar Header */}
                  <div className="border-border bg-muted/50 border-b px-4 py-3">
                    <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                      Legal & Support
                    </span>
                  </div>
                  {/* Sidebar Links */}
                  <ul className="space-y-1 p-2">
                    {legalNavigation.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            activePage === item.href
                              ? "bg-primary/10 text-primary"
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
          )}

          {/* Content Area */}
          <div className="min-w-0 flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Page Header Card */}
              <div className="border-border bg-card relative overflow-hidden border">
                {/* Architectural Corner Markers */}
                <div
                  className={cn(
                    "absolute top-0 left-0 size-6 border-t border-l",
                    styles.border,
                  )}
                />
                <div
                  className={cn(
                    "absolute top-0 right-0 size-6 border-t border-r",
                    styles.border,
                  )}
                />

                {/* System Code Badge */}
                <div className="absolute top-4 right-5 flex items-center gap-2 opacity-60">
                  <div
                    className={cn("h-1.5 w-1.5 rounded-full", styles.iconBg)}
                  />
                  <span className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
                    {systemCode}
                  </span>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-xl border",
                        styles.iconBg,
                      )}
                    >
                      <Icon className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                        {title}
                      </h1>
                      {subtitle && (
                        <p className="text-muted-foreground text-sm">
                          {subtitle}
                        </p>
                      )}
                      <div className="text-muted-foreground flex items-center gap-2 pt-2 text-xs">
                        <HiClock className="size-3.5" />
                        <span>Last Updated: {COMPANY_INFO.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="border-border bg-card mt-6 overflow-hidden border">
                <div className="p-6 sm:p-8">{children}</div>

                {/* Footer */}
                <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-4 border-t px-6 py-4">
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {systemCode} :: {COMPANY_INFO.name}
                  </span>
                  <Link
                    href={`mailto:${COMPANY_INFO.supportEmail}`}
                    className="text-muted-foreground hover:text-primary text-xs transition-colors"
                  >
                    Questions? Contact {COMPANY_INFO.supportEmail}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-border/50 border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} {COMPANY_INFO.legalName}. All rights
            reserved.
          </p>
        </div>
      </footer>
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
    <div className="space-y-8">
      {sections.map((section, index) => (
        <motion.section
          key={section.id}
          id={section.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="scroll-mt-24"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="text-primary/40 font-mono text-[10px] font-bold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="text-foreground text-lg font-bold">
              {section.title}
            </h2>
          </div>
          <div className="text-muted-foreground space-y-3 pl-7 text-sm leading-relaxed">
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
