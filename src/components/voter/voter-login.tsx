"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Phone, ArrowRight, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRegistration } from "@/hooks/use-registration";
import { cn } from "@/lib/utils";
import { mockApi, demoPhones, getDemoMessage } from "@/lib/mock/mockApi";

export function VoterLogin() {
  const router = useRouter();
  const { update } = useRegistration();
  const [rawPhone, setRawPhone] = useState("");

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

  const isValidPhone = /^\+234\d{10}$/.test(formattedPhone);

  const loginMutation = useMutation({
    mutationFn: async (phone: string) => {
      // Use mock API for demo
      return await mockApi.checkRegistration(phone, 2024);
    },
    onSuccess: (data) => {
      if (data.exists) {
        // User exists, redirect to profile
        update({ phone: formattedPhone });
        toast.success(
          getDemoMessage("Login successful - redirecting to profile"),
        );
        router.push("/voter/profile");
      } else {
        // User doesn't exist, redirect to registration
        update({ phone: formattedPhone });
        toast.info(getDemoMessage("New user - redirecting to registration"));
        router.push("/register");
      }
    },
    onError: (error) => {
      toast.error("Login failed. Please try again.");
      console.error("Login error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone) {
      toast.error("Please enter a valid Nigerian phone number");
      return;
    }
    loginMutation.mutate(formattedPhone);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4 text-center">
        <div className="border-primary/30 bg-primary/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
          <UserCheck className="h-3.5 w-3.5" />
          <span>Returning Voter</span>
        </div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Welcome Back
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xl text-lg">
          Enter your phone number to access your profile and registration
          details
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
                Login to Your Account
              </h2>
              <p className="text-muted-foreground text-sm">
                Enter your registered phone number
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div className="space-y-2">
              <Label htmlFor="phone">Nigerian Phone Number</Label>
              <div className="relative">
                <Phone className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                <Input
                  id="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="08012345678 or +2348012345678"
                  className={cn(
                    "h-12 pl-11 text-base",
                    rawPhone.length > 0 &&
                      !isValidPhone &&
                      "border-destructive focus:border-destructive",
                  )}
                  value={rawPhone}
                  onChange={(e) => setRawPhone(e.target.value)}
                />
              </div>
              {rawPhone.length > 0 && !isValidPhone && (
                <p className="text-destructive text-sm">
                  Please enter a valid Nigerian phone number
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                Enter the phone number you used to register
              </p>

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
                      onClick={() => setRawPhone(phone.replace("+234", "0"))}
                      className="text-primary hover:text-primary/80 text-xs underline"
                    >
                      {phone}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isValidPhone || loginMutation.isPending}
              className="from-primary to-primary/90 h-12 w-full bg-gradient-to-r text-base font-semibold shadow-lg transition-all hover:shadow-xl"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Checking account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Login
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="text-muted-foreground mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Trust Indicators */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Secure Login",
            description: "Phone verification for security",
          },
          {
            title: "Quick Access",
            description: "View your profile instantly",
          },
          {
            title: "Update Anytime",
            description: "Change details within 7 days",
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
