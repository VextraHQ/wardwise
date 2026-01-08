"use client";

import Link from "next/link";
import { HiMap, HiShieldCheck } from "react-icons/hi";
import { motion } from "motion/react";

export function VoterHeader() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-background/80 border-border/40 border-b backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link
            href="/"
            className="group flex items-center gap-3.5"
            aria-label="WardWise home"
          >
            <div className="border-primary/20 bg-primary/5 text-primary flex h-10 w-10 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11">
              <HiMap className="h-6 w-6" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-foreground text-lg font-black tracking-tight sm:text-xl">
                WardWise
              </span>
              <span className="text-muted-foreground truncate text-[10px] font-medium sm:text-[10.5px]">
                Civic Intelligence Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="border-primary/20 bg-primary/5 hidden items-center gap-3 rounded-xl border px-4 py-2 sm:flex"
            >
              <div className="flex items-center gap-1.5">
                <HiShieldCheck className="text-primary size-4" />
                <span className="text-foreground text-[10px] font-black tracking-tight uppercase">
                  Voter Portal
                </span>
              </div>
            </motion.div>

            <div className="sm:hidden">
              <HiShieldCheck className="text-primary size-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
