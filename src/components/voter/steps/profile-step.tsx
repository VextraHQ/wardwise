"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HiUser,
  HiPhone,
  HiCalendar,
  HiInformationCircle,
  HiSparkles,
} from "react-icons/hi";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRegistration } from "@/hooks/use-registration";
import { normalizeNigerianPhoneInput } from "@/lib/registration-schemas";
import { useEffect } from "react";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  age: z
    .number()
    .int()
    .min(18, "You must be at least 18 years old")
    .max(120, "Please enter a valid age"),
  gender: z.enum(["male", "female", "other"], {
    message: "Please select your gender",
  }),
  phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileStep() {
  const router = useRouter();
  const { update, payload } = useRegistration();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: payload.basic?.firstName || "",
      lastName: payload.basic?.lastName || "",
      dateOfBirth: payload.basic?.dateOfBirth || "",
      age: payload.basic?.age ?? 18, // Use 18 as default to avoid undefined
      gender:
        (payload.basic?.gender as "male" | "female" | "other") || undefined,
      phoneNumber: payload.phone ? payload.phone.replace("+234", "0") : "",
    },
  });

  // Auto-fill from NIN verification if available
  useEffect(() => {
    if (
      payload.basic?.firstName &&
      payload.basic?.lastName &&
      payload.basic?.dateOfBirth
    ) {
      form.setValue("firstName", payload.basic.firstName);
      form.setValue("lastName", payload.basic.lastName);
      form.setValue("dateOfBirth", payload.basic.dateOfBirth);
      if (payload.basic.age) {
        form.setValue("age", payload.basic.age);
      }
    }
  }, [payload.basic, form]);

  const onSubmit = (data: ProfileFormValues) => {
    update({
      basic: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        age: data.age,
        gender: data.gender,
      },
      phone: data.phoneNumber
        ? normalizeNigerianPhoneInput(data.phoneNumber)
        : undefined,
    });
    toast.success("Profile information saved!");
    router.push("/register/location");
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return undefined;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleDateChange = (date: string) => {
    form.setValue("dateOfBirth", date);
    const age = calculateAge(date);
    if (age !== undefined) {
      form.setValue("age", age);
    }
  };

  const isAutoFilled = payload.basic?.firstName && payload.basic?.lastName;

  return (
    <div className="space-y-6">
      {/* Reusable Progress Component */}
      <StepProgress
        currentStep={2}
        totalSteps={6}
        stepTitle="Personal Information"
      />

      {/* Hero Section with Sparkles Badge */}
      <div className="space-y-3 text-center">
        <div className="border-primary/30 bg-primary/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
          <HiSparkles className="h-3.5 w-3.5" />
          <span>Building Your Profile</span>
        </div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Tell Us About Yourself
        </h1>
        <p className="text-muted-foreground mx-auto max-w-lg text-sm sm:text-base">
          We need some basic information to complete your registration
        </p>
        {isAutoFilled && (
          <Badge variant="secondary" className="mx-auto mt-2">
            <HiInformationCircle className="mr-1 h-3 w-3" />
            Some information was auto-filled from NIN verification
          </Badge>
        )}
      </div>

      {/* Main Card */}
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
          <CardHeader className="border-border border-b">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                Personal Information
              </h2>
              <p className="text-muted-foreground text-sm">
                Your details remain confidential and secure
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                {/* Name Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          First Name
                          {isAutoFilled && field.value && (
                            <Badge variant="secondary" className="text-xs">
                              Auto-filled
                            </Badge>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your first name"
                            className="border-border/60 bg-background/50 focus:border-primary/60 focus:bg-background h-12 transition-all"
                            disabled={Boolean(
                              isAutoFilled && field.value && field.value !== "",
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Last Name
                          {isAutoFilled && field.value && (
                            <Badge variant="secondary" className="text-xs">
                              Auto-filled
                            </Badge>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your last name"
                            className="h-11"
                            disabled={Boolean(
                              isAutoFilled && field.value && field.value !== "",
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date of Birth Field */}
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Date of Birth
                        {isAutoFilled && field.value && (
                          <Badge variant="secondary" className="text-xs">
                            Auto-filled
                          </Badge>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HiInformationCircle className="text-muted-foreground inline h-4 w-4 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                You must be at least 18 years old to register
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <HiCalendar className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                          <Input
                            {...field}
                            type="date"
                            placeholder="Select your date of birth"
                            className="border-border/60 bg-background/50 focus:border-primary/60 focus:bg-background h-12 pl-11 transition-all"
                            onChange={(e) => handleDateChange(e.target.value)}
                            disabled={Boolean(
                              isAutoFilled && field.value && field.value !== "",
                            )}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Age Field */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Age
                        {isAutoFilled && field.value && (
                          <Badge variant="secondary" className="text-xs">
                            Auto-calculated
                          </Badge>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          inputMode="numeric"
                          placeholder="Enter your age"
                          className="border-border/60 bg-background/50 focus:border-primary/60 focus:bg-background h-12 transition-all"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? 18 : parseInt(value, 10),
                            );
                          }}
                          disabled={Boolean(
                            isAutoFilled && field.value !== undefined,
                          )}
                        />
                      </FormControl>
                      <FormDescription>
                        Age is automatically calculated from your date of birth
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender Field */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                          className="grid grid-cols-3 gap-4"
                        >
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <RadioGroupItem
                                  value="male"
                                  id="male"
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor="male"
                                  className="border-muted bg-card hover:bg-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 transition-colors hover:text-white"
                                >
                                  <span className="text-sm font-medium">
                                    Male
                                  </span>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <RadioGroupItem
                                  value="female"
                                  id="female"
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor="female"
                                  className="border-muted bg-card hover:bg-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 transition-colors hover:text-white"
                                >
                                  <span className="text-sm font-medium">
                                    Female
                                  </span>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <RadioGroupItem
                                  value="other"
                                  id="other"
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor="other"
                                  className="border-muted bg-card hover:bg-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 transition-colors hover:text-white"
                                >
                                  <span className="text-sm font-medium">
                                    Other
                                  </span>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        Select the option that best describes you
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number Field (Optional) */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Phone Number (Optional)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HiInformationCircle className="text-muted-foreground inline h-4 w-4 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Add your phone number to receive notifications
                                about your registration
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <HiPhone className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                          <Input
                            {...field}
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="08012345678 or +2348012345678"
                            className="border-border/60 bg-background/50 focus:border-primary/60 focus:bg-background h-12 pl-11 transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Optional: Add your phone number for notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/register")}
                    className="h-10 flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 flex-1 bg-gradient-to-r font-semibold transition-all duration-200"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Subtle Trust Indicators */}
      <div className="mx-auto max-w-2xl">
        <div className="text-muted-foreground/80 flex items-center justify-center gap-8 text-xs">
          <div className="flex items-center gap-2">
            <HiUser className="text-primary h-4 w-4" />
            <span className="font-medium">Data Privacy</span>
          </div>
          <div className="flex items-center gap-2">
            <HiCalendar className="text-primary h-4 w-4" />
            <span className="font-medium">Age Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <HiPhone className="text-primary h-4 w-4" />
            <span className="font-medium">Optional Contact</span>
          </div>
        </div>
      </div>
    </div>
  );
}
