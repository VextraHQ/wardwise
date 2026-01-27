"use client";

import { useState } from "react";
import { HiInformationCircle, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface DemoBannerProps {
  variant?: "default" | "canvasser";
  message?: React.ReactNode;
  className?: string;
}

export function DemoBanner({
  variant = "default",
  message,
  className,
}: DemoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const defaultMessage = (
    <>
      <span className="font-semibold">Demo Environment:</span> This is a
      demonstration of WardWise. All data is simulated for demonstration
      purposes.
    </>
  );

  const styles = {
    default: "bg-primary/10 border-primary/20 text-foreground",
    canvasser: "bg-amber-500/10 border-amber-500/20 text-foreground",
  };

  const iconColors = {
    default: "text-primary",
    canvasser: "text-amber-600 dark:text-amber-500",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={cn("relative z-50 border-b", styles[variant], className)}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-2.5">
              <HiInformationCircle
                className={cn("h-4 w-4 shrink-0", iconColors[variant])}
              />
              <p className="text-foreground text-xs sm:text-sm">
                {message || defaultMessage}
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground focus:ring-primary shrink-0 rounded-md p-1 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
              aria-label="Dismiss demo banner"
            >
              <HiX className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
