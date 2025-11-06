"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  HiCreditCard,
  HiSparkles,
  HiCheckCircle,
  HiShieldCheck,
  HiExclamationCircle,
  HiInformationCircle,
} from "react-icons/hi";
import { Loader2 } from "lucide-react";
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
import {
  isValidNIN,
  normalizeNINInput,
  formatNINForDisplay,
} from "@/lib/registration-schemas";
import { TrustIndicators } from "@/components/ui/trust-indicators";

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

  // Handle NIN input change with proper formatting
  const handleNINChange = useCallback((input: string) => {
    const normalized = normalizeNINInput(input);
    const formatted = formatNINForDisplay(normalized);
    setRawNin(formatted);
  }, []);

  const formattedNin = normalizeNINInput(rawNin);
  const isValidNin = isValidNIN(formattedNin);

  const loginMutation = useMutation({
    mutationFn: async (nin: string) => {
      // Check if offline
      if (isOffline) {
        throw new Error(
          "You're currently offline. Please check your internet connection.",
        );
      }
      // Use mock API to check registration
      return await mockApi.checkRegistration(nin, 2024);
    },
    onSuccess: (data) => {
      if (data.exists && data.voter) {
        // Voter exists - populate full registration state with voter data
        const voter = data.voter;
        update({
          nin: voter.nin,
          phone: voter.phoneNumber,
          basic: {
            firstName: voter.firstName,
            lastName: voter.lastName,
            dateOfBirth: voter.dateOfBirth,
            age: voter.age,
            gender: voter.gender,
            occupation: voter.occupation || "",
            religion: voter.religion || "",
          },
          location: {
            state: voter.state,
            lga: voter.lga,
            ward: voter.ward,
            pollingUnit: voter.pollingUnit,
          },
          candidate: {
            candidateId: voter.candidateId,
          },
          survey: {
            surveyId: "", // Survey ID can be fetched separately if needed
            answers: voter.surveyAnswers || {},
          },
        });
        toast.success("Login successful - redirecting to profile");
        router.push("/voter/profile");
      } else {
        // User doesn't exist - redirect to registration
        toast.info("Account not found - redirecting to registration");
        update({ nin: formattedNin }); // Save NIN for registration flow
        router.push("/register");
      }
    },
    onError: (error: Error) => {
      setLoginAttempts((prev) => prev + 1);
      toast.error(error.message || "Login failed. Please try again.");
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

  // Get character count for NIN input
  const getCharacterCount = () => {
    const digits = rawNin.replace(/\D/g, "");
    return `${digits.length}/11`;
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="mx-auto max-w-2xl">
        <div className="space-y-3 text-center">
          <div className="border-primary/30 bg-primary/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
            <HiSparkles className="h-3.5 w-3.5" />
            <span>Returning Voter</span>
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mx-auto max-w-lg text-sm sm:text-base">
            Access your voter profile using your registered NIN
          </p>
        </div>
      </section>

      {/* Main Card */}
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader className="border-border border-b">
            <div className="space-y-1">
              <h2 className="text-foreground text-xl font-semibold">
                Login to Your Account
              </h2>
              <p className="text-muted-foreground text-sm">
                Enter your registered NIN to access your profile
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NIN Input Section */}
              <div className="space-y-3">
                <Label
                  htmlFor="nin"
                  className="text-foreground flex items-center gap-2 text-sm font-medium"
                >
                  National Identification Number (NIN)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HiInformationCircle className="text-muted-foreground h-4 w-4 cursor-help" />
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
                  <HiCreditCard className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                  <Input
                    id="nin"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Enter your 11-digit NIN"
                    className={cn(
                      "border-border/60 focus:border-primary focus:ring-primary disabled:bg-muted/50 h-12 pr-16 pl-12 text-base tracking-wider transition-all duration-200 placeholder:text-sm",
                      rawNin.length > 0 &&
                        !isValidNin &&
                        "border-destructive focus:border-destructive focus:ring-destructive",
                      loginAttempts > 0 &&
                        loginAttempts < 3 &&
                        "border-orange-500 bg-orange-50/50",
                      loginAttempts >= 3 && "border-red-500 bg-red-50/50",
                    )}
                    value={rawNin}
                    onChange={(e) => handleNINChange(e.target.value)}
                    maxLength={13}
                    disabled={loginMutation.isPending || loginAttempts >= 3}
                  />
                  {/* Digit Counter */}
                  {loginMutation.isIdle && (
                    <div className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs">
                      {getCharacterCount()}
                    </div>
                  )}
                </div>
                {rawNin.length > 0 && !isValidNin && (
                  <p className="text-destructive text-xs">
                    Enter a valid 11-digit NIN
                  </p>
                )}
              </div>

              {/* Loading State */}
              {loginMutation.isPending && (
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="border-primary/30 bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full border">
                    <Loader2 className="text-primary h-6 w-6 animate-spin" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-foreground text-sm font-medium">
                      Verifying your account
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Checking registration status...
                    </p>
                  </div>
                </div>
              )}

              {/* Error States */}
              {loginAttempts > 0 && loginMutation.isError && (
                <div className="space-y-3">
                  <div className="bg-destructive/10 border-destructive/20 flex gap-3 rounded-lg border p-4">
                    <HiExclamationCircle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-destructive text-sm font-semibold">
                        {loginAttempts >= 3
                          ? "Maximum Login Attempts Reached"
                          : "Login Failed"}
                      </p>
                      <p className="text-destructive/80 text-xs">
                        {loginAttempts >= 3
                          ? "Please contact support or try again later."
                          : `Login attempt ${loginAttempts}/3 failed. Please check your NIN and try again.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Offline State */}
              {isOffline && (
                <div className="flex gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <HiExclamationCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-700" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-orange-900">
                      Offline Mode
                    </p>
                    <p className="text-xs text-orange-700">
                      You're currently offline. Please check your internet
                      connection.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!loginMutation.isPending && (
                <div className="flex gap-3 pt-2">
                  {loginAttempts > 0 &&
                    loginAttempts < 3 &&
                    loginMutation.isError && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRetryLogin}
                        disabled={!isValidNin || isOffline}
                        className="h-10 flex-1"
                      >
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
                      "from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 bg-gradient-to-r font-semibold transition-all duration-200 disabled:opacity-50",
                      loginAttempts > 0 && loginAttempts < 3
                        ? "flex-1"
                        : "w-full",
                    )}
                  >
                    <HiShieldCheck className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </div>
              )}
            </form>

            {/* Registration Link */}
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

      {/* Trust Indicators */}
      <TrustIndicators
        items={[
          {
            icon: <HiShieldCheck className="h-4 w-4" />,
            label: "Secure & Encrypted",
          },
          {
            icon: <HiCreditCard className="h-4 w-4" />,
            label: "NIMC Verified",
          },
          {
            icon: <HiCheckCircle className="h-4 w-4" />,
            label: "Trusted Platform",
          },
        ]}
      />
    </div>
  );
}
