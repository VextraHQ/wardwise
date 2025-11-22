"use client";

import Link from "next/link";
import {
  HiMap,
  HiArrowRight,
  HiGlobeAlt,
  HiChip,
  HiChartBar,
  HiLockClosed,
  HiViewGrid,
  HiMail,
} from "react-icons/hi";
import { HiArrowUpRight } from "react-icons/hi2";

import { nigeriaGradient } from "@/lib/landing-data";
import { Button } from "@/components/ui/button";

const platformLinks = [
  { label: "How It Works", href: "#how-it-works", icon: HiViewGrid },
  { label: "Features", href: "#features", icon: HiChip },
  { label: "Platform", href: "#platform-pillars", icon: HiGlobeAlt },
  { label: "Impact", href: "#impact", icon: HiChartBar },
  { label: "Security", href: "#security", icon: HiLockClosed },
];

const companyLinks = [
  { label: "About Us", href: "#", icon: HiArrowUpRight },
  { label: "Contact", href: "mailto:info@wardwise.ng", icon: HiMail },
  { label: "Help Center", href: "#", icon: HiArrowUpRight },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#", icon: HiArrowUpRight },
  { label: "Terms of Service", href: "#", icon: HiArrowUpRight },
  { label: "Security", href: "#security", icon: HiLockClosed },
];

export function SiteFooter() {
  return (
    <footer className="bg-muted text-foreground border-border/50 relative overflow-hidden border-t">
      {/* Subtle background layers */}
      <div
        className={`absolute inset-0 ${nigeriaGradient} opacity-[0.08]`}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(70,194,167,0.05),transparent_55%),radial-gradient(circle_at_bottom,rgba(15,43,36,0.08),transparent_62%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-20">
        {/* Main footer content */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          {/* Brand section */}
          <div className="max-w-sm space-y-5">
            <Link
              href="/"
              className="group flex items-center gap-3"
              aria-label="WardWise home"
            >
              <span className="relative flex size-12 items-center justify-center">
                <span className="border-border bg-card absolute inset-0 rounded-full border transition-transform duration-300 group-hover:scale-110" />
                <span className="from-primary relative flex size-9 items-center justify-center rounded-full bg-linear-to-br via-[#2f7f6b] to-[#163a30] text-white">
                  <HiMap className="h-5 w-5" />
                </span>
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-foreground text-lg font-semibold tracking-[0.14em] uppercase">
                  WardWise
                </span>
                <span className="text-muted-foreground text-[11px] font-medium">
                  Civic Intelligence Platform
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nigeria&apos;s first polling-unit precise civic intelligence
              platform. Ward-level insights help campaigns and civic leaders act
              with confidence.
            </p>
            {/* CTA Button */}
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
          <div className="grid gap-8 text-sm sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {/* Platform Links */}
            <div>
              <h3 className="text-foreground text-xs font-semibold tracking-[0.32em] uppercase">
                Platform
              </h3>
              <ul className="mt-5 space-y-3">
                {platformLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors duration-200"
                      >
                        <Icon className="h-3.5 w-3.5 opacity-60 transition-opacity duration-200 group-hover:opacity-100" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-foreground text-xs font-semibold tracking-[0.32em] uppercase">
                Company
              </h3>
              <ul className="mt-5 space-y-3">
                {companyLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors duration-200"
                      >
                        <Icon className="h-3.5 w-3.5 opacity-60 transition-opacity duration-200 group-hover:opacity-100" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-foreground text-xs font-semibold tracking-[0.32em] uppercase">
                Legal
              </h3>
              <ul className="mt-5 space-y-3">
                {legalLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors duration-200"
                      >
                        <Icon className="h-3.5 w-3.5 opacity-60 transition-opacity duration-200 group-hover:opacity-100" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border/50 mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-xs tracking-[0.25em] uppercase">
            © {new Date().getFullYear()} WardWise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
