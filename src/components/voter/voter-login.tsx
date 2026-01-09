"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  HiCreditCard,
  HiShieldCheck,
  HiExclamationCircle,
  HiInformationCircle,
  HiUserCircle,
} from "react-icons/hi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRegistrationStore } from "@/stores/registration-store";
import { cn } from "@/lib/utils";
import { voterApi } from "@/lib/api/voter";
import {
  isValidNIN,
  normalizeNINInput,
  formatNINForDisplay,
} from "@/lib/schemas/common-schemas";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { RegistrationStepHeader } from "@/components/voter/registration-step-header";
import { motion } from "motion/react";

export function VoterLogin() {
  const router = useRouter();
  const { update } = useRegistrationStore();
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
      if (isOffline) {
        throw new Error(
          "You're currently offline. Please check your internet connection.",
        );
      }
      return await voterApi.checkRegistration(nin, 2025);
    },
    onSuccess: (data) => {
      if (data.exists && data.voter) {
        const voter = data.voter;
        const status = data.status || "complete";

        if (status === "incomplete") {
          update({
            nin: voter.nin,
            phone: voter.phoneNumber,
            basic: voter.firstName
              ? {
                  role: voter.role || "voter",
                  firstName: voter.firstName,
                  middleName: voter.middleName,
                  lastName: voter.lastName,
                  email: voter.email || "",
                  dateOfBirth: voter.dateOfBirth,
                  age: voter.age,
                  gender: voter.gender,
                  occupation: voter.occupation || "",
                  religion: voter.religion || "",
                  vin: voter.vin,
                }
              : undefined,
            location:
              voter.state && voter.lga
                ? {
                    state: voter.state,
                    lga: voter.lga,
                    ward: voter.ward,
                    pollingUnit: voter.pollingUnit,
                  }
                : undefined,
            candidates: voter.candidateSelections
              ? { selections: voter.candidateSelections }
              : undefined,
          });
          toast.info("Incomplete registration found - redirecting to resume");
          router.push("/register/resume");
          return;
        }

        update({
          nin: voter.nin,
          phone: voter.phoneNumber,
          basic: {
            role: voter.role || "voter",
            firstName: voter.firstName,
            middleName: voter.middleName,
            lastName: voter.lastName,
            email: voter.email || "",
            dateOfBirth: voter.dateOfBirth,
            age: voter.age,
            gender: voter.gender,
            occupation: voter.occupation || "",
            religion: voter.religion || "",
            vin: voter.vin,
          },
          location: {
            state: voter.state,
            lga: voter.lga,
            ward: voter.ward,
            pollingUnit: voter.pollingUnit,
          },
          candidates: voter.candidateSelections
            ? { selections: voter.candidateSelections }
            : undefined,
        });
        toast.success("Login successful");
        router.push("/voter/profile");
      } else {
        toast.info("Account not found - redirecting to registration");
        update({ nin: formattedNin });
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
      toast.error("Maximum login attempts reached.");
      return;
    }
    loginMutation.mutate(formattedNin);
  };

  const getCharacterCount = () => {
    const digits = rawNin.replace(/\D/g, "");
    return `${digits.length}/11`;
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-10 py-10">
      <RegistrationStepHeader
        icon={HiUserCircle}
        badge="Account Access"
        title="Voter Login"
        description="Verify your identity using your National Identification Number (NIN) to access your secure profile."
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative overflow-hidden border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]"
      >
        {/* Architectural Markers */}
        <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

        <div className="p-7 sm:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
                Secure Verification
              </h2>
              <div className="flex items-center gap-2">
                <div className="bg-primary/60 size-1.5 rounded-[1px]" />
                <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                  Secure Connection{" "}
                  <span className="text-primary/40 mx-1">|</span>{" "}
                  <span className="text-foreground font-bold">Active</span>
                </p>
              </div>
            </div>
            <div className="bg-primary/5 text-primary border-primary/20 flex size-9 items-center justify-center rounded-lg border">
              <HiShieldCheck className="size-4.5" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Label
                  htmlFor="nin"
                  className="text-foreground text-xs font-bold tracking-widest uppercase"
                >
                  National ID (NIN)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HiInformationCircle className="text-muted-foreground hover:text-primary h-4 w-4 cursor-help transition-colors duration-300" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Your 11-digit NIN is found on your NIMC ID card or
                        National ID slip
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="relative">
                <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
                  <HiCreditCard className="text-muted-foreground size-3.5" />
                </div>
                <Input
                  id="nin"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0000 0000 000"
                  className={cn(
                    "border-border/60 bg-muted/5 focus:border-primary focus:ring-primary h-12 pr-14 pl-12 font-mono text-base font-bold tracking-[0.15em] transition-all",
                    rawNin.length > 0 &&
                      !isValidNin &&
                      "border-destructive focus:border-destructive focus:ring-destructive",
                    loginAttempts >= 3 && "opacity-50",
                  )}
                  value={rawNin}
                  onChange={(e) => handleNINChange(e.target.value)}
                  maxLength={13}
                  disabled={loginMutation.isPending || loginAttempts >= 3}
                />
                <div className="text-muted-foreground absolute top-1/2 right-3.5 -translate-y-1/2 font-mono text-[9px] font-bold uppercase">
                  {getCharacterCount()}
                </div>
              </div>
              {rawNin.length > 0 && !isValidNin && (
                <p className="text-destructive font-mono text-xs font-medium tracking-wide uppercase">
                  Invalid NIN format. Please check your card.
                </p>
              )}
            </div>

            {loginMutation.isPending ? (
              <div className="bg-primary/5 border-primary/20 flex flex-col items-center justify-center gap-3 rounded-xl border py-6">
                <Loader2 className="text-primary size-5 animate-spin" />
                <div className="text-center">
                  <p className="text-foreground text-xs font-bold tracking-wider uppercase">
                    Verifying Identity
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <div className="bg-primary/60 size-1.5 animate-pulse rounded-[1px]" />
                    <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                      Database Check{" "}
                      <span className="text-primary/40 mx-1">|</span> Scanning
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {loginAttempts > 0 && loginMutation.isError && (
                  <div className="bg-destructive/5 border-destructive/20 flex gap-3 rounded-xl border p-4">
                    <HiExclamationCircle className="text-destructive size-4 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-destructive text-xs font-bold tracking-widest uppercase">
                        Login Failed
                      </p>
                      <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                        {loginAttempts >= 3
                          ? "Maximum attempts exceeded. Please contact support."
                          : "NIN not found. Please verify your number and try again."}
                      </p>
                    </div>
                  </div>
                )}

                {isOffline && (
                  <div className="flex gap-3 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                    <HiExclamationCircle className="size-4 shrink-0 text-orange-600" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold tracking-widest text-orange-600 uppercase">
                        Offline Status
                      </p>
                      <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                        Internet connection lost. Please check your network.
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={
                    !isValidNin ||
                    loginMutation.isPending ||
                    isOffline ||
                    loginAttempts >= 3
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/95 h-11 w-full rounded-xl text-xs font-bold tracking-widest uppercase transition-all active:scale-95 disabled:grayscale"
                >
                  Login
                </Button>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-bold underline-offset-4 hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      <TrustIndicators
        items={[
          {
            icon: <HiShieldCheck />,
            label: "SECURE_ENCRYPTION",
          },
          {
            icon: <HiCreditCard />,
            label: "IDENTITY_VERIFIED",
          },
          {
            icon: <HiShieldCheck />,
            label: "PRIVACY_GUARANTEED",
          },
        ]}
      />
    </div>
  );
}
