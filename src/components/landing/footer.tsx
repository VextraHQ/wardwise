"use client";

import Link from "next/link";
import { HiMail } from "react-icons/hi";
import { HiArrowUpRight } from "react-icons/hi2";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { legalNavigation, COMPANY_INFO } from "@/lib/data/legal-data";

// Footer link data
const platformLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Platform", href: "#platform-pillars" },
  { label: "Impact", href: "#impact" },
  { label: "Security", href: "#security" },
];

const roleLinks = [
  {
    label: "Candidate Login",
    href: "/login",
    hoverColor: "hover:text-brand-lagoon",
  },
  {
    label: "Admin Portal",
    href: "/admin",
    hoverColor: "hover:text-primary",
  },
  {
    label: "WardWise Collect",
    href: "#collect",
    hoverColor: "hover:text-orange-600",
  },
];

// Use centralized legal navigation from legal-data.ts
const footerSections = [
  { title: "Platform", links: platformLinks },
  { title: "Access", links: roleLinks },
  {
    title: "Legal",
    links: legalNavigation.map((item) => ({
      label: item.label,
      href: item.href,
    })),
  },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted border-border/40 relative overflow-hidden border-t py-16">
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        {/* Main footer content */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          {/* Brand section */}
          <div className="max-w-sm space-y-5">
            <Logo size="lg" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nigeria&apos;s leading civic intelligence infrastructure. Bridging
              the gap between the field and the dashboard with ward-level
              accuracy.
            </p>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 w-full rounded-full px-6 text-sm font-semibold transition-all duration-200 sm:w-auto"
              asChild
            >
              <Link href="/contact" className="flex items-center gap-2">
                Request a Demo
                <HiArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 gap-12 text-sm sm:grid-cols-3 lg:gap-16">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-5">
                <h3 className="text-foreground text-[11px] font-black tracking-[0.2em] uppercase">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className={`text-muted-foreground font-medium transition-colors duration-200 ${
                          "hoverColor" in link && link.hoverColor
                            ? link.hoverColor
                            : "hover:text-primary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border/40 mt-12 flex flex-col items-center justify-between gap-6 border-t pt-8 sm:flex-row">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider">
              © {currentYear} {COMPANY_INFO.name}. All rights reserved.
            </p>
            <span className="text-muted-foreground/40 hidden sm:inline">·</span>
            <p className="text-muted-foreground/70 font-mono text-[10px]">
              A Product of{" "}
              <Link
                href={COMPANY_INFO.companyWebsite}
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {COMPANY_INFO.legalName}
              </Link>
            </p>
          </div>
          <Link
            href={`mailto:${COMPANY_INFO.supportEmail}`}
            className="group border-border bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary flex items-center gap-2 rounded-full border px-4 py-2 transition-all"
          >
            <HiMail className="h-4 w-4" />
            <span className="text-xs font-medium">Get in Touch</span>
            <HiArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
