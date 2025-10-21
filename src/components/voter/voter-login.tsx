"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  CreditCard,
  ArrowRight,
  UserCheck,
  Shield,
  Clock,
  RefreshCw,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRegistration } from "@/hooks/use-registration";
import { cn } from "@/lib/utils";
import { mockApi } from "@/lib/mock/mockApi";
import { isValidNIN, normalizeNINInput } from "@/lib/registration-schemas";

export function VoterLogin() {
  const router = useRouter();
  const { update } = useRegistration();
  const [rawNin, setRawNin] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const formattedNin = useMemo(() => normalizeNINInput(rawNin), [rawNin]);

  const isValidNin = isValidNIN(formattedNin);

  const loginMutation = useMutation({
    mutationFn: async (nin: string) => {
      // Check if offline
      if (isOffline) {
        throw new Error(
          "You're currently offline. Please check your internet connection.",
        );
      }
      // Use mock API for demo
      return await mockApi.checkRegistration(nin, 2024);
    },
    onSuccess: (data) => {
      // For demo purposes, always redirect to voter profile
      // In production, you'd check if user exists and handle accordingly
      update({ nin: formattedNin });

      if (data.exists) {
        toast.success(
          getDemoMessage("Login successful - redirecting to profile"),
        );
      } else {
        toast.info(getDemoMessage("Welcome! Redirecting to profile"));
      }

      router.push("/voter/profile");
    },
    onError: (error: Error) => {
      setLoginAttempts((prev) => prev + 1);
      toast.error(error.message || "Login failed. Please try again.");
      console.error("Login error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNin) {
      toast.error("Please enter a valid 11-digit NIN");
      return;
    }
    if (loginAttempts >= 3) {
      toast.error("Maximum login attempts reached. Please contact support.");
      return;
    }
    loginMutation.mutate(formattedNin);
  };

  const handleRetryLogin = () => {
    if (loginAttempts >= 3) {
      toast.error("Maximum login attempts reached. Please contact support.");
      return;
    }
    if (isValidNin) {
      loginMutation.mutate(formattedNin);
    }
  };

  const getCharacterCount = () => {
    const digits = rawNin.replace(/\D/g, "");
    return `${digits.length}/11`;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-2 text-center">
        <div className="border-primary/30 bg-primary/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
          <UserCheck className="h-3.5 w-3.5" />
          <span>Returning Voter</span>
        </div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome Back
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xl text-lg">
          Access your voter profile using your registered NIN
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-border/40 bg-card/95 backdrop-blur-sm">
        <CardHeader className="border-border/40 space-y-3 border-b pb-6">
          <div className="flex items-center gap-4">
            <div className="from-primary/20 to-primary/10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br">
              <CreditCard className="text-primary h-6 w-6" />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-semibold">
                Login to Your Account
              </h2>
              <p className="text-muted-foreground text-sm">
                Enter your registered NIN
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NIN Input */}
            <div className="space-y-2">
              <Label htmlFor="nin" className="flex items-center gap-2">
                National Identification Number (NIN)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Your 11-digit NIN is found on your NIMC ID card or
                        National ID slip
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="relative">
                <CreditCard className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                <Input
                  id="nin"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="12345 67890 1"
                  className={cn(
                    "border-border/60 bg-background/50 focus:border-primary/60 focus:bg-background h-14 pr-20 pl-11 font-mono text-base tracking-wider transition-all",
                    rawNin.length > 0 &&
                      !isValidNin &&
                      "border-destructive focus:border-destructive",
                    loginAttempts > 0 && "border-orange-500 bg-orange-50",
                  )}
                  value={rawNin}
                  onChange={(e) => setRawNin(e.target.value)}
                  maxLength={13} // Account for spaces
                  disabled={loginMutation.isPending}
                />
                {/* Character Counter */}
                <div className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs">
                  {getCharacterCount()}
                </div>
              </div>
              {rawNin.length > 0 && !isValidNin && (
                <p className="text-destructive text-sm">
                  Enter a valid 11-digit NIN
                </p>
              )}
              <p className="text-muted-foreground flex items-center gap-2 text-xs">
                <Shield className="h-3 w-3" />
                Enter the NIN you used to register
              </p>
            </div>

            {/* Login Attempts Warning */}
            {loginAttempts > 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <RefreshCw className="h-4 w-4" />
                <span>
                  {loginAttempts >= 3
                    ? "Maximum login attempts reached. Please contact support."
                    : `Login attempt ${loginAttempts}/3 failed. Please try again.`}
                </span>
              </div>
            )}

            {/* Offline State */}
            {isOffline && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <Clock className="h-4 w-4" />
                <span>
                  You're offline. Please check your internet connection.
                </span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                !isValidNin ||
                loginMutation.isPending ||
                isOffline ||
                loginAttempts >= 3
              }
              className="from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 h-14 w-full bg-gradient-to-r text-base font-semibold transition-all duration-200"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Logging in...
                </div>
              ) : loginAttempts >= 3 ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Contact Support
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Login
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>

            {/* Retry Button */}
            {loginAttempts > 0 && loginAttempts < 3 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRetryLogin}
                disabled={!isValidNin || loginMutation.isPending || isOffline}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
          </form>

          {/* Register Link */}
          <div className="text-muted-foreground mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Trust Indicators */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "Secure Access",
            description: "Your data is protected",
            icon: Shield,
          },
          {
            title: "NIN Verified",
            description: "Authenticated through NIMC",
            icon: CreditCard,
          },
        ].map((item) => (
          <div
            key={item.title}
            className="border-border/40 bg-card/80 hover:bg-card/90 rounded-lg border p-4 text-center transition-all"
          >
            <div className="mb-2 flex justify-center">
              <item.icon className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-foreground text-sm font-semibold">
              {item.title}
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
