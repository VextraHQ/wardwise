"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRegistration } from "@/hooks/use-registration";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DuplicateStep() {
  const { payload, setStep, setSwitching } = useRegistration();
  const phone = payload.phone as string;
  const constituency = `${payload.location?.state ?? ""}-${payload.location?.lga ?? ""}-${payload.location?.ward ?? ""}`;
  const electionYear = payload.electionYear;

  const check = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/register/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, constituency, electionYear }),
      });
      if (!res.ok) throw new Error("Check failed");
      return res.json();
    },
    onSuccess: (data: { exists: boolean; candidateId?: string }) => {
      if (data.exists) {
        setSwitching(true);
        toast.message("Already registered.", {
          description: "You may switch candidate once.",
        });
      }
    },
  });

  useEffect(() => {
    if (phone && constituency && electionYear) {
      check.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        We will ensure your phone is not already registered for this
        constituency in the current election cycle.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => setStep("otp")}>
          Back
        </Button>
        <Button onClick={() => setStep("basic")}>Continue</Button>
      </div>
      <div role="alert" aria-live="polite" className="text-amber-700">
        If already registered, you'll see an option later to switch your
        candidate one-time.
      </div>
    </div>
  );
}
