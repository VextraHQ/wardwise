"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRegistration } from "@/hooks/use-registration";
import { phoneSchema } from "@/lib/registration-schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Phone, Shield, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function OTPStep() {
  const { update, advance } = useRegistration();
  const [rawPhone, setRawPhone] = useState("");
  const [terms, setTerms] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const formattedPhone = useMemo(() => {
    const digits = rawPhone.replace(/\D/g, "");
    if (digits.startsWith("234")) {
      return "+" + digits;
    }
    if (digits.startsWith("0")) {
      return "+234" + digits.slice(1);
    }
    return rawPhone;
  }, [rawPhone]);

  const sendOtp = useMutation({
    mutationFn: async () => {
      if (cooldown > 0) throw new Error("Too many requests");
      const res = await fetch("/api/register/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Verification code sent to your phone");
      setSent(true);
      setCooldown(60);
    },
    onError: () => toast.error("Too many requests. Try again in 60s."),
  });

  const verifyOtp = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/register/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formattedPhone,
          otp: otpDigits.join(""),
        }),
      });
      if (!res.ok) throw new Error("Failed to verify OTP");
      return res.json();
    },
    onSuccess: (data: { verified: boolean }) => {
      if (!data.verified) {
        toast.error("Invalid verification code");
        return;
      }
      update({ phone: formattedPhone });
      advance();
    },
  });

  const validPhone = phoneSchema.safeParse(formattedPhone).success;
  const validOtp = otpDigits.every((d) => d.length === 1);

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const maskedPhone = formattedPhone.replace(
    /(\+\d{3})\d{4}(\d{4})/,
    "$1****$2",
  );

  return (
    <div className="space-y-8">
      {!sent ? (
        <div className="space-y-6">
          {/* Phone Input Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-700">
              <Phone className="h-5 w-5" />
              <span className="font-medium">Enter your phone number</span>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-slate-700"
              >
                Nigerian Phone Number
              </Label>
              <Input
                id="phone"
                inputMode="tel"
                autoComplete="tel"
                value={rawPhone}
                onChange={(e) => setRawPhone(e.target.value)}
                placeholder="08012345678 or +2348012345678"
                className={cn(
                  "h-12 text-lg",
                  rawPhone.length > 0 &&
                    !validPhone &&
                    "border-red-300 focus:border-red-500",
                )}
              />
              {rawPhone.length > 0 && !validPhone && (
                <p className="text-sm text-red-600">
                  Please enter a valid Nigerian phone number
                </p>
              )}
              <p className="text-xs text-slate-500">
                We'll send a verification code to this number
              </p>
            </div>
          </div>

          {/* Terms Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-700">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Terms & Privacy</span>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Checkbox
                id="terms"
                checked={terms}
                onCheckedChange={(checked) => setTerms(checked as boolean)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <label
                  htmlFor="terms"
                  className="cursor-pointer text-sm font-medium text-slate-700"
                >
                  I agree to the Terms of Service and Privacy Policy
                </label>
                <p className="text-xs text-slate-500">
                  By continuing, you consent to our data processing practices
                  and agree to receive SMS notifications.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              onClick={() => sendOtp.mutate()}
              disabled={!validPhone || !terms || sendOtp.isPending}
              className="h-12 w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-lg font-semibold hover:from-emerald-700 hover:to-emerald-800"
            >
              {sendOtp.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending verification code...
                </div>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* OTP Input Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="font-medium">Enter verification code</span>
            </div>

            <div className="space-y-2 text-center">
              <p className="text-sm text-slate-600">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-slate-900">
                  {maskedPhone}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                Enter the code below to continue
              </p>
            </div>

            <div className="flex justify-center gap-3">
              {otpDigits.map((d, i) => (
                <Input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 1);
                    setOtpDigits((prev) => {
                      const next = [...prev];
                      next[i] = val;
                      return next;
                    });
                    if (val && i < 5) inputsRef.current[i + 1]?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otpDigits[i] && i > 0) {
                      inputsRef.current[i - 1]?.focus();
                    }
                  }}
                  className="h-14 w-12 border-2 text-center text-xl font-semibold focus:border-emerald-500"
                />
              ))}
            </div>
          </div>

          {/* Resend Section */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-slate-500">Didn't receive the code?</span>
            <button
              type="button"
              className={cn(
                "font-medium transition-colors",
                cooldown > 0
                  ? "cursor-not-allowed text-slate-400"
                  : "text-emerald-600 hover:text-emerald-700",
              )}
              onClick={() => sendOtp.mutate()}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Resend in {cooldown}s
                </div>
              ) : (
                "Resend code"
              )}
            </button>
          </div>

          {/* Verify Button */}
          <div className="pt-4">
            <Button
              onClick={() => verifyOtp.mutate()}
              disabled={!validOtp || verifyOtp.isPending}
              className="h-12 w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-lg font-semibold hover:from-emerald-700 hover:to-emerald-800"
            >
              {verifyOtp.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Verifying...
                </div>
              ) : (
                "Verify & Continue"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
