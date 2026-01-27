"use client";

import { useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HiMail,
  HiLockClosed,
  HiArrowLeft,
  HiShieldCheck,
  HiUser,
  HiEye,
  HiEyeOff,
} from "react-icons/hi";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { AuthCard } from "@/components/auth/auth-card";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth-schemas";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === "candidate") {
        router.push("/dashboard");
      } else if (session.user.role === "admin") {
        router.push("/admin");
      }
    }
  }, [status, session, router]);

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
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Check user role and redirect accordingly
        const session = await getSession();
        if (session?.user?.role === "candidate") {
          router.push("/dashboard");
        } else if (session?.user?.role === "admin") {
          router.push("/admin");
        } else {
          setError("Access denied. Invalid user role.");
        }
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return null;
  }

  // Don't show login form if already authenticated (redirect will happen)
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <Header badge="Candidate & Admin Portal" />

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-md space-y-6">
          {/* Hero Section */}
          <div className="space-y-3 text-center">
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Welcome{" "}
              <span className="text-primary font-serif font-normal italic">
                Back
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-xl text-base sm:text-lg">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Card */}
          <AuthCard
            title="Secure Access"
            subtitle="Admin Gateway"
            status="Encrypted"
            icon={HiShieldCheck}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert
                  variant="destructive"
                  className="border-destructive/20 bg-destructive/5"
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
                  <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
                    <HiLockClosed className="text-muted-foreground size-3.5" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary h-12 pr-12 pl-12 font-mono text-sm font-medium transition-all"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                  >
                    {showPassword ? (
                      <HiEyeOff className="size-4" />
                    ) : (
                      <HiEye className="size-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive font-mono text-[10px] font-medium tracking-wide uppercase">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="hover:bg-muted/5 flex items-center space-x-2.5 rounded-lg border border-transparent py-2 transition-colors">
                <Checkbox
                  id="remember"
                  className="border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  onCheckedChange={(checked) => {
                    setValue("rememberMe", checked === true);
                  }}
                />
                <Label
                  htmlFor="remember"
                  className="text-muted-foreground cursor-pointer text-xs font-medium tracking-wide"
                >
                  Keep me signed in on this device
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/95 h-11 w-full rounded-xl text-xs font-bold tracking-widest uppercase shadow-sm transition-all active:scale-95"
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

          {/* Utility Navigation */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="group border-border/60 bg-card/50 hover:border-primary/20 hover:bg-primary/5 flex items-center gap-3 rounded-xl border px-5 py-3 transition-all hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] active:scale-95"
            >
              <div className="bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary flex size-6 items-center justify-center rounded-md transition-colors">
                <HiArrowLeft className="size-3" />
              </div>
              <div className="text-left">
                <span className="text-muted-foreground group-hover:text-foreground block text-[10px] font-bold tracking-widest uppercase transition-colors">
                  Back to Home
                </span>
              </div>
            </Link>

            <Link
              href="/voter-login"
              className="group border-border/60 bg-card/50 hover:border-primary/20 hover:bg-primary/5 flex items-center gap-3 rounded-xl border px-5 py-3 transition-all hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] active:scale-95"
            >
              <div className="bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary flex size-6 items-center justify-center rounded-md transition-colors">
                <HiUser className="size-3" />
              </div>
              <div className="text-left">
                <span className="text-muted-foreground group-hover:text-foreground block text-[10px] font-bold tracking-widest uppercase transition-colors">
                  Voter Login
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
