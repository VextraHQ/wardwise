"use client";

import Link from "next/link";
import { HiArrowRight, HiMail } from "react-icons/hi";
import { Logo } from "@/components/layout/logo";
import { HiArrowUpRight } from "react-icons/hi2";
import { Button } from "@/components/ui/button";

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
    label: "Voter Portal",
    href: "/voter-login",
    hoverColor: "hover:text-primary",
  },
  {
    label: "Canvasser Field App",
    href: "/canvassers",
    hoverColor: "hover:text-orange-600",
  },
  {
    label: "Candidate Dashboard",
    href: "/login",
    hoverColor: "hover:text-emerald-600",
  },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Security", href: "#security" },
];

const footerSections = [
  { title: "Platform", links: platformLinks },
  { title: "Access", links: roleLinks },
  { title: "Legal", links: legalLinks },
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
              Nigeria&apos;s leading civic intelligence infrastructure. Briding
              the gap between the field and the dashboard with ward-level
              accuracy.
            </p>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 w-full rounded-lg px-6 text-sm font-semibold transition-all duration-200 sm:w-auto"
              asChild
            >
              <Link href="/register" className="flex items-center gap-2">
                Support a Candidate
                <HiArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 gap-12 text-sm sm:grid-cols-3 lg:gap-16">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-6">
                <h3 className="text-foreground text-[11px] font-black tracking-[0.2em] uppercase">
                  {section.title}
                </h3>
                <ul className="space-y-4">
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
        <div className="border-border/40 mt-8 flex flex-col items-center justify-between gap-6 border-t pt-10 sm:flex-row">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-widest">
            © {currentYear} WardWise. All rights reserved.
          </p>
          <Link
            href="mailto:info@wardwise.ng"
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
