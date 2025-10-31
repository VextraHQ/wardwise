"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Database,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRegistration } from "@/hooks/use-registration";
import { mockApi } from "@/lib/mock/mockApi";
import { TrustIndicators } from "@/components/ui/trust-indicators";

export function DuplicateCheckStep() {
  const router = useRouter();
  const { payload } = useRegistration();
  const phone = payload.phone || "";
  const electionYear = payload.electionYear || new Date().getFullYear();

  useEffect(() => {
    if (!phone) {
      router.push("/register");
    }
  }, [phone, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["check-registration", phone, electionYear],
    queryFn: async () => {
      // Use mock API for demo
      return await mockApi.checkRegistration(phone, electionYear);
    },
    enabled: !!phone,
  });

  useEffect(() => {
    if (data && !isLoading) {
      if (data.exists) {
        // Already registered - show options
        setTimeout(() => {
          router.push("/register/already-registered");
        }, 2000);
      } else {
        // Not registered - continue to profile
        setTimeout(() => {
          router.push("/register/profile");
        }, 1500);
      }
    }
  }, [data, isLoading, router]);

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

      <div className="space-y-2 text-center">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Checking Your Registration
        </h1>
        <p className="text-muted-foreground text-lg">
          Please wait while we verify your information...
        </p>
      </div>

      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center space-y-6 py-12">
          {isLoading && (
            <>
              <Loader2 className="text-primary h-16 w-16 animate-spin" />
              <div className="space-y-2 text-center">
                <p className="text-foreground text-lg font-semibold">
                  Checking registration status...
                </p>
                <p className="text-muted-foreground text-sm">
                  This will only take a moment
                </p>
              </div>
            </>
          )}

          {error && (
            <>
              <AlertCircle className="text-destructive h-16 w-16" />
              <div className="space-y-4 text-center">
                <div className="space-y-2">
                  <p className="text-foreground text-lg font-semibold">
                    Something went wrong
                  </p>
                  <p className="text-muted-foreground text-sm">
                    We couldn't check your registration status
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/register")}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </>
          )}

          {data && !data.exists && (
            <>
              <CheckCircle2 className="text-primary h-16 w-16" />
              <div className="space-y-2 text-center">
                <p className="text-foreground text-lg font-semibold">
                  All clear! Let's continue
                </p>
                <p className="text-muted-foreground text-sm">
                  Redirecting you to complete your profile...
                </p>
              </div>
            </>
          )}

          {data && data.exists && (
            <>
              <CheckCircle2 className="text-primary h-16 w-16" />
              <div className="space-y-2 text-center">
                <p className="text-foreground text-lg font-semibold">
                  You're already registered!
                </p>
                <p className="text-muted-foreground text-sm">
                  Redirecting you to your options...
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Subtle Trust Indicators */}
      <TrustIndicators
        items={[
          { icon: <ShieldCheck className="h-4 w-4" />, label: "Fraud Check" },
          { icon: <Database className="h-4 w-4" />, label: "De-duplication" },
          { icon: <Clock className="h-4 w-4" />, label: "Quick & Private" },
        ]}
      />
    </div>
  );
}
