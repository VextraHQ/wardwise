"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HiCreditCard,
  HiCheckCircle,
  HiShieldCheck,
  HiExclamationCircle,
  HiInformationCircle,
  HiArrowLeft,
  HiUser,
  HiLocationMarker,
  HiBadgeCheck,
} from "react-icons/hi";
import { Sparkles } from "lucide-react";
import { PiSpinnerGapBold } from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StepProgress } from "@/components/ui/step-progress";
import { RegistrationStepHeader } from "../registration-step-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRegistrationStore } from "@/stores/registration-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { voterApi } from "@/lib/api/voter";
import {
  formatNINForDisplay,
  ninSchema,
  normalizeNINInput,
} from "@/lib/registration-schemas";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { DemoIndicator } from "@/components/ui/demo-indicator";

// Zod schema validation for terms and conditions check
const ninFormSchema = z.object({
  nin: ninSchema,
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

// Type for NIN form values
type NinFormValues = z.infer<typeof ninFormSchema>;

// Type for verification status
type VerificationStatus = "idle" | "verifying" | "verified" | "error";

interface VerificationData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  state: string;
  lga: string;
  verifiedAt: string;
}

export function NinEntryStep() {
  const router = useRouter();
  const { update } = useRegistrationStore();
  const [rawNin, setRawNin] = useState("");
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("idle");
  const [verificationData, setVerificationData] =
    useState<VerificationData | null>(null);

  const form = useForm<NinFormValues>({
    resolver: zodResolver(ninFormSchema),
    defaultValues: {
      nin: "",
      terms: false,
    },
  });

  // Watch the terms checkbox value for reactivity
  const termsAccepted = useWatch({
    control: form.control,
    name: "terms",
  });

  // Handle NIN input change
  const handleNINChange = useCallback(
    (input: string) => {
      const normalized = normalizeNINInput(input);
      const formatted = formatNINForDisplay(normalized);

      setRawNin(formatted);
      form.setValue("nin", normalized);

      // Reset verification status when NIN changes
      if (verificationStatus !== "idle") {
        setVerificationStatus("idle");
        setVerificationData(null);
      }
    },
    [form, verificationStatus],
  );

  // Verify NIN mutation for fetching verification data from mock API
  const verifyNin = useMutation({
    mutationFn: async (nin: string) => {
      // Verify NIN with mock API
      return await voterApi.verifyNIN(nin);
    },
    onSuccess: (data) => {
      if (data.verified && data.data) {
        setVerificationStatus("verified");
        setVerificationData({
          ...data.data,
          verifiedAt: new Date().toISOString(),
        });
        toast.success("NIN verified successfully");

        // Auto-fill form with verified data
        update({
          nin: form.getValues("nin"),
          basic: {
            role: "voter",
            firstName: data.data.firstName,
            middleName: "",
            lastName: data.data.lastName,
            email: "",
            dateOfBirth: data.data.dateOfBirth,
            gender: "male",
            occupation: "",
            religion: "",
            age:
              new Date().getFullYear() -
              new Date(data.data.dateOfBirth).getFullYear(),
            vin: "",
          },
        });
      } else {
        setVerificationStatus("error");
        toast.error(data.message || "NIN verification failed");
      }
    },
    onError: (error: Error) => {
      setVerificationStatus("error");
      toast.error(
        error.message || "NIN verification failed. Please try again.",
      );
    },
  });

  // Handle NIN verification
  const handleVerifyNin = () => {
    const nin = form.getValues("nin");
    if (nin && nin.length === 11) {
      setVerificationStatus("verifying");
      verifyNin.mutate(nin);
    } else {
      toast.error("Please enter a valid 11-digit NIN");
    }
  };

  // Handle reset
  const handleReset = () => {
    setRawNin("");
    form.setValue("nin", "");
    form.setValue("terms", false);
    setVerificationStatus("idle");
    setVerificationData(null);
  };

  // Handle form submission
  const onSubmit = (data: NinFormValues) => {
    if (verificationStatus !== "verified") {
      toast.error("Please verify your NIN before continuing");
      return;
    }

    // Update registration payload
    update({ nin: data.nin });

    // Redirect to profile step
    router.push("/register/role");
  };

  // Get character count for NIN input
  const getCharacterCount = () => {
    const digits = rawNin.replace(/\D/g, "");
    return `${digits.length}/11`;
  };

  // Check if NIN is complete
  const isNINComplete = () => {
    const digits = rawNin.replace(/\D/g, "");
    return digits.length === 11;
  };

  return (
    <div className="space-y-6">
      {/* Progress Component */}
      <StepProgress
        currentStep={1}
        totalSteps={6}
        stepTitle="Identity Verification"
      />

      {/* Hero Section */}
      <RegistrationStepHeader
        icon={Sparkles}
        badge="Your Voice Shapes Tomorrow"
        title="Voter Registration"
        description="Verify your identity to participate in nationwide elections"
      />

      {/* Main Form Card */}
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader className="border-border border-b">
            <div className="space-y-1">
              <h2 className="text-foreground text-xl font-semibold">
                Enter Your NIN
              </h2>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  National Identification Number verification
                </p>
                <DemoIndicator variant="inline" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* NIN Input Section */}
                {verificationStatus !== "verified" && (
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
                        placeholder="Enter your 11-digit NIN"
                        value={rawNin}
                        onChange={(e) => handleNINChange(e.target.value)}
                        disabled={verificationStatus === "verifying"}
                        maxLength={13}
                        className={cn(
                          "border-border/60 focus:border-primary focus:ring-primary disabled:bg-muted/50 h-12 pr-16 pl-12 text-base tracking-wider transition-all duration-200 placeholder:text-sm",
                          form.formState.errors.nin &&
                            "border-destructive focus:border-destructive focus:ring-destructive",
                        )}
                      />
                      {verificationStatus === "idle" && (
                        <div className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs">
                          {getCharacterCount()}
                        </div>
                      )}
                    </div>
                    {form.formState.errors.nin && (
                      <p className="text-destructive text-xs">
                        {form.formState.errors.nin.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Error State */}
                {verificationStatus === "error" && (
                  <div className="space-y-3">
                    <div className="bg-destructive/10 border-destructive/20 flex gap-3 rounded-lg border p-4">
                      <HiExclamationCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <p className="text-destructive text-sm font-semibold">
                          Verification Failed
                        </p>
                        <p className="text-destructive/80 text-xs">
                          Please check your NIN and try again. Make sure you've
                          entered all 11 digits correctly.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVerifyNin}
                      className="h-10 w-full"
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Loading State */}
                {verificationStatus === "verifying" && (
                  <div
                    role="status"
                    aria-live="assertive"
                    className="flex flex-col items-center justify-center gap-3"
                  >
                    <div className="border-primary/30 bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full border">
                      <PiSpinnerGapBold className="text-primary h-6 w-6 animate-spin" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-foreground text-sm font-medium">
                        Verifying your NIN
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Connecting to NIMC database...
                      </p>
                    </div>
                  </div>
                )}

                {/* Success State - Verification Details */}
                {verificationStatus === "verified" && verificationData && (
                  <div className="space-y-6">
                    {/* Success Badge */}
                    <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <HiBadgeCheck className="h-5 w-5 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-900">
                          Verification Successful
                        </p>
                        <p className="text-xs text-green-700">
                          Your identity has been verified with NIMC
                        </p>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <HiCheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    </div>

                    {/* Verified Information Section */}
                    <div className="space-y-4">
                      {/* Section Header */}
                      <div className="text-accent flex items-center gap-2 text-sm font-semibold">
                        <HiUser className="h-4 w-4" />
                        <span>Verified Identity Information</span>
                      </div>

                      {/* Personal Information */}
                      <div className="space-y-3">
                        <div className="bg-muted/50 rounded-lg p-4">
                          <dl className="space-y-3">
                            <div>
                              <dt className="text-muted-foreground text-xs">
                                Full Name
                              </dt>
                              <dd className="text-foreground mt-1 text-base font-medium">
                                {verificationData.firstName}{" "}
                                {verificationData.lastName}
                              </dd>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <dt className="text-muted-foreground flex items-center gap-1 text-xs">
                                  Date of Birth
                                </dt>
                                <dd className="text-foreground mt-1 text-sm font-medium">
                                  {new Date(
                                    verificationData.dateOfBirth,
                                  ).toLocaleDateString("en-NG", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground text-xs">
                                  Age
                                </dt>
                                <dd className="text-foreground mt-1 text-sm font-medium">
                                  {new Date().getFullYear() -
                                    new Date(
                                      verificationData.dateOfBirth,
                                    ).getFullYear()}{" "}
                                  years
                                </dd>
                              </div>
                            </div>
                          </dl>
                        </div>
                      </div>

                      <Separator />

                      {/* Location Information */}
                      <div className="space-y-3">
                        <div className="text-accent flex items-center gap-2 text-xs font-semibold">
                          <HiLocationMarker className="h-3.5 w-3.5" />
                          <span>Location Information</span>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4">
                          <dl className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <dt className="text-muted-foreground text-xs">
                                State
                              </dt>
                              <dd className="text-foreground mt-1 text-sm font-medium">
                                {verificationData.state}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground text-xs">
                                LGA
                              </dt>
                              <dd className="text-foreground mt-1 text-sm font-medium">
                                {verificationData.lga}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      <Separator />

                      {/* Verification Timestamp */}
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Verified at{" "}
                          {new Date(verificationData.verifiedAt).toLocaleString(
                            "en-NG",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                          <FormItem>
                            <div className="border-border/60 bg-muted/30 rounded-lg border p-4">
                              <div className="flex items-start space-x-3">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="mt-0.5"
                                  />
                                </FormControl>
                                <div className="min-w-0 flex-1">
                                  <FormLabel className="text-foreground block cursor-pointer text-sm leading-relaxed font-normal">
                                    I confirm that the information provided is
                                    accurate and I accept the{" "}
                                    <Link
                                      href="/terms"
                                      className="text-primary hover:text-primary/80 font-medium underline underline-offset-2"
                                      target="_blank"
                                    >
                                      terms and conditions
                                    </Link>{" "}
                                    for voter registration.
                                  </FormLabel>
                                </div>
                              </div>
                            </div>
                            <FormMessage className="mt-2" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {verificationStatus !== "verifying" && (
                  <div className="flex gap-3 pt-2">
                    {verificationStatus === "verified" ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleReset}
                          className="h-10 flex-1"
                        >
                          <HiArrowLeft className="mr-2 h-4 w-4" />
                          Edit NIN
                        </Button>
                        <Button
                          type="submit"
                          disabled={!termsAccepted}
                          className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 flex-1 bg-linear-to-r font-semibold transition-all duration-200 disabled:opacity-50"
                        >
                          Continue to Profile
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleVerifyNin}
                        disabled={!isNINComplete()}
                        className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 w-full bg-linear-to-r font-semibold transition-all duration-200 disabled:opacity-50"
                      >
                        <HiShieldCheck className="mr-2 h-4 w-4" />
                        Verify NIN
                      </Button>
                    )}
                  </div>
                )}
              </form>
            </Form>

            {/* Login Link */}
            <div className="text-muted-foreground mt-6 text-center text-sm">
              Already registered?{" "}
              <Link
                href="/voter-login"
                className="text-primary font-medium hover:underline"
              >
                Login here
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
