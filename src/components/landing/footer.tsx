import Link from "next/link";

import { nigeriaGradient } from "@/lib/landing-data";
import { MapIcon } from "@heroicons/react/24/outline";

const platformLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "For Candidates", href: "#for-candidates" },
];

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Contact", href: "mailto:info@wardwise.ng" },
  { label: "Press", href: "#" },
];

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Security", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="bg-accent text-accent-foreground relative overflow-hidden">
      <div
        className={`absolute inset-0 ${nigeriaGradient} opacity-[0.35]`}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(70,194,167,0.16),transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,43,36,0.28),transparent_62%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="relative flex size-12 items-center justify-center">
                <span className="border-accent-foreground/20 bg-accent/40 absolute inset-0 rounded-full border shadow-[0_6px_16px_rgba(0,0,0,0.2)]" />
                <span className="from-primary relative flex size-9 items-center justify-center rounded-full bg-gradient-to-br via-[#2f7f6b] to-[#163a30] text-white">
                  <MapIcon className="size-5" />
                </span>
              </span>
              <div className="text-accent-foreground text-lg font-semibold tracking-[0.14em] uppercase">
                WardWise
              </div>
            </div>
            <p className="text-accent-foreground/70 text-sm leading-relaxed">
              Nigeria&apos;s first polling-unit precise civic intelligence
              platform. Ward-level insights help campaigns and civic leaders act
              with confidence.
            </p>
          </div>
          <div className="grid gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="text-accent-foreground/80 text-xs font-semibold tracking-[0.32em] uppercase">
                Platform
              </p>
              <ul className="text-accent-foreground/75 mt-4 space-y-3">
                {platformLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-accent-foreground transition duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-accent-foreground/80 text-xs font-semibold tracking-[0.32em] uppercase">
                Company
              </p>
              <ul className="text-accent-foreground/75 mt-4 space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-accent-foreground transition duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-accent-foreground/80 text-xs font-semibold tracking-[0.32em] uppercase">
                Legal
              </p>
              <ul className="text-accent-foreground/75 mt-4 space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-accent-foreground transition duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-accent-foreground/10 text-accent-foreground/50 mt-12 border-t pt-6 text-xs tracking-[0.25em] uppercase">
          © {new Date().getFullYear()} WardWise. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
