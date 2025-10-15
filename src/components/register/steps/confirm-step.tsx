"use client";

import { useMutation } from "@tanstack/react-query";
import { useRegistration } from "@/hooks/use-registration";
import { registrationSchema } from "@/lib/registration-schemas";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ConfirmStep() {
  const { payload, setStep, reset, isSwitching } = useRegistration();

  const submit = useMutation({
    mutationFn: async () => {
      const parsed = registrationSchema.safeParse(payload);
      if (!parsed.success) throw new Error("Invalid payload");
      const url = isSwitching
        ? "/api/register/switch-candidate"
        : "/api/register/submit";
      const body = isSwitching
        ? {
            phone: parsed.data.phone,
            constituency: `${parsed.data.location.state}-${parsed.data.location.lga}-${parsed.data.location.ward}`,
            electionYear: parsed.data.electionYear,
            newCandidateId: parsed.data.candidate.candidateId,
          }
        : parsed.data;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to submit");
      return res.json();
    },
    onSuccess: () => {
      toast.success(
        isSwitching
          ? "Candidate switched successfully."
          : "Registration complete. Thank you!",
      );
      if (typeof window !== "undefined") {
        window.location.href = "/register/complete";
      }
      reset();
      setStep("otp");
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Submission failed");
    },
  });

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Review your details and submit. Your support will be sent to your
        selected candidate's dashboard.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => setStep("survey")}>
          Back
        </Button>
        <Button onClick={() => submit.mutate()} disabled={submit.isPending}>
          Submit
        </Button>
      </div>
    </div>
  );
}
