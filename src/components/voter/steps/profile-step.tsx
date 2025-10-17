"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
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

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  age: z.coerce
    .number()
    .int()
    .min(18, "You must be at least 18 years old")
    .max(120, "Please enter a valid age"),
  gender: z.enum(["male", "female", "other"], {
    message: "Please select your gender",
  }),
}) as any;

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileStep() {
  const router = useRouter();
  const { update, payload } = useRegistration();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      age: undefined,
      gender: undefined,
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    update({
      basic: {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        gender: data.gender,
      },
    });
    toast.success("Profile information saved!");
    router.push("/register/location");
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">Step 3 of 7</span>
          <span className="text-muted-foreground">43% Complete</span>
        </div>
        <Progress value={43} className="h-2" />
      </div>

      {/* Hero Section */}
      <div className="space-y-2 text-center">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Tell Us About Yourself
        </h1>
        <p className="text-muted-foreground text-lg">
          We need some basic information to complete your registration
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="border-border/60 space-y-2 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/15 flex h-10 w-10 items-center justify-center rounded-full">
              <User className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-semibold">
                Personal Information
              </h2>
              <p className="text-muted-foreground text-sm">
                Your details remain confidential
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your first name"
                          className="h-11"
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your last name"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Age Field */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        inputMode="numeric"
                        placeholder="Enter your age"
                        className="h-11"
                      />
                    </FormControl>
                    <FormDescription>
                      You must be at least 18 years old to register
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
                                className="border-muted bg-card hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer items-center justify-center rounded-lg border-2 p-4"
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
                                className="border-muted bg-card hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer items-center justify-center rounded-lg border-2 p-4"
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
                                className="border-muted bg-card hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer items-center justify-center rounded-lg border-2 p-4"
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

              {/* Navigation */}
              <div className="border-border/60 flex items-center justify-between border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/register/verify")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="from-primary to-primary/90 gap-2 bg-gradient-to-r"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
