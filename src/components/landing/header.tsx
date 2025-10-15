"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { Transition } from "@headlessui/react";
import {
  Bars3Icon,
  ChartBarIcon,
  CpuChipIcon,
  GlobeAltIcon,
  LockClosedIcon,
  MapIcon,
  Squares2X2Icon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import { navigationLinks } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  className?: string;
};

export function SiteHeader({ className }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-50 w-full", className)}>
      <div
        className={cn(
          "transition-colors duration-300",
          scrolled
            ? "border-border border-b shadow-[0_6px_18px_rgba(12,39,32,0.06)] backdrop-blur"
            : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="WardWise home"
          >
            <span className="relative flex size-12 items-center justify-center">
              <span className="border-border bg-card absolute inset-0 rounded-full border shadow-[0_10px_24px_rgba(12,39,32,0.08)]" />
              <span className="from-primary relative flex size-9 items-center justify-center rounded-full bg-gradient-to-br via-[#2f7f6b] to-[#163a30] text-white">
                <MapIcon className="size-5" />
              </span>
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-foreground text-base font-semibold tracking-[0.18em] uppercase">
                WardWise
              </span>
              <span className="text-muted-foreground text-[11px] font-medium">
                Civic Intelligence Platform
              </span>
            </div>
          </Link>
          <nav className="text-accent hidden items-center gap-8 text-sm font-medium lg:flex">
            {navigationLinks.map((link) => (
              <a
                key={link.section}
                href={`#${link.section}`}
                className="group hover:text-foreground relative inline-flex items-center gap-2 text-sm transition-colors duration-200"
              >
                {link.section === "how-it-works" && (
                  <Squares2X2Icon className="text-primary size-4" />
                )}
                {link.section === "features" && (
                  <CpuChipIcon className="text-primary size-4" />
                )}
                {link.section === "platform-pillars" && (
                  <GlobeAltIcon className="text-primary size-4" />
                )}
                {link.section === "impact" && (
                  <ChartBarIcon className="text-primary size-4" />
                )}
                {link.section === "security" && (
                  <LockClosedIcon className="text-primary size-4" />
                )}
                <span>{link.label}</span>
                <span className="bg-primary absolute -bottom-1 left-0 h-[2px] w-0 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="text-secondary-foreground hover:text-foreground flex items-center gap-2 text-sm font-semibold transition-colors duration-200"
            >
              <UserGroupIcon className="size-4" />
              Candidate Login
            </Link>
            <Button
              size="lg"
              className="bg-secondary-foreground text-background hover:bg-secondary-foreground/90 rounded-full px-6 text-sm font-semibold"
              asChild
            >
              <Link href="/register">Register Supporter</Link>
            </Button>
          </div>
          <button
            className="border-border bg-card/90 text-foreground hover:border-primary hover:text-accent inline-flex items-center justify-center rounded-lg border p-2 shadow-[0_8px_20px_rgba(12,39,32,0.08)] transition duration-300 lg:hidden"
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {isMobileOpen ? (
              <XMarkIcon className="size-5" />
            ) : (
              <Bars3Icon className="size-5" />
            )}
          </button>
        </div>
      </div>
      <Transition
        show={isMobileOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-3"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-3"
      >
        <div className="lg:hidden">
          <div className="border-border bg-card border-b px-6 pt-4 pb-6 shadow-[0_24px_48px_rgba(12,39,32,0.12)]">
            <nav className="text-accent flex flex-col gap-1 text-base">
              {navigationLinks.map((link) => (
                <a
                  key={link.section}
                  href={`#${link.section}`}
                  className="hover:bg-muted hover:text-foreground rounded-lg px-3 py-3 transition duration-200"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/login"
                className="border-border text-foreground hover:border-primary hover:bg-foreground/90 rounded-lg border px-4 py-3 text-center text-sm font-semibold transition duration-200"
                onClick={() => setIsMobileOpen(false)}
              >
                Candidate Login
              </Link>
              <Button
                size="lg"
                className="bg-foreground text-background rounded-full"
                asChild
              >
                <Link href="/register">Register Voter</Link>
              </Button>
            </div>
          </div>
        </div>
      </Transition>
    </header>
  );
}
