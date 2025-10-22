"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HiCreditCard,
  HiSparkles,
  HiCheckCircle,
  HiShieldCheck,
  HiExclamationCircle,
  HiInformationCircle,
} from "react-icons/hi";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StepProgress } from "@/components/ui/step-progress";
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
import { useRegistration } from "@/hooks/use-registration";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { mockApi } from "@/lib/mock/mockApi";
import {
  formatNINForDisplay,
  ninSchema,
  normalizeNINInput,
} from "@/lib/registration-schemas";

// Zod schema validation for terms and conditions check
const ninFormSchema = z.object({
  nin: ninSchema,
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type NinFormValues = z.infer<typeof ninFormSchema>;

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
  const { update } = useRegistration();
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
      return await mockApi.verifyNIN(nin);
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
            firstName: data.data.firstName,
            lastName: data.data.lastName,
            dateOfBirth: data.data.dateOfBirth,
            age:
              new Date().getFullYear() -
              new Date(data.data.dateOfBirth).getFullYear(),
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
    router.push("/register/profile");
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
      {/* Reusable Progress Component */}
      <StepProgress
        currentStep={1}
        totalSteps={6}
        stepTitle="Identity Verification"
      />

      {/* Hero Section with Sparkles Badge */}
      <div className="space-y-3 text-center">
        <div className="border-primary/30 bg-primary/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
          <HiSparkles className="h-3.5 w-3.5" />
          <span>Your Voice Shapes Tomorrow</span>
        </div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Voter Registration
        </h1>
        <p className="text-muted-foreground mx-auto max-w-lg text-sm sm:text-base">
          Verify your identity to participate in nationwide elections
        </p>
      </div>

      {/* Main Card */}
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
          <CardHeader className="border-border/40 border-b">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                Enter Your NIN
              </h2>
              <p className="text-muted-foreground text-sm">
                National Identification Number verification
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                {/* NIN Input Section */}
                <div className="space-y-2">
                  <Label
                    htmlFor="nin"
                    className="text-foreground text-sm font-medium"
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
                          "border-destructive focus:border-destructive",
                        verificationStatus === "verified" &&
                          "border-green-500 bg-green-50/50 focus:border-green-500",
                        verificationStatus === "error" &&
                          "border-red-500 bg-red-50/50 focus:border-red-500",
                      )}
                    />
                    {/* Digit Counter */}
                    <div className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs">
                      {getCharacterCount()}
                    </div>
                  </div>
                </div>

                {/* Error State */}
                {verificationStatus === "error" && (
                  <div className="space-y-2">
                    <div className="bg-destructive/10 border-destructive/20 flex gap-3 rounded-md border p-3">
                      <HiExclamationCircle className="text-destructive mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-destructive text-sm font-medium">
                          NIN verification failed
                        </p>
                        <p className="text-destructive/80 mt-1 text-xs">
                          Please check your NIN and try again
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
                  <div className="flex flex-col items-center justify-center gap-2 py-8">
                    <Loader2 className="text-primary h-5 w-5 animate-spin" />
                    <p className="text-muted-foreground text-sm">
                      Verifying your NIN with NIMC...
                    </p>
                  </div>
                )}

                {/* Success State */}
                {verificationStatus === "verified" && verificationData && (
                  <div className="space-y-4">
                    <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                      <HiCheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-700" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">
                          Verification Successful
                        </p>
                        <p className="mt-0.5 text-xs text-green-700">
                          Your identity has been verified
                        </p>
                      </div>
                    </div>

                    <div className="bg-muted/50 border-border space-y-3 rounded-lg border p-4">
                      <div>
                        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                          Full Name
                        </p>
                        <p className="text-foreground mt-1 text-base font-medium">
                          {verificationData.firstName}{" "}
                          {verificationData.lastName}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                            State
                          </p>
                          <p className="text-foreground mt-1 text-sm font-medium">
                            {verificationData.state}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                            LGA
                          </p>
                          <p className="text-foreground mt-1 text-sm font-medium">
                            {verificationData.lga}
                          </p>
                        </div>
                      </div>
                      <div className="border-border border-t pt-2">
                        <p className="text-muted-foreground text-xs">
                          Verified at{" "}
                          {new Date(
                            verificationData.verifiedAt,
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms Checkbox */}
                {verificationStatus === "verified" && (
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="min-w-0 flex-1">
                            <FormLabel className="text-foreground block cursor-pointer text-sm leading-relaxed font-normal">
                              I confirm that the information provided is
                              accurate and I accept the{" "}
                              <Link
                                href="/terms"
                                className="text-primary hover:text-primary/80 font-medium underline underline-offset-2"
                              >
                                terms and conditions
                              </Link>{" "}
                              for voter registration.
                            </FormLabel>
                          </div>
                        </div>
                        <FormMessage className="mt-2 ml-7" />
                      </FormItem>
                    )}
                  />
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {verificationStatus === "verified" ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="h-10 flex-1"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={!termsAccepted}
                        className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 flex-1 bg-gradient-to-r font-semibold transition-all duration-200"
                      >
                        Continue
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleVerifyNin}
                      disabled={
                        !isNINComplete() || verificationStatus === "verifying"
                      }
                      className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 w-full bg-gradient-to-r font-semibold transition-all duration-200"
                    >
                      {verificationStatus === "verifying" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify NIN"
                      )}
                    </Button>
                  )}
                </div>
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

      {/* Subtle Trust Indicators */}
      <div className="mx-auto max-w-2xl">
        <div className="text-muted-foreground/80 flex items-center justify-center gap-8 text-xs">
          <div className="flex items-center gap-2">
            <HiShieldCheck className="text-primary h-4 w-4" />
            <span className="font-medium">Secure & Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <HiCreditCard className="text-primary h-4 w-4" />
            <span className="font-medium">NIMC Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <HiCheckCircle className="text-primary h-4 w-4" />
            <span className="font-medium">Trusted Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}
