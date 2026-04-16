"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorTestPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("Manual WardWise 500 preview error");
  }

  return (
    <main className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="border-border/80 bg-card w-full max-w-md space-y-4 rounded-sm border p-6 text-center shadow-none">
        <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
          Dev Preview
        </p>
        <h1 className="text-foreground text-2xl font-bold">
          500 Error Screen Test
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Click the button below to trigger the app error boundary. This route
          is temporary and can be deleted after reviewing the 500 state.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
          onClick={() => setShouldThrow(true)}
        >
          Trigger 500 Preview
        </Button>
      </div>
    </main>
  );
}
