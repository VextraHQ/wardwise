"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Transition } from "@headlessui/react";
import {
  Bars3Icon,
  MapIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export function VoterHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-border border-b backdrop-blur transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="WardWise home"
          >
            <span className="relative flex size-12 items-center justify-center">
              <span className="border-border bg-card absolute inset-0 rounded-full border" />
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

          <div className="hidden items-center gap-6 lg:flex">
            <div className="border-primary/20 bg-primary/10 text-accent flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium">
              <ShieldCheckIcon className="size-4" />
              <span>Secure Registration</span>
            </div>
          </div>

          <button
            className="border-border bg-card/90 text-foreground hover:border-primary hover:text-accent inline-flex items-center justify-center rounded-lg border p-2 transition duration-300 lg:hidden"
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
          <div className="border-border bg-card border-b px-6 pt-4 pb-6">
            <div className="flex flex-col gap-4">
              <div className="border-primary/20 bg-primary/10 text-accent flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium">
                <ShieldCheckIcon className="size-4" />
                <span>Secure & Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </header>
  );
}
