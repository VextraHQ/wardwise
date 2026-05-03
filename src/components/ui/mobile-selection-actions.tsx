"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function MobileBulkActionTray({
  summary,
  supportingText,
  summaryAction,
  children,
  className,
  containerClassName,
}: {
  summary: React.ReactNode;
  supportingText?: React.ReactNode;
  summaryAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  const trayRef = React.useRef<HTMLDivElement | null>(null);
  const [reservedHeight, setReservedHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    const node = trayRef.current;
    if (!node) return;

    const updateHeight = () => {
      setReservedHeight(Math.ceil(node.getBoundingClientRect().height));
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="md:hidden"
        style={
          reservedHeight > 0 ? { height: `${reservedHeight}px` } : undefined
        }
      />
      <div
        ref={trayRef}
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden",
          containerClassName,
        )}
      >
        <div
          className={cn(
            "border-border/60 bg-background/95 pointer-events-auto mx-auto max-w-screen-sm rounded-sm border shadow-[0_-8px_30px_rgb(0,0,0,0.06)] backdrop-blur",
            className,
          )}
        >
          <div className="border-border/60 flex min-w-0 items-start justify-between gap-3 border-b px-3 py-2.5">
            <div className="min-w-0 space-y-1">
              <p className="text-foreground text-sm font-semibold tracking-tight">
                {summary}
              </p>
              {supportingText ? (
                <div className="text-primary text-xs font-medium">
                  {supportingText}
                </div>
              ) : null}
            </div>
            {summaryAction}
          </div>

          <div className="grid min-w-0 gap-2 p-3">{children}</div>
        </div>
      </div>
    </>
  );
}

export { MobileBulkActionTray };
