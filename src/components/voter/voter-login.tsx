"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  CreditCard,
  UserCheck,
  Shield,
  Clock,
  RefreshCw,
  Info,
  Loader2,
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

  // Format NIN input with spaces for display
  const formatNINInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 5) return digits;
    if (digits.length <= 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 5)} ${digits.slice(5, 10)} ${digits.slice(10, 11)}`;
  };

  const handleNINChange = (input: string) => {
    const formatted = formatNINInput(input);
    setRawNin(formatted);
  };

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
        toast.success("Login successful - redirecting to profile");
      } else {
        toast.info("Welcome! Redirecting to profile");
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
    <div className="space-y-6">
      {/* Hero Section with Sparkles Badge */}
      <div className="space-y-3 text-center">
        <div className="border-primary/30 bg-primary/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
          <UserCheck className="h-3.5 w-3.5" />
          <span>Returning Voter</span>
        </div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Welcome Back
        </h1>
        <p className="text-muted-foreground mx-auto max-w-lg text-sm sm:text-base">
          Access your voter profile using your registered NIN
        </p>
      </div>

      {/* Main Card */}
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
          <CardHeader className="border-border/40 border-b">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                Login to Your Account
              </h2>
              <p className="text-muted-foreground text-sm">
                Enter your registered NIN
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* NIN Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="nin"
                  className="text-foreground text-sm font-medium"
                >
                  National Identification Number (NIN)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="text-muted-foreground ml-2 inline h-4 w-4 cursor-help" />
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
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="12345 67890 1"
                    className={cn(
                      "border-border/60 focus:border-primary focus:ring-primary disabled:bg-muted/50 h-12 pr-16 pl-12 font-mono text-base tracking-wider transition-all duration-200 placeholder:text-sm",
                      rawNin.length > 0 &&
                        !isValidNin &&
                        "border-destructive focus:border-destructive",
                      loginAttempts > 0 && "border-orange-500 bg-orange-50/50",
                    )}
                    value={rawNin}
                    onChange={(e) => handleNINChange(e.target.value)}
                    maxLength={13} // Account for spaces
                    disabled={loginMutation.isPending}
                  />
                  {/* Digit Counter */}
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {loginAttempts > 0 && loginAttempts < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRetryLogin}
                    disabled={
                      !isValidNin || loginMutation.isPending || isOffline
                    }
                    className="h-10 flex-1"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={
                    !isValidNin ||
                    loginMutation.isPending ||
                    isOffline ||
                    loginAttempts >= 3
                  }
                  className={cn(
                    "from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 bg-gradient-to-r font-semibold transition-all duration-200",
                    loginAttempts > 0 && loginAttempts < 3
                      ? "flex-1"
                      : "w-full",
                  )}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : loginAttempts >= 3 ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Contact Support
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </form>

            {/* Login Link */}
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
      </div>

      {/* Subtle Trust Indicators */}
      <div className="mx-auto max-w-2xl">
        <div className="text-muted-foreground/80 flex items-center justify-center gap-8 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="text-primary h-4 w-4" />
            <span className="font-medium">Secure & Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="text-primary h-4 w-4" />
            <span className="font-medium">NIMC Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="text-primary h-4 w-4" />
            <span className="font-medium">Trusted Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}
