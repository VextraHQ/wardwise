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
import { useRegistrationStore } from "@/stores/registration-store";
import { normalizeNigerianPhoneInput } from "@/lib/registration-schemas";
import { useEffect } from "react";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import {
  ComboboxSelect,
  type ComboboxSelectOption,
} from "@/components/ui/combobox-select";

// Profile Form Schema Validation
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
  occupation: z.string().min(1, "Please select your occupation"),
  religion: z.string().min(1, "Please select your religion"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^(\+234|0)?(7\d{2}|8\d{2}|9\d{2})\d{7}$/,
      "Enter a valid Nigerian mobile number (e.g., 08031234567 or +2348031234567)",
    ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileStep() {
  const router = useRouter();
  const { update, payload } = useRegistrationStore();

  // Form Initial Values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: payload.basic?.firstName || "",
      lastName: payload.basic?.lastName || "",
      dateOfBirth: payload.basic?.dateOfBirth || "",
      age: payload.basic?.age ?? 18, // Use 18 as default to avoid undefined
      gender:
        (payload.basic?.gender as "male" | "female" | "other") || undefined,
      occupation: payload.basic?.occupation || "",
      religion: payload.basic?.religion || "",
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

  // Form Submission Handler
  const onSubmit = (data: ProfileFormValues) => {
    update({
      basic: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        age: data.age,
        gender: data.gender,
        occupation: data.occupation,
        religion: data.religion,
      },
      phone: normalizeNigerianPhoneInput(data.phoneNumber),
    });
    toast.success("Profile information saved!");
    router.push("/register/location");
  };

  // Calculate Age from Date of Birth
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

  // Handle Date of Birth Change
  const handleDateChange = (date: string) => {
    form.setValue("dateOfBirth", date);
    const age = calculateAge(date);
    if (age !== undefined) {
      form.setValue("age", age);
    }
  };

  // Autofilled Information
  const isAutoFilled = payload.basic?.firstName && payload.basic?.lastName;

  const occupationOptions: ComboboxSelectOption[] = [
    { value: "civil-servant", label: "Civil Servant" },
    { value: "teacher", label: "Teacher" },
    {
      value: "healthcare-worker",
      label: "Healthcare Worker",
    },
    { value: "farmer", label: "Farmer" },
    { value: "trader", label: "Trader/Business Owner" },
    {
      value: "artisan",
      label: "Artisan (Carpenter, Tailor, etc.)",
    },
    { value: "student", label: "Student" },
    { value: "unemployed", label: "Unemployed" },
    { value: "retired", label: "Retired" },
    {
      value: "private-sector",
      label: "Private Sector Employee",
    },
    { value: "security", label: "Security Personnel" },
    { value: "driver", label: "Driver/Transport Worker" },
    { value: "engineer", label: "Engineer" },
    { value: "lawyer", label: "Lawyer" },
    { value: "doctor", label: "Doctor/Medical Professional" },
    { value: "nurse", label: "Nurse" },
    { value: "accountant", label: "Accountant" },
    { value: "banker", label: "Banker" },
    { value: "journalist", label: "Journalist/Media" },
    { value: "pastor", label: "Pastor/Religious Leader" },
    { value: "imam", label: "Imam/Religious Leader" },
    { value: "other", label: "Other" },
  ];

  const religionOptions: ComboboxSelectOption[] = [
    { value: "christianity", label: "Christianity" },
    { value: "islam", label: "Islam" },
    { value: "traditional", label: "Traditional Religion" },
    { value: "other", label: "Other" },
    { value: "none", label: "None/Prefer not to say" },
  ];

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
                      {/* <FormDescription>
                        Select the option that best describes you
                      </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Occupation Field */}
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <ComboboxSelect
                            options={occupationOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select your occupation"
                            searchPlaceholder="Search occupations..."
                            emptyMessage="No occupation found."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Religion Field */}
                <FormField
                  control={form.control}
                  name="religion"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Religion/Creed</FormLabel>
                        <FormControl>
                          <ComboboxSelect
                            options={religionOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select your religion"
                            searchPlaceholder="Search religions..."
                            emptyMessage="No religion found."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Phone Number Field (Required) */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Phone Number <span className="text-destructive">*</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HiInformationCircle className="text-muted-foreground inline h-4 w-4 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Your phone number is required for registration
                                and to receive notifications about your
                                registration
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
                        Required: Your phone number for registration and
                        notifications
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
                    className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 flex-1 bg-linear-to-r font-semibold transition-all duration-200"
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
      <TrustIndicators
        items={[
          { icon: <HiUser className="h-4 w-4" />, label: "Data Privacy" },
          { icon: <HiCalendar className="h-4 w-4" />, label: "Age Verified" },
          { icon: <HiPhone className="h-4 w-4" />, label: "Contact Verified" },
        ]}
      />
    </div>
  );
}
