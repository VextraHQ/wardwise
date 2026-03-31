"use client";

import { HiShieldCheck } from "react-icons/hi";
import { motion } from "motion/react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import type { IconType } from "react-icons";

export interface HeaderProps {
  badge?: string;
  badgeIcon?: IconType;
  variant?: "primary" | "amber";
  className?: string;
}

const variantStyles = {
  primary: {
    badge: "border-primary/20 bg-primary/5",
    icon: "text-primary",
    text: "text-foreground",
  },
  amber: {
    badge: "border-amber-500/20 bg-amber-500/5",
    icon: "text-amber-600",
    text: "text-foreground",
  },
};

export function Header({
  badge,
  badgeIcon: BadgeIcon = HiShieldCheck,
  variant = "primary",
  className,
}: HeaderProps) {
  const styles = variantStyles[variant];

  return (
    <header className={cn("sticky top-0 z-50 w-full", className)}>
      <div className="bg-background/80 border-border/40 border-b backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Logo />

          {badge && (
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "hidden items-center gap-3 rounded-xl border px-4 py-2 sm:flex",
                  styles.badge,
                )}
              >
                <div className="flex items-center gap-1.5">
                  <BadgeIcon className={cn("size-4", styles.icon)} />
                  <span
                    className={cn(
                      "text-[10px] font-black tracking-tight uppercase",
                      styles.text,
                    )}
                  >
                    {badge}
                  </span>
                </div>
              </motion.div>

              {/* Mobile badge icon only */}
              <div className="sm:hidden">
                <BadgeIcon className={cn("size-5", styles.icon)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
