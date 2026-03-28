"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  HiMail,
  HiArrowLeft,
  HiKey,
  HiCheckCircle,
  HiExclamationCircle,
  HiHome,
} from "react-icons/hi";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Header } from "@/components/layout/header";
import { AuthCard } from "@/components/auth/auth-card";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/schemas/auth-schemas";

export default function ForgotPasswordPage() {
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
      // TODO: Implement actual password reset API call
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: data.email }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Header badge="Account Recovery" />

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-md space-y-6">
          {/* Hero Section */}
          <div className="space-y-3 text-center">
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Reset{" "}
              <span className="text-primary font-serif font-normal italic">
                Password
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-xl text-base sm:text-lg">
              {isSuccess
                ? "Check your inbox for reset instructions"
                : "Enter your email to receive a reset link"}
            </p>
          </div>

          {/* Forgot Password Card */}
          <AuthCard
            title={isSuccess ? "Email Sent" : "Password Recovery"}
            subtitle={isSuccess ? "Reset Link" : "Account Recovery"}
            status={isSuccess ? "Delivered" : "Secure"}
            icon={isSuccess ? HiCheckCircle : HiKey}
          >
            {isSuccess ? (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="border-brand-emerald/20 bg-brand-emerald/5 flex gap-3 rounded-xl border p-4">
                  <HiCheckCircle className="text-brand-lagoon size-4 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-brand-lagoon text-xs font-bold tracking-widest uppercase">
                      Reset Link Sent
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                      We&apos;ve sent a password reset link to {submittedEmail}.
                      Please check your inbox and spam folder.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-muted-foreground text-center text-xs leading-relaxed font-medium">
                    Didn&apos;t receive the email? Check your spam folder or
                    wait a few minutes before requesting another link.
                  </p>

                  <Button
                    onClick={() => {
                      setIsSuccess(false);
                      setSubmittedEmail("");
                    }}
                    variant="outline"
                    className="h-11 w-full rounded-xl text-xs font-bold tracking-widest uppercase"
                  >
                    Request Again
                  </Button>
                </div>

                <div className="text-muted-foreground mt-6 text-center text-xs font-medium tracking-widest uppercase">
                  <Link
                    href="/login"
                    className="text-primary font-bold underline-offset-4 hover:underline"
                  >
                    Back to login
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="border-destructive/20 bg-destructive/5 flex gap-3 rounded-xl border p-4">
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
                    <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
                      <HiMail className="text-muted-foreground size-3.5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      disabled={isLoading}
                      className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary h-12 pl-12 font-mono text-sm font-medium transition-all"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-destructive font-mono text-[10px] font-medium tracking-wide uppercase">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {isLoading ? (
                  <div className="bg-primary/5 border-primary/20 flex flex-col items-center justify-center gap-3 rounded-xl border py-6">
                    <Loader2 className="text-primary size-5 animate-spin" />
                    <div className="text-center">
                      <p className="text-foreground text-xs font-bold tracking-wider uppercase">
                        Sending Reset Link
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <div className="bg-primary/60 size-1.5 animate-pulse rounded-[1px]" />
                        <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                          Email Dispatch{" "}
                          <span className="text-primary/40 mx-1">|</span>{" "}
                          Processing
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/95 h-11 w-full rounded-xl text-xs font-bold tracking-widest uppercase shadow-sm transition-all active:scale-95"
                  >
                    Send Reset Link
                  </Button>
                )}

                <div className="text-muted-foreground mt-6 text-center text-xs font-medium tracking-widest uppercase">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-primary font-bold underline-offset-4 hover:underline"
                  >
                    Login here
                  </Link>
                </div>
              </form>
            )}
          </AuthCard>

          {/* Utility Navigation */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="group border-border/60 bg-card/50 hover:border-primary/20 hover:bg-primary/5 flex items-center gap-3 rounded-xl border px-5 py-3 transition-all hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] active:scale-95"
            >
              <div className="bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary flex size-6 items-center justify-center rounded-md transition-colors">
                <HiArrowLeft className="size-3" />
              </div>
              <span className="text-muted-foreground group-hover:text-foreground text-[10px] font-bold tracking-widest uppercase transition-colors">
                Back to Login
              </span>
            </Link>

            <Link
              href="/"
              className="group border-border/60 bg-card/50 hover:border-primary/20 hover:bg-primary/5 flex items-center gap-3 rounded-xl border px-5 py-3 transition-all hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] active:scale-95"
            >
              <div className="bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary flex size-6 items-center justify-center rounded-md transition-colors">
                <HiHome className="size-3" />
              </div>
              <span className="text-muted-foreground group-hover:text-foreground text-[10px] font-bold tracking-widest uppercase transition-colors">
                Back to Home
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
