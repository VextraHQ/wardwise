"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiArrowRight, HiMail } from "react-icons/hi";
import { Logo } from "@/components/shared/logo";
import { FooterCookieSettingsButton } from "@/components/shared/cookie-consent";
import { Button } from "@/components/ui/button";
import { legalNavigation, COMPANY_INFO } from "@/lib/constants/legal-data";
import { cn } from "@/lib/utils";

const productLinks = [
  { label: "For Campaigns", href: "/for-campaigns" },
  { label: "Support", href: "/support" },
  { label: "Contact", href: "/contact" },
];

const accessLinks = [
  { label: "Candidate Login", href: "/login" },
  { label: "Admin Portal", href: "/admin" },
  { label: "WardWise Collect", href: "/#collect" },
];

const footerSections = [
  { title: "Product", links: productLinks },
  { title: "Access", links: accessLinks },
  {
    title: "Legal",
    links: legalNavigation.map((item) => ({
      label: item.label,
      href: item.href,
    })),
  },
];

function isFooterLinkActive(pathname: string, href: string) {
  if (href.startsWith("/#")) {
    return pathname === "/";
  }
  if (href === "/admin") {
    return pathname.startsWith("/admin");
  }
  return pathname === href;
}

const footerLinkClass = "font-medium transition-colors duration-200";

export function SiteFooter() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-border/40 relative overflow-hidden border-t py-16">
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="max-w-sm space-y-5">
            <Logo size="lg" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              WardWise is a campaign field-operations platform that helps teams
              capture supporters, organize them by real electoral geography, and
              turn field activity into a shared campaign picture.
            </p>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 w-full rounded-full px-6 text-sm font-semibold transition-all duration-200 sm:w-auto"
              asChild
            >
              <Link href="/contact" className="flex items-center gap-2">
                Request a Demo
                <HiArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-12 text-sm sm:grid-cols-3 lg:gap-16">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-5">
                <h3 className="text-foreground text-[11px] font-black tracking-[0.2em] uppercase">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => {
                    const isActive = isFooterLinkActive(pathname, link.href);
                    return (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            footerLinkClass,
                            isActive
                              ? "text-primary font-semibold"
                              : "text-muted-foreground hover:text-primary",
                          )}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border/40 mt-12 flex flex-col items-center justify-between gap-6 border-t pt-8 sm:flex-row">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:flex-wrap">
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
            <span className="text-muted-foreground/40 hidden sm:inline">·</span>
            <FooterCookieSettingsButton className="rounded-sm px-0" />
          </div>
          <Link
            href="/contact"
            className="group border-border bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary flex items-center gap-2 rounded-full border px-4 py-2 transition-all"
          >
            <HiMail className="h-4 w-4" />
            <span className="text-xs font-medium">Contact us</span>
            <HiArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
