"use client";

import { useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HiMail,
  HiLockClosed,
  HiArrowLeft,
  HiMap,
  HiShieldCheck,
  HiUser,
} from "react-icons/hi";
import Link from "next/link";

import { loginSchema, type LoginFormData } from "@/lib/schemas/auth-schemas";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full">
        <div className="border-border border-b backdrop-blur transition-colors duration-300">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <Link
              href="/"
              className="group flex items-center gap-3"
              aria-label="WardWise home"
            >
              <div className="border-primary/20 bg-primary/5 text-primary flex h-10 w-10 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11">
                <HiMap className="h-6 w-6" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-foreground text-lg font-black tracking-tight sm:text-xl">
                  WardWise
                </span>
                <span className="text-muted-foreground truncate text-[10px] font-medium sm:text-[10.5px]">
                  Civic Intelligence Platform
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4 lg:gap-6">
              <div className="border-primary/20 bg-primary/10 text-accent flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
                <HiShieldCheck className="h-4 w-4" />
                <span className="sm:hidden">Portal</span>
                <span className="hidden sm:inline">
                  Candidate & Admin Portal
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-md space-y-6">
          {/* Hero Section */}
          <div className="space-y-3 text-center">
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Welcome Back
            </h1>
            <p className="text-muted-foreground mx-auto max-w-xl text-base sm:text-lg">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Sign In</CardTitle>
              <p className="text-muted-foreground text-sm">
                Enter your credentials to access the dashboard
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <HiMail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      disabled={isLoading}
                      className="pl-10"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <HiLockClosed className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      disabled={isLoading}
                      className="pl-10"
                      {...register("password")}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      onCheckedChange={(checked) => {
                        setValue("rememberMe", checked === true);
                      }}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal">
                      Remember me
                    </Label>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0 text-sm"
                    type="button"
                    asChild
                  >
                    <Link href="/forgot-password">Forgot password?</Link>
                  </Button>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Back Link */}
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
            <Button
              variant="ghost"
              asChild
              className="text-muted-foreground transition-colors duration-300"
            >
              <Link href="/" className="flex items-center gap-2">
                <HiArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <Button
              variant="ghost"
              asChild
              className="text-muted-foreground transition-colors duration-300"
            >
              <Link href="/voter-login" className="flex items-center gap-2">
                <HiUser className="h-4 w-4" />
                Voter Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
