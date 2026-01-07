"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { StepProgress } from "@/components/ui/step-progress";
import { RegistrationStepHeader } from "../registration-step-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

// Role Selection Schema
const roleSchema = z.object({
  role: z.enum(["voter", "supporter"]),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export function RoleSelectionStep() {
  const router = useRouter();
  const { update, payload, hasHydrated } = useRegistrationStore();

  // Get age from payload (from NIN verification)
  const age = payload.basic?.age || 0;
  const isUnder18 = age < 18;

  // Get initial values
  const initialValues = useMemo((): RoleFormValues => {
    if (!hasHydrated) return { role: "voter" };

    // If under 18, force supporter
    if (isUnder18) return { role: "supporter" };

    return {
      role: (payload.basic?.role as Voter["role"]) ?? "voter",
    };
  }, [hasHydrated, payload.basic?.role, isUnder18]);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: initialValues,
  });

  // Update form when hydration completes or conditions change
  useEffect(() => {
    if (!hasHydrated) return;
    form.reset(initialValues);
  }, [hasHydrated, initialValues, form]);

  const role = useWatch({ control: form.control, name: "role" });

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
      <div className="space-y-6">
        <StepProgress
          currentStep={3}
          totalSteps={6}
          stepTitle="Role Selection"
        />
        <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
          <CardContent className="flex min-h-[400px] items-center justify-center">
            <div className="space-y-4 text-center">
              <div className="border-primary/30 bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border">
                <Spinner className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-foreground text-sm font-medium">
                  Loading your information...
                </p>
                <p className="text-muted-foreground text-xs">
                  Preparing role selection options
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StepProgress currentStep={3} totalSteps={6} stepTitle="Role Selection" />

      {/* Hero Section with Badge */}
      <RegistrationStepHeader
        icon={Users}
        badge="Choose Your Participation"
        title="Select Your Role"
        description="Choose how you want to participate in the election process"
      />

      <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
        <CardHeader className="border-border border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                Registration Type
              </h2>
              <p className="text-muted-foreground text-sm">
                Based on your age ({age} years old)
              </p>
            </div>
            {isUnder18 && (
              <Badge
                variant="secondary"
                className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
              >
                Under 18
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            "relative flex w-full cursor-pointer flex-col gap-3 rounded-lg border-2 p-4 transition-all",
                            field.value === "voter"
                              ? "border-primary bg-primary/5 ring-primary/20 ring-2 ring-offset-1"
                              : "border-border hover:border-primary/50 hover:bg-accent/5",
                            isUnder18 && "cursor-not-allowed opacity-50",
                          )}
                          onClick={(e) => {
                            if (isUnder18) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <RadioGroupItem
                            value="voter"
                            id="voter"
                            className="sr-only"
                            disabled={isUnder18}
                          />
                          <div className="flex items-center justify-between">
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                                field.value === "voter"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <HiShieldCheck className="h-5 w-5" />
                            </div>
                            {field.value === "voter" && (
                              <HiCheckCircle className="text-primary h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 text-base font-semibold">
                              Voter
                            </div>
                            <div className="text-muted-foreground mb-2 text-xs sm:text-sm">
                              I want to vote in elections
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-normal"
                            >
                              Must be 18+ years old
                            </Badge>
                          </div>
                        </label>

                        {/* Supporter Option */}
                        <label
                          htmlFor="supporter"
                          className={cn(
                            "relative flex w-full cursor-pointer flex-col gap-3 rounded-lg border-2 p-4 transition-all",
                            field.value === "supporter"
                              ? "border-primary bg-primary/5 ring-primary/20 ring-2 ring-offset-1"
                              : "border-border hover:border-primary/50 hover:bg-accent/5",
                          )}
                        >
                          <RadioGroupItem
                            value="supporter"
                            id="supporter"
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between">
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                                field.value === "supporter"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <HiUser className="h-5 w-5" />
                            </div>
                            {field.value === "supporter" && (
                              <HiCheckCircle className="text-primary h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 text-base font-semibold">
                              Supporter
                            </div>
                            <div className="text-muted-foreground mb-2 text-xs sm:text-sm">
                              I want to support candidates
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-normal"
                            >
                              Open to all ages
                            </Badge>
                          </div>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Messages based on selection/state */}
              {isUnder18 && (
                <Alert
                  variant="default"
                  className="border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                >
                  <HiExclamationCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle>Age Restriction</AlertTitle>
                  <AlertDescription>
                    Since you are under 18 ({age} years old), you can only
                    register as a Supporter. You will be able to follow
                    campaigns but cannot vote.
                  </AlertDescription>
                </Alert>
              )}

              {role === "voter" && !isUnder18 && (
                <Alert className="bg-primary/5 border-primary/10">
                  <HiCheckCircle className="text-primary h-4 w-4" />
                  <AlertTitle>Voter Verification</AlertTitle>
                  <AlertDescription>
                    As a voter, you will be asked to provide your VIN (Voter
                    Identification Number) in the next step for verification.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/register/profile")}
                  className="h-10 flex-1"
                >
                  <HiArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 flex-1 font-semibold transition-all duration-200"
                >
                  Continue
                  <HiArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <TrustIndicators
        items={[
          {
            icon: <HiShieldCheck className="h-4 w-4" />,
            label: "Role Based Access",
          },
          { icon: <HiUser className="h-4 w-4" />, label: "Age Verified" },
        ]}
      />
    </div>
  );
}
