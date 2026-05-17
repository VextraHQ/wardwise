"use client";

import { motion } from "motion/react";
import { HiShieldCheck } from "react-icons/hi";
import { Logo } from "@/components/layout/logo";

export function ReportSiteHeader() {
  return (
    <header className="sticky top-0 z-50 h-(--report-site-header-height) w-full">
      <div className="bg-background/80 border-border/40 h-full border-b backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <Logo />

          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="border-primary/20 bg-primary/5 hidden items-center gap-1.5 rounded-sm border px-4 py-2 sm:flex"
            >
              <HiShieldCheck className="text-primary size-4" />
              <span className="text-foreground text-[10px] font-black tracking-tight uppercase">
                Private Campaign Report
              </span>
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
