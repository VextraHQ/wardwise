"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Transition } from "@headlessui/react";
import { HiArrowLeft, HiLockClosed, HiMenu, HiX } from "react-icons/hi";
import { useSession } from "next-auth/react";
import { Logo } from "@/components/shared/logo";
import {
  homepageSectionNav,
  publicProductLink,
  publicSiteLinks,
  publicSiteCta,
} from "@/features/public-site/lib/public-nav";
import { useClickOutside } from "@/hooks/shared/use-click-outside";
import { cn } from "@/lib/utils";

type MarketingHeaderProps = {
  className?: string;
  /** Full nav on home/product pages; slim back bar on contact, support, legal. */
  variant?: "marketing" | "back";
};

function getSessionHref(role: string | undefined): string {
  if (role === "candidate") return "/dashboard";
  if (role === "admin") return "/admin";
  return "/login";
}

function getSessionLabel(role: string | undefined): string {
  if (role === "candidate") return "Dashboard";
  if (role === "admin") return "Admin Dashboard";
  return "Login";
}

function HeaderAuthLink({
  status,
  session,
  anonymousHref = "/admin",
  anonymousLabel = "Workspace Login",
}: {
  status: string;
  session: ReturnType<typeof useSession>["data"];
  anonymousHref?: string;
  anonymousLabel?: string;
}) {
  if (status === "loading") {
    return (
      <div className="text-muted-foreground/50 flex cursor-wait items-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase">
        <div className="outline-primary size-3 animate-spin rounded-full border border-t-transparent outline-1" />
        <span className="hidden sm:inline">Verifying...</span>
      </div>
    );
  }

  if (status === "authenticated" && session?.user) {
    return (
      <Link
        href={getSessionHref(session.user.role)}
        className="text-muted-foreground hover:text-foreground flex items-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase transition-colors"
      >
        <div className="bg-brand-emerald size-1.5 animate-pulse rounded-full" />
        <span className="max-w-[140px] truncate">
          {getSessionLabel(session.user.role)}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={anonymousHref}
      className="text-muted-foreground hover:text-foreground flex items-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase transition-colors"
    >
      <HiLockClosed className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="shrink-0 whitespace-nowrap">{anonymousLabel}</span>
    </Link>
  );
}

export function MarketingHeader({
  className,
  variant = "marketing",
}: MarketingHeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  const isProductActive =
    pathname === publicProductLink.href ||
    pathname?.startsWith(`${publicProductLink.href}/`);
  const isHomepage = pathname === "/";

  useClickOutside(mobileMenuRef, () => setIsMobileOpen(false), {
    active: variant === "marketing" && isMobileOpen,
    ignoreRefs: [toggleRef],
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const barClassName = cn(
    "relative z-50 transition-all duration-300",
    scrolled || (variant === "marketing" && isMobileOpen)
      ? "border-border bg-background border-b backdrop-blur-md"
      : "bg-background/80 border-b border-transparent backdrop-blur-md",
  );

  if (variant === "back") {
    return (
      <div className="sticky top-0 z-50 w-full">
        <header className={cn("relative w-full", className)}>
          <div className={barClassName}>
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
              <Logo size="lg" />
              <div className="flex items-center gap-3 sm:gap-5">
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase transition-colors"
                >
                  <HiArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Home</span>
                </Link>
                <span className="bg-border h-4 w-px" aria-hidden />
                <HeaderAuthLink
                  status={status}
                  session={session}
                  anonymousHref="/admin"
                  anonymousLabel="Workspace Login"
                />
              </div>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className={cn("relative w-full", className)}>
        <div className={barClassName}>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
            <Logo size="lg" />

            <nav
              aria-label="Public site"
              className="hidden min-w-0 flex-1 items-center justify-center lg:flex"
            >
              <div className="flex min-w-0 flex-wrap items-center justify-center gap-0.5 xl:gap-1">
                {isHomepage ? (
                  <>
                    <Link
                      href={publicProductLink.href}
                      className="group relative flex shrink-0 flex-col items-center px-2 py-2 xl:px-3"
                    >
                      <span
                        className={cn(
                          "hidden font-mono text-[8px] font-black tracking-[0.28em] uppercase transition-colors xl:inline-block",
                          isProductActive
                            ? "text-primary/70"
                            : "text-muted-foreground/45 group-hover:text-primary/60",
                        )}
                      >
                        {publicProductLink.meta}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[9px] font-black tracking-widest uppercase transition-colors xl:text-[10px]",
                          isProductActive
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      >
                        {publicProductLink.label}
                      </span>
                      <span
                        className={cn(
                          "bg-primary absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-opacity",
                          isProductActive
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100",
                        )}
                        aria-hidden
                      />
                    </Link>

                    {homepageSectionNav.map((link, i) => (
                      <a
                        key={link.section}
                        href={link.href}
                        className="group relative flex shrink-0 flex-col items-center px-2 py-2 xl:px-3"
                      >
                        <span className="text-muted-foreground/45 group-hover:text-primary/60 hidden font-mono text-[8px] font-black tracking-[0.28em] transition-colors xl:inline-block">
                          0{i + 1}
                        </span>
                        <span className="text-muted-foreground group-hover:text-foreground font-mono text-[9px] font-black tracking-widest uppercase transition-colors xl:text-[10px]">
                          {link.label}
                        </span>
                        <span
                          className="bg-primary absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden
                        />
                      </a>
                    ))}
                  </>
                ) : (
                  publicSiteLinks.map((link) => {
                    const isActive =
                      pathname === link.href ||
                      pathname?.startsWith(`${link.href}/`);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="group relative flex shrink-0 flex-col items-center px-2 py-2 xl:px-3"
                      >
                        <span
                          className={cn(
                            "hidden font-mono text-[8px] font-black tracking-[0.28em] uppercase transition-colors xl:inline-block",
                            isActive
                              ? "text-primary/70"
                              : "text-muted-foreground/45 group-hover:text-primary/60",
                          )}
                        >
                          {link.meta}
                        </span>
                        <span
                          className={cn(
                            "font-mono text-[9px] font-black tracking-widest uppercase transition-colors xl:text-[10px]",
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground group-hover:text-foreground",
                          )}
                        >
                          {link.label}
                        </span>
                        <span
                          className={cn(
                            "bg-primary absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-opacity",
                            isActive
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100",
                          )}
                          aria-hidden
                        />
                      </Link>
                    );
                  })
                )}
              </div>
            </nav>

            <div className="hidden shrink-0 items-center gap-3 lg:flex xl:gap-5">
              <HeaderAuthLink
                status={status}
                session={session}
                anonymousHref="/admin"
                anonymousLabel="Workspace Login"
              />
              <Link
                href={publicSiteCta.href}
                className="bg-primary text-primary-foreground hover:bg-primary/95 shrink-0 rounded-full px-4 py-2 font-mono text-[9px] font-black tracking-widest whitespace-nowrap uppercase transition-transform active:scale-95 xl:px-5 xl:py-2.5 xl:text-[10px]"
              >
                {publicSiteCta.label}
              </Link>
            </div>

            <button
              className="border-border bg-card/90 text-foreground hover:border-primary hover:text-primary inline-flex shrink-0 items-center justify-center rounded-sm border p-2 transition-colors duration-200 lg:hidden"
              type="button"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={isMobileOpen}
              ref={toggleRef}
            >
              {isMobileOpen ? (
                <HiX className="h-5 w-5" />
              ) : (
                <HiMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <Transition
        show={isMobileOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="from-background/70 via-background/55 to-background/40 absolute inset-x-0 top-full z-30 h-[200vh] bg-linear-to-b backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden={true}
        />
      </Transition>

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
        <div className="absolute inset-x-0 top-full z-40 lg:hidden">
          <div
            className="border-border bg-card/95 max-h-[min(85vh,640px)] overflow-y-auto border-b px-6 pt-4 pb-6"
            ref={mobileMenuRef}
          >
            <nav
              aria-label="Public site (mobile)"
              className="flex flex-col gap-1"
            >
              {isHomepage ? (
                <>
                  <Link
                    href={publicProductLink.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "hover:bg-muted rounded-sm px-3 py-2.5 font-mono text-xs font-bold tracking-widest uppercase transition-colors",
                      isProductActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:text-foreground",
                    )}
                  >
                    <span className="text-muted-foreground/50 mr-2 text-[10px] font-black">
                      {publicProductLink.meta}
                    </span>
                    {publicProductLink.label}
                  </Link>

                  {homepageSectionNav.map((link, i) => (
                    <a
                      key={link.section}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className="text-foreground/80 hover:bg-muted hover:text-foreground rounded-sm px-3 py-2.5 font-mono text-xs font-bold tracking-widest uppercase transition-colors"
                    >
                      <span className="text-muted-foreground/50 mr-2 text-[10px]">
                        0{i + 1}
                      </span>
                      {link.label}
                    </a>
                  ))}
                </>
              ) : (
                publicSiteLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    pathname?.startsWith(`${link.href}/`);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "hover:bg-muted rounded-sm px-3 py-2.5 font-mono text-xs font-bold tracking-widest uppercase transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:text-foreground",
                      )}
                    >
                      <span className="text-muted-foreground/50 mr-2 text-[10px] font-black">
                        {link.meta}
                      </span>
                      {link.label}
                    </Link>
                  );
                })
              )}
            </nav>

            <div className="mt-5 flex flex-col gap-2.5 border-t pt-5">
              {status === "loading" ? (
                <div className="border-border text-foreground/50 bg-muted/10 flex cursor-wait items-center justify-center gap-2 rounded-sm border px-4 py-3 text-center text-sm font-semibold">
                  <div className="border-primary size-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Validating...
                </div>
              ) : status === "authenticated" && session?.user ? (
                <Link
                  href={getSessionHref(session.user.role)}
                  className="border-border text-foreground hover:bg-foreground hover:text-background rounded-sm border px-4 py-3 text-center text-sm font-semibold transition-colors duration-200 hover:border-transparent"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {getSessionLabel(session.user.role)}
                </Link>
              ) : (
                <Link
                  href="/admin"
                  className="border-primary/30 text-primary hover:bg-primary/5 rounded-sm border px-4 py-2.5 text-center text-sm font-medium transition-colors duration-200"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Workspace Login
                </Link>
              )}
              <Link
                href={publicSiteCta.href}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-3 text-center text-sm font-bold transition-all duration-200"
                onClick={() => setIsMobileOpen(false)}
              >
                {publicSiteCta.label}
              </Link>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}
