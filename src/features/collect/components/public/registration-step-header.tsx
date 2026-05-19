"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface RegistrationStepHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export function RegistrationStepHeader({
  title,
  description,
  className,
}: RegistrationStepHeaderProps) {
  return (
    <div
      className={cn(
        "mb-3 space-y-2 text-center sm:mb-4 sm:space-y-2.5",
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="space-y-2 sm:space-y-2.5"
      >
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {title.includes(" ") ? (
            <>
              {title.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-primary font-serif font-normal italic">
                {title.split(" ").slice(-1)}
              </span>
            </>
          ) : (
            title
          )}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-lg text-[13px] leading-relaxed font-medium sm:text-base">
          {description}
        </p>
      </motion.div>
    </div>
  );
}
