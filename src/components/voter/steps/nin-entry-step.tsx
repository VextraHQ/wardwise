"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HiCreditCard,
  HiShieldCheck,
  HiInformationCircle,
} from "react-icons/hi";
import { IdCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { motion } from "motion/react";

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

  const termsAccepted = useWatch({
    control: form.control,
    name: "terms",
  });

  const handleNINChange = useCallback(
    (input: string) => {
      const normalized = normalizeNINInput(input);
      const formatted = formatNINForDisplay(normalized);

      setRawNin(formatted);
      form.setValue("nin", normalized);
    },
    [form],
  );

  const onSubmit = (data: NinFormValues) => {
    update({ nin: data.nin });
    router.push("/register/profile");
    toast.success("NIN registered successfully");
  };

  const getCharacterCount = () => {
    const digits = rawNin.replace(/\D/g, "");
    return `${digits.length}/11`;
  };

  const isNINComplete = () => {
    const digits = rawNin.replace(/\D/g, "");
    return digits.length === 11;
  };

  return (
    <div className="space-y-10">
      <StepProgress
        currentStep={1}
        totalSteps={6}
        stepTitle="Identity Verification"
      />

      <RegistrationStepHeader
        icon={IdCard}
        badge="Citizen Onboarding"
        title="Start Your Registration"
        description="Provide your National Identification Number (NIN) to begin your voter enrollment process."
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
                Identification
              </h2>
              <div className="flex items-center gap-2">
                <div className="bg-primary/60 size-1.5 rounded-[1px]" />
                <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                  Identity Check <span className="text-primary/40 mx-1">|</span>{" "}
                  <span className="text-foreground font-bold">Required</span>
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    placeholder="0000 0000 000"
                    value={rawNin}
                    onChange={(e) => handleNINChange(e.target.value)}
                    maxLength={13}
                    className={cn(
                      "border-border/60 bg-muted/5 focus:border-primary focus:ring-primary h-12 pr-14 pl-12 font-mono text-base font-bold tracking-[0.15em] transition-all",
                      form.formState.errors.nin &&
                        "border-destructive focus:border-destructive focus:ring-destructive",
                    )}
                  />
                  <div className="text-muted-foreground absolute top-1/2 right-3.5 -translate-y-1/2 font-mono text-[9px] font-bold uppercase">
                    {getCharacterCount()}
                  </div>
                </div>
                {form.formState.errors.nin && (
                  <p className="text-destructive font-mono text-xs font-medium tracking-wide uppercase">
                    {form.formState.errors.nin.message}
                  </p>
                )}
              </div>

              {/* Information Box */}
              <div className="border-primary/20 bg-primary/5 flex gap-3 rounded-xl border p-4">
                <HiInformationCircle className="text-primary mt-0.5 size-4 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-primary text-xs font-bold tracking-widest uppercase">
                    Verification notice
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                    Final identity confirmation occurs at the final step. Ensure
                    all data matches your official records for successful
                    registration.
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <div className="border-border/60 bg-muted/20 hover:bg-muted/30 rounded-xl border p-4 transition-colors">
                      <div className="flex items-start space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5 border-2"
                          />
                        </FormControl>
                        <div className="space-y-0.5">
                          <FormLabel className="text-foreground block cursor-pointer text-xs leading-relaxed font-bold tracking-tight uppercase">
                            I verify that my information is accurate and I
                            accept the{" "}
                            <Link
                              href="/terms"
                              className="text-primary decoration-primary/30 hover:decoration-primary underline underline-offset-4"
                              target="_blank"
                            >
                              Terms and Conditions
                            </Link>
                            .
                          </FormLabel>
                        </div>
                      </div>
                    </div>
                    <FormMessage className="mt-2 text-[9px] tracking-wide uppercase" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={!isNINComplete() || !termsAccepted}
                className="bg-primary text-primary-foreground hover:bg-primary/95 h-11 w-full rounded-xl text-xs font-bold tracking-widest uppercase transition-all active:scale-95 disabled:grayscale"
              >
                Continue to Profile
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              Already registered?{" "}
              <Link
                href="/voter-login"
                className="text-primary font-bold underline-offset-4 hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      <TrustIndicators
        items={[
          {
            icon: <HiShieldCheck />,
            label: "DATA_SECURE",
          },
          {
            icon: <HiCreditCard />,
            label: "NIMC_VERIFIED",
          },
          {
            icon: <HiShieldCheck />,
            label: "PRIVACY_FIRST",
          },
        ]}
      />
    </div>
  );
}
