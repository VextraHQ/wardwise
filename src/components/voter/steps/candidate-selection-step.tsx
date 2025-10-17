"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRegistration } from "@/hooks/use-registration";
import { cn } from "@/lib/utils";
import { mockApi, getDemoMessage } from "@/lib/mock/mockApi";

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

  const state = payload.location?.state || "Adamawa State";
  const lga = payload.location?.lga || "Song";

  const { data, isLoading } = useQuery({
    queryKey: ["candidates", state, lga],
    queryFn: async () => {
      // Use mock API for demo
      return await mockApi.getCandidates(state, lga);
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
    router.push("/register/complete");
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">Step 6 of 7</span>
          <span className="text-muted-foreground">86% Complete</span>
        </div>
        <Progress value={86} className="h-2" />
      </div>

      {/* Hero Section */}
      <div className="space-y-4 text-center">
        <div className="border-primary/30 bg-primary/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Based on Your Survey Responses</span>
        </div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Choose Your Candidate
        </h1>
        <p className="text-muted-foreground text-lg">
          House of Representatives - {payload.location?.lga || "Song"} &{" "}
          {payload.location?.lga === "Song" ? "Fufore" : "Yola"} Constituency
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-border bg-card">
        <CardHeader className="border-border space-y-2 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/15 flex h-10 w-10 items-center justify-center rounded-full">
              <Users className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-semibold">
                Available Candidates
              </h2>
              <p className="text-muted-foreground text-sm">
                Select the candidate you want to support
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-8">
          {isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="space-y-3 text-center">
                <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                <p className="text-muted-foreground text-sm">
                  Loading candidates...
                </p>
              </div>
            </div>
          ) : (
            <RadioGroup
              value={selectedCandidateId}
              onValueChange={setSelectedCandidateId}
              className="space-y-4"
            >
              {candidates.map((candidate) => {
                const isSelected = selectedCandidateId === candidate.id;
                const isUndecided = candidate.id === "cand-undecided";

                return (
                  <div key={candidate.id} className="relative">
                    <RadioGroupItem
                      value={candidate.id}
                      id={candidate.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={candidate.id}
                      className={cn(
                        "block cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-lg",
                        isSelected
                          ? "border-primary bg-primary/10 ring-primary ring-offset-background shadow-lg ring-2 ring-offset-2"
                          : "border-muted bg-card hover:border-border",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Candidate Header */}
                          <div className="flex items-start gap-4">
                            <div
                              className={cn(
                                "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {isSelected ? (
                                <CheckCircle2 className="h-6 w-6" />
                              ) : (
                                candidate.name.charAt(0)
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <h3 className="text-foreground text-lg font-semibold">
                                {candidate.name}
                              </h3>
                              {!isUndecided && (
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="font-semibold"
                                  >
                                    {candidate.party}
                                  </Badge>
                                  <span className="text-muted-foreground text-sm">
                                    {candidate.position}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Candidate Details */}
                          {!isUndecided && (
                            <>
                              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4" />
                                <span>{candidate.constituency}</span>
                              </div>

                              {candidate.description && (
                                <p className="text-muted-foreground text-sm">
                                  {candidate.description}
                                </p>
                              )}

                              {candidate.supporters !== undefined && (
                                <div className="bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-2">
                                  <Users className="text-primary h-4 w-4" />
                                  <span className="text-foreground text-sm font-medium">
                                    {candidate.supporters.toLocaleString()}{" "}
                                    supporters
                                  </span>
                                </div>
                              )}
                            </>
                          )}

                          {isUndecided && (
                            <p className="text-muted-foreground text-sm">
                              Select this option if you haven't decided yet. You
                              can update your choice within 7 days of
                              registration.
                            </p>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        <div
                          className={cn(
                            "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground",
                          )}
                        >
                          {isSelected && (
                            <div className="bg-primary-foreground h-2.5 w-2.5 rounded-full" />
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          )}

          {/* Info Box */}
          <div className="border-border/60 bg-muted/50 rounded-lg border p-4">
            <p className="text-muted-foreground text-xs">
              <strong className="text-foreground">Your choice matters:</strong>{" "}
              Your selection helps candidates understand their support base and
              allows them to communicate directly with you about their plans and
              policies.
            </p>
          </div>

          {/* Navigation */}
          <div className="border-border/60 flex items-center justify-between border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/register/survey")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedCandidateId}
              className="from-primary to-primary/90 gap-2 bg-gradient-to-r"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
