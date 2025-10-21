"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, User, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRegistration } from "@/hooks/use-registration";

export function AlreadyRegisteredStep() {
  const router = useRouter();
  const { reset } = useRegistration();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="bg-primary/20 flex h-20 w-20 items-center justify-center rounded-full">
          <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-full">
            <CheckCircle2 className="text-primary-foreground h-10 w-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            You're Already Registered!
          </h1>
          <p className="text-muted-foreground text-lg">
            We found your registration in our system
          </p>
        </div>
      </div>

      {/* Main Card */}
      <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="border-border/60 space-y-2 border-b pb-6">
          <h2 className="text-foreground text-xl font-semibold">
            What would you like to do?
          </h2>
          <p className="text-muted-foreground text-sm">
            Choose an option below to continue
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* View Profile */}
          <Button
            asChild
            size="lg"
            className="from-primary to-primary/90 h-14 w-full justify-start gap-4 bg-gradient-to-r"
          >
            <Link href="/voter/profile">
              <User className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">View My Profile</div>
                <div className="text-xs opacity-90">
                  See your registration details
                </div>
              </div>
            </Link>
          </Button>

          {/* Switch Candidate */}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 w-full justify-start gap-4"
          >
            <Link href="/register/candidate">
              <RefreshCw className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Switch Candidate</div>
                <div className="text-muted-foreground text-xs">
                  Change your candidate selection
                </div>
              </div>
            </Link>
          </Button>

          {/* Logout */}
          <Button
            size="lg"
            variant="outline"
            className="h-14 w-full justify-start gap-4"
            onClick={() => {
              reset();
              router.push("/register");
            }}
          >
            <LogOut className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Logout</div>
              <div className="text-muted-foreground text-xs">
                Sign out and start fresh
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardContent>
          <p className="text-muted-foreground text-center text-sm">
            You can update your information once within 7 days of registration.
            After that, your data is locked to maintain election integrity.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
