"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HiArrowLeft,
  HiEye,
  HiEyeOff,
  HiLockClosed,
  HiMail,
  HiShieldCheck,
  HiUser,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import { track } from "@/lib/analytics/client";
import { loginWithCredentials } from "@/lib/auth/client";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth-schemas";

type LoginScreenProps = {
  callbackUrl?: string;
};

export function LoginScreen({ callbackUrl }: LoginScreenProps) {
  const isSubmittingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsLoading(true);
    setError("");
    track("login_submitted", { has_remember_me: data.rememberMe });

    try {
      const result = await loginWithCredentials({
        ...data,
        rememberMe: data.rememberMe ?? false,
        callbackUrl,
      });

      if (!result.ok) {
        track("login_failed", { error_category: result.error.toLowerCase() });
        setError(result.error);
        return;
      }

      track("login_succeeded", { role: result.role ?? "pending" });
      window.location.replace(result.redirectTo);
    } catch {
      track("login_failed", { error_category: "unknown" });
      setError("We hit an unexpected error. Please try again.");
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <AuthPageShell
      badge="Candidate & Admin Portal"
      title={
        <>
          Welcome{" "}
          <span className="text-primary font-serif font-normal italic">
            Back
          </span>
        </>
      }
      description="Sign in to access your WardWise dashboard with secure, role-based access controls."
    >
      <AuthCard
        title="Secure Access"
        subtitle="Role-aware sign in"
        status="Protected"
        icon={HiShieldCheck}
      >
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
                autoComplete="username"
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

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-foreground text-xs font-bold tracking-widest uppercase"
              >
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-primary hover:text-primary/80 text-[10px] font-bold tracking-widest uppercase transition-colors hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-sm border">
                <HiLockClosed className="text-muted-foreground size-3.5" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••••"
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

          <div className="hover:bg-muted/5 flex items-center space-x-2.5 rounded-sm border border-transparent py-2 transition-colors">
            <Checkbox
              id="remember"
              className="border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              onCheckedChange={(checked) => {
                setValue("rememberMe", checked === true, {
                  shouldDirty: true,
                });
              }}
            />
            <div className="flex items-center gap-1.5">
              <Label
                htmlFor="remember"
                className="text-muted-foreground cursor-pointer text-xs font-medium tracking-wide"
              >
                Keep me signed in on this device
              </Label>
              <Popover>
                <PopoverTrigger
                  type="button"
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-primary mt-0.5 rounded-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
                >
                  <HiOutlineInformationCircle className="size-4" />
                  <span className="sr-only">Session policy details</span>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  sideOffset={8}
                  className="w-auto max-w-[230px] rounded-sm border px-3 py-2 text-center font-sans text-[11px] leading-relaxed font-medium shadow-sm"
                >
                  For your security, standard sign-ins use short sessions. This
                  extends your active window on this local device only.
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/95 h-11 w-full rounded-sm font-mono text-[11px] font-bold tracking-[0.18em] uppercase shadow-none transition-all active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </AuthCard>

      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="group border-border/60 bg-card/50 hover:border-primary/20 hover:bg-primary/5 flex items-center gap-3 rounded-sm border px-5 py-3 transition-all active:scale-95"
        >
          <div className="bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary flex size-6 items-center justify-center rounded-sm transition-colors">
            <HiArrowLeft className="size-3" />
          </div>
          <div className="text-left">
            <span className="text-muted-foreground group-hover:text-foreground block text-[10px] font-bold tracking-widest uppercase transition-colors">
              Back to Home
            </span>
          </div>
        </Link>

        <Link
          href="/contact"
          className="group border-border/60 bg-card/50 hover:border-primary/20 hover:bg-primary/5 flex items-center gap-3 rounded-sm border px-5 py-3 transition-all active:scale-95"
        >
          <div className="bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary flex size-6 items-center justify-center rounded-sm transition-colors">
            <HiUser className="size-3" />
          </div>
          <div className="text-left">
            <span className="text-muted-foreground group-hover:text-foreground block text-[10px] font-bold tracking-widest uppercase transition-colors">
              Contact Us
            </span>
          </div>
        </Link>
      </div>
    </AuthPageShell>
  );
}
