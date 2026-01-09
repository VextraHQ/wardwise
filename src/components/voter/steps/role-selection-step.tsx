"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HiUser,
  HiShieldCheck,
  HiCheckCircle,
  HiArrowRight,
  HiArrowLeft,
  HiExclamationCircle,
} from "react-icons/hi";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepProgress } from "@/components/ui/step-progress";
import { RegistrationStepHeader } from "@/components/voter/registration-step-header";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useRegistrationStore } from "@/stores/registration-store";
import { useEffect, useMemo } from "react";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { type Voter } from "@/types/voter";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "motion/react";

const roleSchema = z.object({
  role: z.enum(["voter", "supporter"]),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export function RoleSelectionStep() {
  const router = useRouter();
  const { update, payload, hasHydrated } = useRegistrationStore();

  const age = payload.basic?.age || 0;
  const isUnder18 = age < 18;

  const initialValues = useMemo((): RoleFormValues => {
    if (!hasHydrated) return { role: "voter" };
    if (isUnder18) return { role: "supporter" };
    return {
      role: (payload.basic?.role as Voter["role"]) ?? "voter",
    };
  }, [hasHydrated, payload.basic?.role, isUnder18]);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (!hasHydrated) return;
    form.reset(initialValues);
  }, [hasHydrated, initialValues, form]);

  // const roleValue = useWatch({ control: form.control, name: "role" });

  const onSubmit = (data: RoleFormValues) => {
    update({
      basic: {
        ...(payload.basic as Voter),
        role: data.role as Voter["role"],
      },
    });
    router.push("/register/location");
  };

  if (!hasHydrated) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-10 py-8">
        <StepProgress
          currentStep={3}
          totalSteps={6}
          stepTitle="Role Selection"
        />
        <div className="border-border/60 bg-card/50 flex min-h-[400px] flex-col items-center justify-center border backdrop-blur-sm">
          <Spinner className="text-primary size-7" />
          <p className="text-muted-foreground mt-4 text-sm font-medium">
            Loading your information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-10 py-8">
      <StepProgress currentStep={3} totalSteps={6} stepTitle="Role Selection" />

      <RegistrationStepHeader
        icon={Users}
        badge="Role Assignment"
        title="Select Your Role"
        description="Choose your participation level. Voter eligibility is determined by your verified age."
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative overflow-hidden border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]"
      >
        <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

        <div className="p-7 sm:p-10">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
                Participation Tier
              </h2>
              <div className="flex items-center gap-2">
                <div className="bg-primary/60 size-1.5 rounded-[1px]" />
                <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                  Eligibility Check{" "}
                  <span className="text-primary/40 mx-1">|</span>{" "}
                  <span className="text-foreground font-bold">
                    {age} Years • {isUnder18 ? "Supporter" : "Eligible"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid w-full gap-3 sm:grid-cols-2"
                        disabled={isUnder18}
                      >
                        {/* Voter Option */}
                        <label
                          htmlFor="voter"
                          className={cn(
                            "group border-border/60 bg-muted/20 relative flex w-full cursor-pointer flex-col gap-5 rounded-xl border p-5 transition-all duration-300",
                            field.value === "voter"
                              ? "border-primary bg-primary/5 shadow-inner"
                              : "hover:border-primary/30 hover:bg-muted/30",
                            isUnder18 &&
                              "cursor-not-allowed opacity-40 grayscale",
                          )}
                        >
                          <RadioGroupItem
                            value="voter"
                            id="voter"
                            className="sr-only"
                            disabled={isUnder18}
                          />

                          <div className="flex items-start justify-between">
                            <div
                              className={cn(
                                "flex size-9 items-center justify-center rounded-lg border transition-all",
                                field.value === "voter"
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "bg-background border-border text-muted-foreground",
                              )}
                            >
                              <HiShieldCheck className="size-4.5" />
                            </div>
                            {field.value === "voter" && (
                              <div className="bg-primary flex size-4.5 items-center justify-center rounded-full shadow-[0_0_8px_rgba(31,107,94,0.3)]">
                                <HiCheckCircle className="size-4.5 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-foreground text-[13px] font-bold tracking-widest uppercase">
                              General Voter
                            </h3>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                              Full participation in Ward-level polling and
                              verification.
                            </p>
                            <div className="pt-1.5">
                              <div className="border-border/60 bg-background inline-flex rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold tracking-tight uppercase">
                                Age: 18+ Years
                              </div>
                            </div>
                          </div>
                        </label>

                        {/* Supporter Option */}
                        <label
                          htmlFor="supporter"
                          className={cn(
                            "group border-border/60 bg-muted/20 relative flex w-full cursor-pointer flex-col gap-5 rounded-xl border p-5 transition-all duration-300",
                            field.value === "supporter"
                              ? "border-primary bg-primary/5 shadow-inner"
                              : "hover:border-primary/30 hover:bg-muted/30",
                          )}
                        >
                          <RadioGroupItem
                            value="supporter"
                            id="supporter"
                            className="sr-only"
                          />

                          <div className="flex items-start justify-between">
                            <div
                              className={cn(
                                "flex size-9 items-center justify-center rounded-lg border transition-all",
                                field.value === "supporter"
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "bg-background border-border text-muted-foreground",
                              )}
                            >
                              <HiUser className="size-4.5" />
                            </div>
                            {field.value === "supporter" && (
                              <div className="bg-primary flex size-4.5 items-center justify-center rounded-full shadow-[0_0_8px_rgba(31,107,94,0.3)]">
                                <HiCheckCircle className="size-4.5 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-foreground text-[13px] font-bold tracking-widest uppercase">
                              Supporter
                            </h3>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                              Advocate for community leadership and track
                              movement progress.
                            </p>
                            <div className="pt-1.5">
                              <div className="border-border/60 bg-background inline-flex rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold tracking-tight uppercase">
                                Age: All Ages
                              </div>
                            </div>
                          </div>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                {isUnder18 && (
                  <div className="flex gap-3 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                    <HiExclamationCircle className="size-4 shrink-0 text-orange-600" />
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold tracking-widest text-orange-600 uppercase">
                        Eligibility Restriction
                      </p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Based on NIN data, you are ineligible for Voter status.
                        Registration is restricted to the Supporter role.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/register/profile")}
                    className="border-border/60 bg-background hover:bg-muted h-11 flex-1 rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
                  >
                    <HiArrowLeft className="mr-2 size-3.5" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/95 h-11 flex-1 rounded-xl text-xs font-bold tracking-widest uppercase transition-all active:scale-95"
                  >
                    Continue
                    <HiArrowRight className="ml-2 size-3.5" />
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </motion.div>

      <TrustIndicators
        className="pt-2"
        items={[
          {
            icon: <HiShieldCheck />,
            label: "SECURE_PROTOCOL",
          },
          {
            icon: <HiUser />,
            label: "IDENTITY_CONFIRMED",
          },
        ]}
      />
    </div>
  );
}
