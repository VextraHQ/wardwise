"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRegistration } from "@/hooks/use-registration";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function CandidateStep() {
  const { advance, back, payload } = useRegistration();
  const state = payload.location?.state ?? "AD";
  const lga = payload.location?.lga ?? "SONG";
  const { data } = useQuery({
    queryKey: ["candidates", state, lga],
    queryFn: async () =>
      (
        await fetch(`/api/register/candidates?state=${state}&lga=${lga}`)
      ).json(),
  });
  const [candidateId, setCandidateId] = useState<string>("");

  const candidates = data?.candidates ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-slate-700">
          <Users className="h-5 w-5" />
          <span className="font-medium">Choose your candidate</span>
        </div>
        <p className="text-sm text-slate-600">
          Select the candidate you want to support. Your choice will be shared
          with their campaign team.
        </p>
      </div>

      {/* Candidates Grid */}
      <div className="space-y-4">
        {candidates.map((candidate: any) => {
          const isSelected = candidateId === candidate.id;
          const isUndecided = candidate.id === "cand-undecided";

          return (
            <Card
              key={candidate.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg",
                isSelected
                  ? "border-emerald-200 bg-emerald-50 ring-2 ring-emerald-500"
                  : "border-slate-200 hover:border-slate-300",
              )}
              onClick={() => setCandidateId(candidate.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          candidate.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {candidate.name}
                        </h3>
                        {!isUndecided && (
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {candidate.party}
                            </Badge>
                            <span className="text-sm text-slate-500">
                              {candidate.position}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isUndecided && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{candidate.constituency}</span>
                      </div>
                    )}

                    {isUndecided && (
                      <div className="text-sm text-slate-600">
                        Select this option if you haven't decided yet. You can
                        change your choice later.
                      </div>
                    )}
                  </div>

                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-300",
                    )}
                  >
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6">
        <Button variant="outline" onClick={back} className="px-6">
          Back
        </Button>
        <Button
          onClick={() => {
            if (!candidateId) return;
            advance();
          }}
          disabled={!candidateId}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 hover:from-emerald-700 hover:to-emerald-800"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
