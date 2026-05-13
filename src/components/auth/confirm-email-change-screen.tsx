"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { HiCheckCircle, HiKey, HiMail } from "react-icons/hi";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ConfirmEmailChangeScreenProps = {
  token: string;
  targetEmail: string;
  expiresLabel: string;
};

export function ConfirmEmailChangeScreen({
  token,
  targetEmail,
  expiresLabel,
}: ConfirmEmailChangeScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/confirm-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        let message = "Could not confirm the email change.";
        try {
          const body = (await response.json()) as { error?: string };
          if (body?.error) message = body.error;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      setIsSuccess(true);
      window.setTimeout(() => {
        void signOut({ callbackUrl: "/login?notice=email-changed" });
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not confirm the email change.",
      );
      setIsLoading(false);
    }
  };

  return (
    <AuthPageShell
      badge="Admin Email Change"
      badgeIcon={HiKey}
      title={
        <>
          Confirm{" "}
          <span className="text-primary font-serif font-normal italic">
            Email
          </span>
        </>
      }
      description="Verify the new sign-in email for your WardWise admin account."
    >
      <AuthCard
        title="Confirm Email Change"
        subtitle="Verified switch"
        status={isSuccess ? "Confirmed" : "Pending"}
        icon={isSuccess ? HiCheckCircle : HiMail}
      >
        {isSuccess ? (
          <div className="space-y-6">
            <div className="border-primary/20 bg-primary/5 rounded-sm border p-4">
              <p className="text-primary font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
                Email updated
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Your sign-in email is now{" "}
                <span className="font-medium">{targetEmail}</span>. Redirecting
                you to sign in…
              </p>
            </div>
            <Button
              asChild
              className="h-11 w-full rounded-sm font-mono text-[11px] font-bold tracking-[0.18em] uppercase"
            >
              <Link href="/login?notice=email-changed">Go to Login</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {error ? (
              <Alert
                variant="destructive"
                className="border-destructive/30 bg-destructive/10 rounded-sm shadow-none"
              >
                <AlertDescription className="font-mono text-xs font-bold tracking-wide uppercase">
                  {error}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="bg-muted/20 border-border/50 rounded-sm border px-4 py-3">
              <p className="text-foreground font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
                New sign-in email
              </p>
              <p className="mt-2 text-sm font-medium wrap-anywhere">
                {targetEmail}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Link expires {expiresLabel}
              </p>
            </div>

            <div className="border-border/50 bg-muted/10 rounded-sm border px-4 py-3">
              <p className="text-foreground font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
                What happens next
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                Confirming this change replaces your sign-in email and signs you
                out of all sessions. You&apos;ll need to sign in again with the
                new email.
              </p>
            </div>

            <Button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/95 h-11 w-full rounded-sm font-mono text-[11px] font-bold tracking-[0.18em] uppercase shadow-none transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Confirming…
                </>
              ) : (
                "Confirm email change"
              )}
            </Button>
          </div>
        )}
      </AuthCard>
    </AuthPageShell>
  );
}
