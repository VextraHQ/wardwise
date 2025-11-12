"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { IconMail, IconLock, IconArrowRight } from "@tabler/icons-react";
import { MapIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function CandidateLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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

  return (
    <div className="bg-background min-h-screen">
      {/* Header - Copied from Voter Header */}
      <header className="sticky top-0 z-50 w-full">
        <div className="border-border border-b backdrop-blur transition-colors duration-300">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="WardWise home"
            >
              <span className="relative flex size-12 items-center justify-center">
                <span className="border-border bg-card absolute inset-0 rounded-full border" />
                <span className="from-primary relative flex size-9 items-center justify-center rounded-full bg-linear-to-br via-[#2f7f6b] to-[#163a30] text-white">
                  <MapIcon className="size-5" />
                </span>
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-foreground text-base font-semibold tracking-[0.18em] uppercase">
                  WardWise
                </span>
                <span className="text-muted-foreground text-[11px] font-medium">
                  Civic Intelligence Platform
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4 lg:gap-6">
              <div className="border-primary/20 bg-primary/10 text-accent flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
                <ShieldCheckIcon className="size-4" />
                <span className="sm:hidden">Candidate</span>
                <span className="hidden sm:inline">Candidate Portal</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Hero Section */}
          <div className="space-y-3 text-center sm:space-y-4">
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Welcome Back
            </h1>
            <p className="text-muted-foreground mx-auto max-w-xl text-base sm:text-lg">
              Sign in to access your candidate dashboard and manage your
              campaign
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
                    <IconMail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="candidate@wardwise.ng"
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
                    <IconLock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
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
          <div className="text-center">
            <Button
              variant="ghost"
              asChild
              className="text-muted-foreground transition-colors duration-300"
            >
              <Link href="/">
                <IconArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Back to WardWise Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
