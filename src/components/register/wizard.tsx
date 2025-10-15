"use client";

import { useRegistration } from "@/hooks/use-registration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { OTPStep } from "./steps/otp-step";
import { DuplicateStep } from "./steps/duplicate-step";
import { BasicStep } from "./steps/basic-step";
import { LocationStep } from "./steps/location-step";
import { CandidateStep } from "./steps/candidate-step";
import { SurveyStep } from "./steps/survey-step";
import { ConfirmStep } from "./steps/confirm-step";
import { CheckCircle2, Shield, Clock, Users, MapPin } from "lucide-react";

const steps = [
  {
    key: "otp",
    label: "Verify",
    icon: Shield,
    description: "Phone verification",
  },
  {
    key: "duplicate",
    label: "Check",
    icon: CheckCircle2,
    description: "Duplicate check",
  },
  { key: "basic", label: "Profile", icon: Users, description: "Personal info" },
  {
    key: "location",
    label: "Location",
    icon: MapPin,
    description: "Polling unit",
  },
  {
    key: "candidate",
    label: "Support",
    icon: Users,
    description: "Choose candidate",
  },
  {
    key: "survey",
    label: "Priorities",
    icon: Clock,
    description: "Your concerns",
  },
  {
    key: "confirm",
    label: "Review",
    icon: CheckCircle2,
    description: "Final check",
  },
] as const;

export function RegistrationWizard() {
  const { step, setStep } = useRegistration();
  const pathname = usePathname();
  const router = useRouter();
  const initialized = useRef(false);

  const stepToPath = useMemo(
    () => ({
      otp: "/register",
      duplicate: "/register/verify",
      basic: "/register/profile",
      location: "/register/location",
      candidate: "/register/candidate",
      survey: "/register/survey",
      confirm: "/register/confirm",
    }),
    [],
  );

  const pathToStep = useMemo(() => {
    const map: Record<string, (typeof steps)[number]["key"]> = {
      "/register": "otp",
      "/register/verify": "duplicate",
      "/register/profile": "basic",
      "/register/location": "location",
      "/register/candidate": "candidate",
      "/register/survey": "survey",
      "/register/confirm": "confirm",
    };
    return map;
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    const m = pathToStep[pathname as keyof typeof pathToStep];
    if (m) setStep(m);
    initialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const target = stepToPath[step];
    if (target && target !== pathname) {
      router.push(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const currentStepIndex = steps.findIndex((s) => s.key === step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/wardwise-logo.svg"
                alt="WardWise"
                width={150}
                height={28}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="h-4 w-4" />
              <span>Secure • Encrypted • Verified</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Sidebar - Progress & Info */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Progress Card */}
              <Card className="border-slate-200 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">
                    Registration Progress
                  </CardTitle>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        Step {currentStepIndex + 1} of {steps.length}
                      </span>
                      <span className="font-medium text-slate-900">
                        {Math.round(progress)}% Complete
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {steps.map((s, idx) => {
                    const Icon = s.icon;
                    const isActive = step === s.key;
                    const isCompleted = idx < currentStepIndex;
                    const isUpcoming = idx > currentStepIndex;

                    return (
                      <div
                        key={s.key}
                        className={cn(
                          "flex items-center gap-3 rounded-lg p-3 transition-all duration-200",
                          isActive && "border border-emerald-200 bg-emerald-50",
                          isCompleted && "bg-slate-50",
                          isUpcoming && "opacity-60",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                            isActive && "bg-emerald-600 text-white",
                            isCompleted && "bg-emerald-100 text-emerald-700",
                            isUpcoming && "bg-slate-200 text-slate-500",
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <div
                            className={cn(
                              "text-sm font-medium",
                              isActive && "text-emerald-900",
                              isCompleted && "text-slate-700",
                              isUpcoming && "text-slate-500",
                            )}
                          >
                            {s.label}
                          </div>
                          <div className="text-xs text-slate-500">
                            {s.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card className="border-slate-200 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    Your Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <div>
                      <div className="font-medium text-slate-900">
                        Phone Verification
                      </div>
                      <div className="text-slate-600">
                        OTP sent to your number
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <div>
                      <div className="font-medium text-slate-900">
                        No Password Required
                      </div>
                      <div className="text-slate-600">
                        One-time registration only
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <div>
                      <div className="font-medium text-slate-900">
                        Data Encrypted
                      </div>
                      <div className="text-slate-600">
                        End-to-end protection
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-2">
            <Card className="border-slate-200 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      {step === "otp" && "Verify Your Phone"}
                      {step === "duplicate" && "Check Registration"}
                      {step === "basic" && "Personal Information"}
                      {step === "location" && "Select Your Location"}
                      {step === "candidate" && "Choose Your Candidate"}
                      {step === "survey" && "Share Your Priorities"}
                      {step === "confirm" && "Review & Submit"}
                    </CardTitle>
                    <p className="mt-1 text-slate-600">
                      {step === "otp" &&
                        "We'll send a verification code to your phone"}
                      {step === "duplicate" &&
                        "Checking if you're already registered"}
                      {step === "basic" && "Tell us about yourself"}
                      {step === "location" &&
                        "Help us find your exact polling unit"}
                      {step === "candidate" && "Select who you want to support"}
                      {step === "survey" && "What issues matter most to you?"}
                      {step === "confirm" &&
                        "Review your information before submitting"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">
                      Step {currentStepIndex + 1} of {steps.length}
                    </div>
                    <div className="text-xs text-slate-500">
                      {Math.round(progress)}% Complete
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {step === "otp" && <OTPStep />}
                {step === "duplicate" && <DuplicateStep />}
                {step === "basic" && <BasicStep />}
                {step === "location" && <LocationStep />}
                {step === "candidate" && <CandidateStep />}
                {step === "survey" && <SurveyStep />}
                {step === "confirm" && <ConfirmStep />}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
