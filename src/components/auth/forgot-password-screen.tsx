"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HiArrowLeft,
  HiCheckCircle,
  HiExclamationCircle,
  HiKey,
  HiMail,
} from "react-icons/hi";

import { requestPasswordReset } from "@/lib/auth/client";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/schemas/auth-schemas";

export function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError("");

    try {
      await requestPasswordReset(data.email);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to start password recovery.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageShell
      badge="Account Recovery"
      badgeIcon={HiKey}
      title={
        <>
          Reset{" "}
          <span className="text-primary font-serif font-normal italic">
            Password
          </span>
        </>
      }
      description={
        isSuccess
          ? "Check your inbox for a secure password reset link."
          : "Enter your account email and we’ll send a secure link so you can choose a new password."
      }
    >
      <AuthCard
        title={isSuccess ? "Reset Link Sent" : "Password Recovery"}
        subtitle={isSuccess ? "Email dispatch" : "Secure request"}
        status={isSuccess ? "Delivered" : "Protected"}
        icon={isSuccess ? HiCheckCircle : HiKey}
      >
        {isSuccess ? (
          <div className="space-y-6">
            <div className="border-primary/20 bg-primary/5 rounded-sm border p-4">
              <p className="text-primary font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
                Check your inbox
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                If an account exists for{" "}
                <span className="font-medium">{submittedEmail}</span>, a secure
                reset link is on its way. The link expires automatically for
                your protection.
              </p>
            </div>

            <div className="text-muted-foreground text-center text-xs leading-relaxed">
              Didn&apos;t get the email? Check your spam folder first. If
              delivery is still unavailable, your campaign admin can send you a
              manual reset link.
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setSubmittedEmail("");
                }}
                variant="outline"
                className="h-11 flex-1 rounded-sm font-mono text-[11px] font-bold tracking-[0.18em] uppercase"
              >
                Request Again
              </Button>
              <Button
                asChild
                className="h-11 flex-1 rounded-sm font-mono text-[11px] font-bold tracking-[0.18em] uppercase"
              >
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="border-destructive/20 bg-destructive/5 flex gap-3 rounded-sm border p-4">
                <HiExclamationCircle className="text-destructive size-4 shrink-0" />
                <p className="text-destructive text-xs font-bold tracking-widest uppercase">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-2.5">
              <Label
                htmlFor="email"
                className="text-foreground text-xs font-bold tracking-widest uppercase"
              >
                Email Address
              </Label>
              <div className="relative">
                <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-sm border">
                  <HiMail className="text-muted-foreground size-3.5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  disabled={isLoading}
                  className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary h-12 rounded-sm pl-12 font-mono text-sm font-medium transition-all"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-destructive font-mono text-[10px] font-medium tracking-wide uppercase">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/95 h-11 w-full rounded-sm font-mono text-[11px] font-bold tracking-[0.18em] uppercase shadow-none transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        )}
      </AuthCard>

      <div className="flex items-center justify-center">
        <Link
          href="/login"
          className="group border-border/60 bg-card/50 hover:border-primary/20 hover:bg-primary/5 flex items-center gap-3 rounded-sm border px-5 py-3 transition-all active:scale-95"
        >
          <div className="bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary flex size-6 items-center justify-center rounded-sm transition-colors">
            <HiArrowLeft className="size-3" />
          </div>
          <div className="text-left">
            <span className="text-muted-foreground group-hover:text-foreground block text-[10px] font-bold tracking-widest uppercase transition-colors">
              Back to Login
            </span>
          </div>
        </Link>
      </div>
    </AuthPageShell>
  );
}
