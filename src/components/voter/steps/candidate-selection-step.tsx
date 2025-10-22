"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, MapPin, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StepProgress } from "@/components/ui/step-progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRegistration } from "@/hooks/use-registration";
import { cn } from "@/lib/utils";
import { mockApi } from "@/lib/mock/mockApi";

type Candidate = {
  id: string;
  name: string;
  party: string;
  position: string;
  constituency: string;
  description?: string;
  supporters?: number;
};

export function CandidateSelectionStep() {
  const router = useRouter();
  const { update, payload } = useRegistration();
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  const state = payload.location?.state;
  const lga = payload.location?.lga;

  const { data, isLoading } = useQuery({
    queryKey: ["candidates", state, lga],
    queryFn: async () => {
      // Use mock API for demo
      return await mockApi.getCandidates();
    },
  });

  const candidates: Candidate[] = data?.candidates || [];

  const handleSubmit = () => {
    if (!selectedCandidateId) {
      toast.error("Please select a candidate to continue");
      return;
    }

    update({
      candidate: { candidateId: selectedCandidateId },
    });
    toast.success("Candidate selected!");
    router.push("/register/survey");
  };

  return (
    <div className="space-y-6">
      <StepProgress
        currentStep={4}
        totalSteps={6}
        stepTitle="Candidate Selection"
      />

      <div className="space-y-2 text-center">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Select Your Candidate
        </h1>
        <p className="text-muted-foreground text-sm">
          House of Representatives - {payload.location?.lga} & Constituency
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <Card>
          <CardHeader className="border-b">
            <h2 className="text-foreground text-base font-medium">
              Available Candidates
            </h2>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
                  <Loader2 className="text-primary h-6 w-6 animate-spin" />
                  <p className="text-foreground text-sm font-medium">
                    Loading candidates...
                  </p>
                </div>
              </div>
            ) : (
              <RadioGroup
                value={selectedCandidateId}
                onValueChange={setSelectedCandidateId}
                className="grid gap-3 sm:grid-cols-2"
              >
                {candidates.map((candidate: Candidate) => {
                  const isSelected = selectedCandidateId === candidate.id;
                  const isUndecided = candidate.id === "cand-undecided";

                  return (
                    <div key={candidate.id}>
                      <RadioGroupItem
                        value={candidate.id}
                        id={candidate.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={candidate.id}
                        className={cn(
                          "flex cursor-pointer flex-col gap-3 rounded-lg border p-4 transition-colors",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {candidate.name.charAt(0)}
                            </div>
                            <div className="space-y-1">
                              <div className="text-foreground text-sm leading-none font-medium">
                                {candidate.name}
                              </div>
                              {!isUndecided && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-normal"
                                >
                                  {candidate.party}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                              isSelected
                                ? "border-primary"
                                : "border-muted-foreground/30",
                            )}
                          >
                            {isSelected && (
                              <div className="bg-primary h-2.5 w-2.5 rounded-full" />
                            )}
                          </div>
                        </div>

                        {!isUndecided && (
                          <div className="space-y-2">
                            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="line-clamp-1">
                                {candidate.constituency}
                              </span>
                            </div>

                            {candidate.supporters !== undefined && (
                              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                <Users className="h-3 w-3 shrink-0" />
                                <span>
                                  {candidate.supporters.toLocaleString()}{" "}
                                  supporters
                                </span>
                              </div>
                            )}

                            {candidate.description && (
                              <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                                {candidate.description}
                              </p>
                            )}
                          </div>
                        )}

                        {isUndecided && (
                          <p className="text-muted-foreground pl-[52px] text-xs">
                            You can update your choice within 7 days of
                            registration.
                          </p>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            )}

            <div className="bg-muted mt-6 rounded-lg p-4">
              <p className="text-muted-foreground text-xs">
                <strong className="text-foreground font-medium">Note:</strong>{" "}
                Your selection helps candidates understand their support base
                and communicate with you about their plans.
              </p>
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/register/survey")}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedCandidateId}
                className="flex-1"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
