"use client";

import { useState, useMemo } from "react";
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
import { mockApi, demoPhones, getDemoMessage } from "@/lib/mock/mockApi";

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+234\d{10}$/u, "Use Nigerian format e.g. +2348012345678"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

export function PhoneEntryStep() {
  const router = useRouter();
  const { update } = useRegistration();
  const [rawPhone, setRawPhone] = useState("");

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema) as any,
    defaultValues: {
      phone: "",
      terms: false,
    },
  });

  const formattedPhone = useMemo(() => {
    const digits = rawPhone.replace(/\D/g, "");
    if (digits.startsWith("234")) {
      return "+" + digits;
    }
    if (digits.startsWith("0")) {
      return "+234" + digits.slice(1);
    }
    return rawPhone;
  }, [rawPhone]);

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
      <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="border-border/60 space-y-2 border-b pb-6">
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
                            setRawPhone(e.target.value);
                            field.onChange(formattedPhone);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter your phone number in Nigerian format
                    </FormDescription>

                    {/* Demo phones for testing */}
                    <div className="mt-3 space-y-2">
                      <p className="text-muted-foreground text-xs font-medium">
                        Demo phones for testing:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {demoPhones.map((phone) => (
                          <button
                            key={phone}
                            type="button"
                            onClick={() =>
                              setRawPhone(phone.replace("+234", "0"))
                            }
                            className="text-primary hover:text-primary/80 text-xs underline"
                          >
                            {phone}
                          </button>
                        ))}
                      </div>
                    </div>

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
                    <div className="border-border/60 bg-muted/50 flex items-start gap-3 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="cursor-pointer text-sm font-medium">
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
                        <FormDescription className="text-xs">
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
                className="from-primary to-primary/90 h-12 w-full bg-gradient-to-r text-base font-semibold shadow-lg transition-all hover:shadow-xl"
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
            className="border-border/60 bg-card/60 rounded-lg border p-4 text-center backdrop-blur-sm"
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
