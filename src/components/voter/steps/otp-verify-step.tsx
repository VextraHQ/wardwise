"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Shield, ArrowRight, Clock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRegistration } from "@/hooks/use-registration";
import { cn } from "@/lib/utils";
import { mockApi, demoOtps, getDemoMessage } from "@/lib/mock/mockApi";

export function OtpVerifyStep() {
  const router = useRouter();
  const { payload } = useRegistration();
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(60);

  const phone = payload.phone || "";
  const maskedPhone = phone.replace(/(\+\d{3})\d{6}(\d{4})/, "$1****$2");

  useEffect(() => {
    if (!phone) {
      router.push("/register");
      return;
    }
  }, [phone, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const verifyOtp = useMutation({
    mutationFn: async () => {
      // Use mock API for demo
      return await mockApi.verifyOtp(phone, otp);
    },
    onSuccess: (data: { verified: boolean }) => {
      if (!data.verified) {
        toast.error("Invalid verification code. Please try again.");
        setOtp("");
        return;
      }
      toast.success(getDemoMessage("Phone verified successfully!"));
      router.push("/register/check");
    },
    onError: () => {
      toast.error("Verification failed. Please try again.");
      setOtp("");
    },
  });

  const resendOtp = useMutation({
    mutationFn: async () => {
      // Use mock API for demo
      return await mockApi.sendOtp(phone);
    },
    onSuccess: () => {
      toast.success(getDemoMessage("New verification code sent!"));
      setCooldown(60);
      setOtp("");
    },
    onError: () => {
      toast.error("Failed to resend code. Please try again.");
    },
  });

  const handleComplete = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      // Auto-submit when complete
      setTimeout(() => {
        verifyOtp.mutate();
      }, 300);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
          1
        </div>
        <div className="bg-primary h-1 w-12 rounded-full" />
        <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
          2
        </div>
        <div className="bg-muted h-1 w-12 rounded-full" />
        <div className="bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
          3
        </div>
      </div>

      {/* Hero Section */}
      <div className="space-y-2 text-center">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Enter Verification Code
        </h1>
        <p className="text-muted-foreground text-lg">
          We sent a 6-digit code to{" "}
          <span className="text-foreground font-semibold">{maskedPhone}</span>
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="border-border/60 space-y-2 border-b pb-6">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-primary/15 flex h-10 w-10 items-center justify-center rounded-full">
              <Shield className="text-primary h-5 w-5" />
            </div>
            <div className="text-center">
              <h2 className="text-foreground text-xl font-semibold">
                Verify Your Identity
              </h2>
              <p className="text-muted-foreground text-sm">
                Enter the code to continue
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-8">
          {/* OTP Input */}
          <div className="flex flex-col items-center gap-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              onComplete={handleComplete}
              disabled={verifyOtp.isPending}
            >
              <InputOTPGroup>
                <InputOTPSlot
                  index={0}
                  className={cn(
                    "h-14 w-12 text-xl sm:h-16 sm:w-14",
                    verifyOtp.isPending && "opacity-50",
                  )}
                />
                <InputOTPSlot
                  index={1}
                  className={cn(
                    "h-14 w-12 text-xl sm:h-16 sm:w-14",
                    verifyOtp.isPending && "opacity-50",
                  )}
                />
                <InputOTPSlot
                  index={2}
                  className={cn(
                    "h-14 w-12 text-xl sm:h-16 sm:w-14",
                    verifyOtp.isPending && "opacity-50",
                  )}
                />
                <InputOTPSlot
                  index={3}
                  className={cn(
                    "h-14 w-12 text-xl sm:h-16 sm:w-14",
                    verifyOtp.isPending && "opacity-50",
                  )}
                />
                <InputOTPSlot
                  index={4}
                  className={cn(
                    "h-14 w-12 text-xl sm:h-16 sm:w-14",
                    verifyOtp.isPending && "opacity-50",
                  )}
                />
                <InputOTPSlot
                  index={5}
                  className={cn(
                    "h-14 w-12 text-xl sm:h-16 sm:w-14",
                    verifyOtp.isPending && "opacity-50",
                  )}
                />
              </InputOTPGroup>
            </InputOTP>

            {verifyOtp.isPending && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                Verifying code...
              </div>
            )}

            {/* Demo OTP codes for testing */}
            <div className="mt-4 space-y-2">
              <p className="text-muted-foreground text-xs font-medium">
                Demo OTP codes (any 6 digits work):
              </p>
              <div className="flex flex-wrap gap-2">
                {demoOtps.map((demoOtp) => (
                  <button
                    key={demoOtp}
                    type="button"
                    onClick={() => setOtp(demoOtp)}
                    className="text-primary hover:text-primary/80 text-xs underline"
                  >
                    {demoOtp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resend Section */}
          <div className="border-border/60 bg-muted/50 flex flex-col items-center gap-3 rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">
              Didn't receive the code?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => resendOtp.mutate()}
              disabled={cooldown > 0 || resendOtp.isPending}
              className={cn(cooldown > 0 && "cursor-not-allowed opacity-50")}
            >
              {resendOtp.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending...
                </div>
              ) : cooldown > 0 ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Resend in {cooldown}s
                </div>
              ) : (
                "Resend Code"
              )}
            </Button>
          </div>

          {/* Navigation */}
          <div className="border-border/60 flex items-center justify-between border-t pt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/register")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => verifyOtp.mutate()}
              disabled={otp.length !== 6 || verifyOtp.isPending}
              className="from-primary to-primary/90 gap-2 bg-gradient-to-r"
            >
              {verifyOtp.isPending ? (
                <>
                  <div className="border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Verifying...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Note */}
      <div className="border-border/60 bg-card/60 rounded-lg border p-4 text-center backdrop-blur-sm">
        <p className="text-muted-foreground text-xs">
          <Shield className="mb-1 inline h-3.5 w-3.5" /> Your phone number is
          used only for verification and will never be shared publicly.
        </p>
      </div>
    </div>
  );
}
