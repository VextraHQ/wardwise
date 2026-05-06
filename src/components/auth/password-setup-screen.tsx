"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HiCheckCircle,
  HiEye,
  HiEyeOff,
  HiExclamationCircle,
  HiKey,
  HiLockClosed,
} from "react-icons/hi";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  passwordSetupSchema,
  type PasswordSetupFormData,
} from "@/lib/schemas/auth-schemas";
import { completePasswordSetup } from "@/lib/auth/client";

interface PasswordSetupScreenProps {
  token: string;
  type: "invite" | "password_reset";
  name: string;
  email: string;
  expiresLabel: string;
}

export function PasswordSetupScreen({
  token,
  type,
  name,
  email,
  expiresLabel,
}: PasswordSetupScreenProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordSetupFormData>({
    resolver: zodResolver(passwordSetupSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordSetupFormData) => {
    setIsLoading(true);
    setError("");

    try {
      await completePasswordSetup({
        token,
        password: data.password,
      });
      setIsSuccess(true);
      window.setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to complete password setup.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isInvite = type === "invite";

  return (
    <AuthPageShell
      badge={isInvite ? "Account Activation" : "Secure Password Reset"}
      badgeIcon={HiKey}
      title={
        <>
          {isInvite ? "Set Your " : "Choose a New "}
          <span className="text-primary font-serif font-normal italic">
            Password
          </span>
        </>
      }
      description={
        isInvite
          ? "Finish your WardWise account setup with a strong password before you sign in."
          : "This secure link lets you replace your current password and protect your account."
      }
    >
      <AuthCard
        title={isInvite ? "Account Setup" : "Reset Password"}
        subtitle={isInvite ? "Email invite" : "Secure link"}
        status={isSuccess ? "Completed" : "Protected"}
        icon={isSuccess ? HiCheckCircle : HiKey}
      >
        {isSuccess ? (
          <div className="space-y-6">
            <div className="border-primary/20 bg-primary/5 rounded-sm border p-4">
              <p className="text-primary font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
                Password saved
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Your password has been updated successfully. You’ll be
                redirected to sign in in a moment.
              </p>
            </div>
            <Button
              asChild
              className="h-11 w-full rounded-sm font-mono text-[11px] font-bold tracking-[0.18em] uppercase"
            >
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert
                variant="destructive"
                className="border-destructive/30 bg-destructive/10 rounded-sm shadow-none"
              >
                <AlertDescription className="font-mono text-xs font-bold tracking-wide uppercase">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-muted/20 border-border/50 rounded-sm border px-4 py-3">
              <p className="text-foreground font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
                Account details
              </p>
              <div className="mt-2 space-y-1 text-sm">
                <p className="font-medium">{name}</p>
                <p className="text-muted-foreground">{email}</p>
                <p className="text-muted-foreground text-xs">
                  Link expires {expiresLabel}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label
                htmlFor="password"
                className="text-foreground text-xs font-bold tracking-widest uppercase"
              >
                New Password
              </Label>
              <div className="relative">
                <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-sm border">
                  <HiLockClosed className="text-muted-foreground size-3.5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  disabled={isLoading}
                  className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary h-12 rounded-sm pr-12 pl-12 font-mono text-sm font-medium transition-all"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                >
                  {showPassword ? (
                    <HiEyeOff className="size-4" aria-hidden />
                  ) : (
                    <HiEye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive font-mono text-[10px] font-medium tracking-wide uppercase">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label
                htmlFor="confirmPassword"
                className="text-foreground text-xs font-bold tracking-widest uppercase"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-sm border">
                  <HiLockClosed className="text-muted-foreground size-3.5" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  disabled={isLoading}
                  className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary h-12 rounded-sm pr-12 pl-12 font-mono text-sm font-medium transition-all"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                >
                  {showConfirmPassword ? (
                    <HiEyeOff className="size-4" aria-hidden />
                  ) : (
                    <HiEye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive font-mono text-[10px] font-medium tracking-wide uppercase">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="border-border/50 bg-muted/10 rounded-sm border px-4 py-3">
              <p className="text-foreground font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
                Password guidance
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                Use at least 8 characters with uppercase, lowercase, and a
                number. Keep it unique to WardWise.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/95 h-11 w-full rounded-sm font-mono text-[11px] font-bold tracking-[0.18em] uppercase shadow-none transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {isInvite ? "Saving Password..." : "Resetting Password..."}
                </>
              ) : isInvite ? (
                "Activate Account"
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthPageShell>
  );
}

export function PasswordSetupUnavailable({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <AuthPageShell
      badge="Access Link"
      badgeIcon={HiExclamationCircle}
      title={
        <>
          Link{" "}
          <span className="text-primary font-serif font-normal italic">
            Unavailable
          </span>
        </>
      }
      description={description}
    >
      <AuthCard
        title={title}
        subtitle="Secure link"
        status="Unavailable"
        icon={HiExclamationCircle}
      >
        <div className="space-y-6">
          <div className="border-destructive/20 bg-destructive/5 text-muted-foreground rounded-sm border p-4 text-sm leading-relaxed">
            This link may have expired, already been used, or been replaced by a
            newer secure link.
          </div>

          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              className="h-11 flex-1 rounded-sm font-mono text-[11px] font-bold tracking-[0.18em] uppercase"
            >
              <Link href="/forgot-password">Request Reset</Link>
            </Button>
            <Button
              asChild
              className="h-11 flex-1 rounded-sm font-mono text-[11px] font-bold tracking-[0.18em] uppercase"
            >
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
}
