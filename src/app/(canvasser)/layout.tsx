"use client";

import { type ReactNode } from "react";
import { CanvasserHeader } from "@/components/canvasser/canvasser-header";
import { CanvasserNavigation } from "@/components/canvasser/canvasser-mobile-navigation";
import { CanvasserFooter } from "@/components/canvasser/canvasser-footer";
import { DemoBanner } from "@/components/landing/demo-banner";

export default function CanvasserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <DemoBanner
        variant="canvasser"
        message={
          <>
            <span className="font-semibold">Demo Preview:</span> This is a
            mockup of the Canvasser Portal - a separate app for field agents
          </>
        }
      />
      <CanvasserHeader />
      <main className="flex-1 pb-20 sm:pb-0">{children}</main>
      {/* Mobile Bottom Navigation */}
      <CanvasserNavigation />
      {/* Desktop Footer - hidden on mobile since we have bottom nav */}
      <div className="hidden sm:block">
        <CanvasserFooter />
      </div>
    </div>
  );
}
