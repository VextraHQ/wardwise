"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  ArrowRight,
  ArrowLeft,
  Phone,
  Calendar,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
      age: payload.basic?.age || undefined,
      gender: payload.basic?.gender || undefined,
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
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">Step 2 of 6</span>
          <span className="text-muted-foreground">33% Complete</span>
        </div>
        <Progress value={33} className="h-2" />
      </div>

      {/* Hero Section */}
      <div className="space-y-4 text-center">
        <div className="from-primary/20 to-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br">
          <User className="text-primary h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Tell Us About Yourself
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            We need some basic information to complete your registration
          </p>
        </div>
        {isAutoFilled && (
          <Badge variant="secondary" className="mx-auto mt-4">
            <Info className="mr-1 h-3 w-3" />
            Some information was auto-filled from NIN verification
          </Badge>
        )}
      </div>

      {/* Main Card */}
      <Card className="border-border/40 bg-card/95 backdrop-blur-sm">
        <CardHeader className="border-border/40 space-y-3 border-b pb-6">
          <div className="flex items-center gap-4">
            <div className="from-primary/20 to-primary/10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br">
              <User className="text-primary h-6 w-6" />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-semibold">
                Personal Information
              </h2>
              <p className="text-muted-foreground text-sm">
                Your details remain confidential and secure
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          <Badge variant="outline" className="text-xs">
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
                          <Badge variant="outline" className="text-xs">
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
                        <Badge variant="outline" className="text-xs">
                          Auto-filled
                        </Badge>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>You must be at least 18 years old to register</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
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
                        <Badge variant="outline" className="text-xs">
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
                        value={field.value}
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
                                className="border-muted bg-card hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 transition-colors"
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
                                className="border-muted bg-card hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 transition-colors"
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
                                className="border-muted bg-card hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 transition-colors"
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
                            <Info className="text-muted-foreground h-4 w-4 cursor-help" />
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
                        <Phone className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
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

              {/* Navigation */}
              <div className="border-border/40 flex items-center justify-between border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/register")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>

                <Button
                  type="submit"
                  className="from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 h-12 gap-2 bg-gradient-to-r px-8 font-semibold transition-all duration-200"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Trust Indicators */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Data Privacy",
            description: "Your information is encrypted and secure",
            icon: User,
          },
          {
            title: "Age Verification",
            description: "Must be 18+ to participate",
            icon: Calendar,
          },
          {
            title: "Optional Contact",
            description: "Phone number is optional for notifications",
            icon: Phone,
          },
        ].map((item) => (
          <div
            key={item.title}
            className="border-border/40 bg-card/80 hover:bg-card/90 rounded-lg border p-4 text-center transition-all"
          >
            <div className="mb-2 flex justify-center">
              <item.icon className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-foreground text-sm font-semibold">
              {item.title}
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
