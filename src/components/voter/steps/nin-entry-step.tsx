"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HiCreditCard,
  HiCheckCircle,
  HiShieldCheck,
  HiInformationCircle,
} from "react-icons/hi";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StepProgress } from "@/components/ui/step-progress";
import { RegistrationStepHeader } from "@/components/voter/registration-step-header";
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
import {
  formatNINForDisplay,
  normalizeNINInput,
} from "@/lib/schemas/common-schemas";
import { ninFormSchema, type NinFormValues } from "@/lib/schemas/voter-schemas";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { DemoIndicator } from "@/components/ui/demo-indicator";

// Note: Verification now happens at registration submit (Step 5) to reduce costs
// This step only validates NIN format and checks for duplicates

export function NinEntryStep() {
  const router = useRouter();
  const { update } = useRegistrationStore();
  const [rawNin, setRawNin] = useState("");

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
    },
    [form],
  );

  // Handle form submission - just store NIN, verification happens at final submit
  const onSubmit = (data: NinFormValues) => {
    // Store NIN in registration payload (verification will happen at submit)
    update({ nin: data.nin });

    // Redirect to profile step
    router.push("/register/profile");
    toast.success("NIN saved. You'll complete verification at the end.");
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
                      maxLength={13}
                      className={cn(
                        "border-border/60 focus:border-primary focus:ring-primary disabled:bg-muted/50 h-12 pr-16 pl-12 text-base tracking-wider transition-all duration-200 placeholder:text-sm",
                        form.formState.errors.nin &&
                          "border-destructive focus:border-destructive focus:ring-destructive",
                      )}
                    />
                    <div className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs">
                      {getCharacterCount()}
                    </div>
                  </div>
                  {form.formState.errors.nin && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.nin.message}
                    </p>
                  )}
                </div>

                {/* Info about verification timing */}
                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                  <HiInformationCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Your NIN will be verified when you complete registration
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      We verify your identity at the final step to ensure a
                      smooth registration process.
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
                                I confirm that I will provide accurate
                                information and I accept the{" "}
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

                {/* Action Button */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={!isNINComplete() || !termsAccepted}
                    className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 w-full bg-linear-to-r font-semibold transition-all duration-200 disabled:opacity-50"
                  >
                    Continue
                    <HiShieldCheck className="ml-2 h-4 w-4" />
                  </Button>
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
