"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { RegistrationStepHeader } from "@/components/collect/registration-step-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconKey, IconLoader } from "@tabler/icons-react";
import { COMPANY_INFO } from "@/lib/data/legal-data";
import { useUnlockCampaignReport } from "@/hooks/use-campaign-report";

export function ReportGate({
  token,
  candidateName,
  candidateTitle,
  party,
  constituency,
  expiredSession = false,
}: {
  token: string;
  candidateName: string;
  candidateTitle: string | null;
  party: string;
  constituency: string;
  expiredSession?: boolean;
}) {
  const router = useRouter();
  const [passcode, setPasscode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const unlockMutation = useUnlockCampaignReport(token);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const digit = value.slice(-1);
    const next = [...passcode];
    next[index] = digit;
    setPasscode(next);
    setError(null);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !passcode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = [...passcode];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    setPasscode(next);
    // Focus last filled or the empty one
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  useEffect(() => {
    if (!isRefreshing) return;
    const timer = window.setTimeout(() => {
      router.refresh();
    }, 360);
    return () => window.clearTimeout(timer);
  }, [isRefreshing, router]);

  const handleUnlock = async () => {
    const code = passcode.join("");
    if (code.length !== 6) {
      setError("Enter all 6 digits");
      return;
    }

    setError(null);

    try {
      await unlockMutation.mutateAsync(code);
      setIsRefreshing(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
      setPasscode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const allFilled = passcode.every((d) => d !== "");

  if (isRefreshing) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center">
        <AuthCard
          title="Unlocking Report"
          subtitle="Campaign Insights"
          status="Protected"
          icon={IconLoader}
        >
          <div className="flex h-[300px] flex-col items-center justify-center space-y-6 text-center">
            <div className="text-primary/40 relative flex size-16 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full border-2 border-current opacity-20" />
              <div className="border-t-primary size-8 animate-spin rounded-full border-[3px] border-current" />
            </div>
            <div className="space-y-2">
              <p className="text-primary font-mono text-xs font-black tracking-widest uppercase">
                Unlocking private access
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Validating your access and loading the latest campaign data.
              </p>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center">
      <RegistrationStepHeader
        icon={IconKey}
        badge="Campaign Insights"
        title="Private Access"
        description={
          expiredSession
            ? `For your privacy, this report needs the passcode again for ${candidateName} (${party}).`
            : `Secure reporting for ${candidateName} (${party}) in ${constituency}.`
        }
      />

      <AuthCard
        title={expiredSession ? "Re-enter Passcode" : "Access Passcode"}
        subtitle="Campaign Insights"
        status={expiredSession ? "Session expired" : "Protected"}
        icon={IconKey}
      >
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto flex items-center justify-center gap-3">
              <div className="bg-primary h-px w-8" />
              <span className="text-primary text-[10px] font-black tracking-widest uppercase">
                {party}
              </span>
              <div className="bg-primary h-px w-8" />
            </div>

            <div className="flex flex-col items-center justify-center space-y-2">
              <h2 className="text-foreground text-2xl font-black tracking-tight text-balance sm:text-[2rem]">
                {candidateTitle && (
                  <span className="text-muted-foreground mr-2 text-[0.78em] font-medium">
                    {candidateTitle}
                  </span>
                )}
                {candidateName}
              </h2>
              <p className="text-muted-foreground max-w-sm text-[11px] leading-relaxed font-semibold tracking-widest text-balance uppercase">
                {constituency}
              </p>
            </div>
          </div>

          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
            {expiredSession
              ? "For your privacy, this report needs the 6-digit passcode again."
              : "This private campaign report is protected by an access code. Enter the 6-digit passcode shared by your campaign admin."}
          </p>

          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {passcode.map((digit, i) => (
              <Input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-12 w-10 rounded-sm text-center font-mono text-lg font-bold sm:h-14 sm:w-12"
                autoFocus={i === 0}
              />
            ))}
          </div>

          {error && (
            <p className="text-destructive text-sm font-medium">{error}</p>
          )}

          <Button
            className="h-10 w-full rounded-sm font-mono text-[11px] tracking-widest uppercase"
            onClick={handleUnlock}
            disabled={unlockMutation.isPending || !allFilled}
          >
            {unlockMutation.isPending ? "Unlocking..." : "Unlock Report"}
          </Button>

          <div className="space-y-2">
            <p className="text-muted-foreground text-xs leading-relaxed">
              Stays unlocked on this device for 24 hours.
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Trouble accessing it? Contact your campaign admin or{" "}
              <Link
                href={`/contact?email=${encodeURIComponent(COMPANY_INFO.supportEmail)}`}
                className="text-primary decoration-primary/30 font-semibold underline underline-offset-4"
              >
                WardWise Support
              </Link>
              .
            </p>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}
