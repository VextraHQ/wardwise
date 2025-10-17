"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import Link from "next/link";
import { mockApi, getDemoMessage } from "@/lib/mock/mockApi";
import {
  phoneSchema,
  normalizeNigerianPhoneInput,
} from "@/lib/registration-schemas";

const phoneFormSchema = z.object({
  phone: phoneSchema,
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}) as any;

type PhoneFormValues = z.infer<typeof phoneFormSchema>;

export function PhoneEntryStep() {
  const router = useRouter();
  const { update } = useRegistration();
  const [rawPhone, setRawPhone] = useState("");

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phone: "",
      terms: false,
    },
  });

  const sendOtp = useMutation({
    mutationFn: async (data: PhoneFormValues) => {
      // Use mock API for demo
      return await mockApi.sendOtp(data.phone);
    },
    onSuccess: (_, variables) => {
      toast.success(getDemoMessage("Verification code sent to your phone"));
      update({ phone: variables.phone });
      router.push("/register/verify");
    },
    onError: () => {
      toast.error("Failed to send verification code. Please try again.");
    },
  });

  const onSubmit = (data: PhoneFormValues) => {
    sendOtp.mutate(data);
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">Step 1 of 7</span>
          <span className="text-muted-foreground">14% Complete</span>
        </div>
        <Progress value={14} className="h-2" />
      </div>

      {/* Hero Section */}
      <div className="space-y-4 text-center">
        <div className="border-primary/30 bg-primary/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Your Voice Shapes Tomorrow</span>
        </div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Register to Participate
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xl text-lg">
          Join Adamawa State elections. Complete our survey and choose your
          candidate.
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-border bg-card">
        <CardHeader className="border-border space-y-2 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/15 flex h-10 w-10 items-center justify-center rounded-full">
              <Phone className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-semibold">
                Enter Your Phone Number
              </h2>
              <p className="text-muted-foreground text-sm">
                We'll send you a verification code
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Phone Input */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nigerian Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                        <Input
                          {...field}
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="08012345678 or +2348012345678"
                          className={cn(
                            "h-12 pl-11 text-base",
                            form.formState.errors.phone && "border-destructive",
                          )}
                          value={rawPhone}
                          onChange={(e) => {
                            const input = e.target.value;
                            setRawPhone(input);
                            const normalized =
                              normalizeNigerianPhoneInput(input);
                            field.onChange(normalized);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Terms Checkbox */}
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start gap-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="cursor-pointer text-sm leading-relaxed font-medium">
                          I agree to the{" "}
                          <Link
                            href="/terms"
                            className="text-primary hover:underline"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy"
                            className="text-primary hover:underline"
                          >
                            Privacy Policy
                          </Link>
                        </FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          By continuing, you consent to our data processing
                          practices and agree to receive SMS notifications.
                        </FormDescription>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={sendOtp.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full text-base font-semibold"
              >
                {sendOtp.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    Sending code...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Get Started
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
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

      {/* Trust Indicators */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Secure & Encrypted",
            description: "Your data is protected end-to-end",
          },
          {
            title: "One-Time Registration",
            description: "Simple process, no password needed",
          },
          {
            title: "Verified Voters Only",
            description: "Phone verification ensures integrity",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="border-border bg-card rounded-lg border p-4 text-center"
          >
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
