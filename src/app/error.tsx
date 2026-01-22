"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HiHome, HiRefresh } from "react-icons/hi";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed like Sentry, Bugsnag, etc.
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background relative flex min-h-screen w-full flex-col items-center justify-center p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.07]">
        <div className="relative h-[600px] w-[600px]">
          <div className="border-destructive/60 absolute inset-0 rounded-full border" />
          <div className="border-destructive/40 absolute inset-12 rounded-full border border-dashed" />
          <div className="bg-destructive/20 absolute top-1/2 left-0 h-px w-full" />
          <div className="bg-destructive/20 absolute top-0 left-1/2 h-full w-px" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="bg-card border-border/80 relative overflow-hidden border">
          <div className="border-destructive/80 absolute top-0 left-0 size-5 border-t border-l" />
          <div className="border-destructive/80 absolute top-0 right-0 size-5 border-t border-r" />
          <div className="border-destructive/80 absolute bottom-0 left-0 size-5 border-b border-l" />
          <div className="border-destructive/80 absolute right-0 bottom-0 size-5 border-r border-b" />

          <div className="absolute top-3 right-4 flex items-center gap-2 opacity-50">
            <div className="bg-destructive h-1 w-1 rounded-full" />
            <span className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
              Err_Protocol_500
            </span>
          </div>

          <div className="px-6 py-12 sm:px-12 sm:py-16">
            <div className="flex flex-col items-center text-center">
              <div className="mb-8">
                <h1 className="text-destructive/10 font-mono text-9xl leading-none font-black tracking-tighter select-none sm:text-[10rem]">
                  500
                </h1>
              </div>

              <div className="space-y-4">
                <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                  System Malfunction
                </h2>
                <p className="text-muted-foreground mx-auto max-w-sm text-base leading-relaxed">
                  We encountered an unexpected error. Our systems have logged
                  this event. Please try again.
                </p>
              </div>

              <div className="mt-12 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  onClick={reset}
                  variant="destructive"
                  className="h-11 min-w-[140px] gap-2 rounded-lg text-xs font-bold tracking-widest uppercase shadow-none ring-offset-2"
                >
                  <HiRefresh className="size-4" />
                  Retry System
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-border hover:bg-muted/50 h-11 min-w-[140px] gap-2 rounded-lg text-xs font-bold tracking-widest uppercase shadow-none"
                >
                  <Link href="/">
                    <HiHome className="size-4" />
                    Return Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-1">
          <span className="text-muted-foreground font-mono text-[9px]">
            WW-SYS-500
          </span>
          <span className="text-muted-foreground font-mono text-[9px]">
            :: CRITICAL_FAILURE
          </span>
        </div>
      </div>
    </div>
  );
}
