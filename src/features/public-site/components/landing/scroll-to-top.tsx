"use client";

import { useEffect, useState } from "react";
import { HiArrowUp } from "react-icons/hi";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed right-6 bottom-6 z-50 lg:right-8 lg:bottom-8"
        >
          <Button
            onClick={scrollToTop}
            size="icon-lg"
            className={cn(
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "rounded-full shadow-lg transition-all duration-200",
              "hover:scale-110 active:scale-95",
            )}
            aria-label="Scroll to top"
          >
            <HiArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
