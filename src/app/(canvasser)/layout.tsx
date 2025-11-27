"use client";

import { ReactNode } from "react";
import { CanvasserHeader } from "@/components/canvasser/canvasser-header";
import { DemoBanner } from "@/components/landing/demo-banner";
import { VoterFooter } from "@/components/voter/voter-footer";

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
      <main className="flex-1">{children}</main>
      <VoterFooter />
    </div>
  );
}
