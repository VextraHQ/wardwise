"use client";

import { useState, type InputHTMLAttributes } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function OverviewField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
        {label}
      </p>
      <p
        className={cn(
          "text-foreground text-xs font-medium wrap-break-word",
          mono && "font-mono",
        )}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export function RevealablePasswordInput({
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={isVisible ? "text" : "password"}
        className={cn("pr-11", className)}
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/40 absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        {isVisible ? (
          <IconEyeOff className="size-4" />
        ) : (
          <IconEye className="size-4" />
        )}
      </button>
    </div>
  );
}
