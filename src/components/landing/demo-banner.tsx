"use client";

import { useState } from "react";
import { HiInformationCircle, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "motion/react";

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-primary/10 border-primary/20 text-foreground relative z-50 border-b"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-2.5">
              <HiInformationCircle className="text-primary h-4 w-4 shrink-0" />
              <p className="text-foreground text-xs sm:text-sm">
                <span className="font-semibold">Demo Environment:</span> This is
                a demonstration of WardWise. NIN verification and data are
                mocked for testing purposes.
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
