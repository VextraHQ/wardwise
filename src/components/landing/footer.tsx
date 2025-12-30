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
import { HiDeviceMobile } from "react-icons/hi";
import { nigeriaGradient } from "@/lib/landing-data";
import { Button } from "@/components/ui/button";

const platformLinks = [
  { label: "How It Works", href: "#how-it-works", icon: HiViewGrid },
  { label: "Features", href: "#features", icon: HiChip },
  { label: "Platform", href: "#platform-pillars", icon: HiGlobeAlt },
  { label: "Impact", href: "#impact", icon: HiChartBar },
  { label: "Security", href: "#security", icon: HiLockClosed },
];

const roleLinks = [
  {
    label: "Voter Portal",
    href: "/voter-login",
    icon: HiViewGrid,
    color: "text-primary",
  },
  {
    label: "Canvasser Field App",
    href: "/canvassers",
    icon: HiDeviceMobile,
    color: "text-orange-600",
  },
  {
    label: "Candidate Dashboard",
    href: "/login",
    icon: HiChartBar,
    color: "text-emerald-600",
  },
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
    <footer className="bg-muted/30 border-border/40 relative overflow-hidden border-t py-16">
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        {/* Main footer content */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          {/* Brand section */}
          <div className="max-w-sm space-y-5">
            <Link
              href="/"
              className="group flex items-center gap-3"
              aria-label="WardWise home"
            >
              <div className="border-primary/20 bg-primary/5 text-primary flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105">
                <HiMap className="h-7 w-7" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-foreground text-xl font-black tracking-tight">
                  WardWise
                </span>
                <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase opacity-80">
                  Civic Intelligence
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nigeria&apos;s leading civic intelligence infrastructure. Briding
              the gap between the field and the dashboard with ward-level
              accuracy.
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
          <div className="grid grid-cols-2 gap-12 text-sm sm:grid-cols-3 lg:gap-16">
            {/* Platform Links */}
            <div className="space-y-6">
              <h3 className="text-foreground text-[11px] font-black tracking-[0.2em] uppercase">
                Platform
              </h3>
              <ul className="space-y-4">
                {platformLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Roles Section */}
            <div className="space-y-6">
              <h3 className="text-foreground text-[11px] font-black tracking-[0.2em] uppercase">
                Access
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/voter-login"
                    className="text-muted-foreground hover:text-primary font-medium transition-colors"
                  >
                    Voter Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/canvassers"
                    className="text-muted-foreground font-medium transition-colors hover:text-orange-600"
                  >
                    Canvasser Field App
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-muted-foreground font-medium transition-colors hover:text-emerald-600"
                  >
                    Candidate Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="space-y-6">
              <h3 className="text-foreground text-[11px] font-black tracking-[0.2em] uppercase">
                Legal
              </h3>
              <ul className="space-y-4">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border/40 mt-8 flex flex-col items-center justify-between gap-6 border-t pt-10 sm:flex-row">
          <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
            © {new Date().getFullYear()} WardWise. Built for Nigeria.
          </p>
          <Link
            href="mailto:info@wardwise.ng"
            className="group border-border bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary flex items-center gap-2 rounded-full border px-4 py-2 transition-all"
          >
            <HiMail className="h-4 w-4" />
            <span className="text-xs font-semibold">Get in Touch</span>
            <HiArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
