"use client";

import React from "react";
import { motion } from "motion/react";
import { type LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface RegistrationStepHeaderProps {
  icon: LucideIcon | IconType | React.ReactNode;
  badge: string;
  title: string;
  description: string;
  className?: string;
}

function renderIcon(
  icon: LucideIcon | IconType | React.ReactNode,
): React.ReactNode {
  if (React.isValidElement(icon)) {
    const element = icon as React.ReactElement<{ className?: string }>;
    return React.cloneElement(element, {
      ...element.props,
      className: "h-3.5 w-3.5",
    });
  }

  if (icon && typeof icon === "function") {
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className="h-3.5 w-3.5" />;
  }

  return null;
}

export function RegistrationStepHeader({
  icon: Icon,
  badge,
  title,
  description,
  className,
}: RegistrationStepHeaderProps) {
  return (
    <div className={cn("mb-8 space-y-4 text-center", className)}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm">
          {renderIcon(Icon)}
          <span>{badge}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-2"
      >
        <h1 className="text-foreground from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-lg text-sm sm:text-base">
          {description}
        </p>
      </motion.div>
    </div>
  );
}
