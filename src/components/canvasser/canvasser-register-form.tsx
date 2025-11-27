"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HiArrowLeft,
  HiArrowRight,
  HiUser,
  HiLocationMarker,
  HiCheckCircle,
  HiInformationCircle,
} from "react-icons/hi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { StepProgress } from "@/components/ui/step-progress";

type Step = "nin" | "details" | "location" | "confirm";

const steps: { id: Step; label: string }[] = [
  { id: "nin", label: "NIN Verification" },
  { id: "details", label: "Personal Details" },
  { id: "location", label: "Location" },
  { id: "confirm", label: "Confirm" },
];

export function CanvasserRegisterForm() {
  const [currentStep, setCurrentStep] = useState<Step>("nin");
  const [nin, setNin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [voterData, setVoterData] = useState<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
  } | null>(null);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleVerifyNin = async () => {
    if (nin.length !== 11) {
      toast.error("NIN must be 11 digits");
      return;
    }

    setIsVerifying(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock data generation
    setVoterData({
      firstName: "Aminu",
      lastName: "Bello",
      dateOfBirth: "1995-03-15",
      gender: "Male",
      phone: "+234 803 456 7890",
    });
    setIsVerifying(false);
    toast.success("NIN verified successfully!");
    setCurrentStep("details");
  };

  const handleSubmit = async () => {
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(
      "Voter registered successfully! They will receive an SMS confirmation.",
    );
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/canvasser">
          <HiArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <StepProgress
        currentStep={currentStepIndex + 1}
        totalSteps={steps.length}
        stepTitle={steps[currentStepIndex].label}
      />

      {/* Info Banner */}
      <Alert>
        <HiInformationCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Assisted Registration:</strong> You are registering a voter on
          their behalf. They will receive an SMS with their registration details
          and can complete any remaining steps online.
        </AlertDescription>
      </Alert>

      {/* Step Content */}
      <div className="mx-auto w-full max-w-5xl">
        <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
          {currentStep === "nin" && (
            <>
              <CardHeader className="text-center">
                <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                  <HiUser className="text-primary h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold">Verify Voter&apos;s NIN</h2>
                <p className="text-muted-foreground text-sm">
                  Enter the voter&apos;s National Identification Number
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nin">NIN (11 digits)</Label>
                  <Input
                    id="nin"
                    placeholder="12345678901"
                    value={nin}
                    onChange={(e) =>
                      setNin(e.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                <Button
                  onClick={handleVerifyNin}
                  disabled={nin.length !== 11 || isVerifying}
                  className="w-full"
                >
                  {isVerifying ? "Verifying..." : "Verify NIN"}
                  <HiArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}

          {currentStep === "details" && voterData && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <HiCheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <h2 className="text-xl font-bold">Voter Details</h2>
                <p className="text-muted-foreground text-sm">
                  Confirm the voter&apos;s information from NIN
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">
                      First Name
                    </Label>
                    <p className="font-medium">{voterData.firstName}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">
                      Last Name
                    </Label>
                    <p className="font-medium">{voterData.lastName}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">
                      Date of Birth
                    </Label>
                    <p className="font-medium">{voterData.dateOfBirth}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">
                      Gender
                    </Label>
                    <p className="font-medium">{voterData.gender}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (for SMS)</Label>
                  <Input
                    id="phone"
                    defaultValue={voterData.phone}
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voter@example.com"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("nin")}
                    className="flex-1"
                  >
                    <HiArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("location")}
                    className="flex-1"
                  >
                    Continue
                    <HiArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === "location" && (
            <>
              <CardHeader className="text-center">
                <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                  <HiLocationMarker className="text-primary h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold">Voting Location</h2>
                <p className="text-muted-foreground text-sm">
                  Select the voter&apos;s registration location
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select defaultValue="adamawa">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adamawa">Adamawa State</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>LGA</Label>
                  <Select defaultValue="song">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="song">Song</SelectItem>
                      <SelectItem value="fufore">Fufore</SelectItem>
                      <SelectItem value="yola-north">Yola North</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ward</Label>
                  <Select defaultValue="song-1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="song-1">Song Ward 1</SelectItem>
                      <SelectItem value="song-2">Song Ward 2</SelectItem>
                      <SelectItem value="malabu">Malabu Ward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Polling Unit</Label>
                  <Select defaultValue="unit-001">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit-001">
                        Unit 001 - Community Centre
                      </SelectItem>
                      <SelectItem value="unit-002">
                        Unit 002 - Primary School
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("details")}
                    className="flex-1"
                  >
                    <HiArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("confirm")}
                    className="flex-1"
                  >
                    Continue
                    <HiArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === "confirm" && voterData && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <HiCheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <h2 className="text-xl font-bold">Confirm Registration</h2>
                <p className="text-muted-foreground text-sm">
                  Review and submit the voter registration
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">
                      {voterData.firstName} {voterData.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NIN</span>
                    <span className="font-mono">{nin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span>Song Ward 1, Song LGA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Canvasser</span>
                    <Badge variant="secondary">FINT-A001 (You)</Badge>
                  </div>
                </div>

                <Alert>
                  <HiInformationCircle className="h-4 w-4" />
                  <AlertDescription>
                    The voter will receive an SMS with:
                    <ul className="mt-2 list-inside list-disc text-sm">
                      <li>Registration confirmation</li>
                      <li>Link to complete candidate selection</li>
                      <li>Their unique registration ID</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("location")}
                    className="flex-1"
                  >
                    <HiArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1">
                    <HiCheckCircle className="mr-2 h-4 w-4" />
                    Register Voter
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
