"use client";

import { useMemo, useState } from "react";
import type { useLinkToRoster } from "@/features/collect/hooks/use-collect";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import type { PossibleMatch } from "@/features/collect/types/collect.types";
import {
  cleanupConfidenceMeta,
  normalizeCleanupName,
} from "@/features/collect/lib/campaign-canvassers";
import { cn, formatPersonName } from "@/lib/utils";
import { IconLink, IconSparkles } from "@tabler/icons-react";

export function CampaignCanvassersCleanupWorkspace({
  matches,
  isLoading,
  linkMutation,
  isMobile,
}: {
  matches: PossibleMatch[];
  isLoading: boolean;
  linkMutation: ReturnType<typeof useLinkToRoster>;
  isMobile: boolean;
}) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeLinkKey, setActiveLinkKey] = useState<string | null>(null);

  const getMatchKey = (match: PossibleMatch) =>
    `${match.manualName}__${match.manualPhone ?? ""}`;
  const getSuggestionKey = (
    match: PossibleMatch,
    suggestion: PossibleMatch["suggestions"][0],
  ) => `${getMatchKey(match)}__${suggestion.canvasserId}`;

  const visibleMatches = useMemo(
    () => matches.filter((match) => !dismissed.has(getMatchKey(match))),
    [dismissed, matches],
  );

  const handleLink = (
    match: PossibleMatch,
    suggestion: PossibleMatch["suggestions"][0],
  ) => {
    if (linkMutation.isPending) return;

    const suggestionKey = getSuggestionKey(match, suggestion);
    setActiveLinkKey(suggestionKey);

    linkMutation.mutate(
      {
        manualName: match.manualName,
        manualPhone: match.manualPhone,
        canvasserId: suggestion.canvasserId,
      },
      {
        onSuccess: ({ linkedCount }) => {
          toast.success(
            `Linked ${linkedCount} submission${linkedCount !== 1 ? "s" : ""} to ${suggestion.canvasserName}`,
          );
          setDismissed((current) => new Set([...current, getMatchKey(match)]));
        },
        onError: (error) => toast.error(error.message),
        onSettled: () => setActiveLinkKey(null),
      },
    );
  };

  const handleDismiss = (match: PossibleMatch) => {
    setDismissed((current) => new Set([...current, getMatchKey(match)]));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-36 w-full rounded-sm" />
        ))}
      </div>
    );
  }

  if (visibleMatches.length === 0) {
    return (
      <div className="border-border flex flex-col items-center gap-3 rounded-sm border border-dashed py-12 text-center">
        <IconSparkles className="text-muted-foreground h-8 w-8" />
        <p className="text-muted-foreground text-sm font-medium">
          Nothing left to review right now.
        </p>
        <p className="text-muted-foreground/70 text-xs leading-relaxed">
          Only typed-in canvasser names that clearly match someone on your saved
          list will appear here.
        </p>
      </div>
    );
  }

  const currentIndex =
    visibleMatches.length === 0
      ? 0
      : Math.min(activeIndex, visibleMatches.length - 1);
  const activeMatch = visibleMatches[currentIndex];

  if (isMobile && activeMatch) {
    return (
      <div className="space-y-4">
        <div className="border-border/60 bg-muted/20 rounded-sm border px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
              Match Review
            </p>
            <Badge
              variant="secondary"
              className="rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
            >
              {visibleMatches.length}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
            Match {currentIndex + 1} of {visibleMatches.length}. Review the
            typed-in entry and link it only if the saved canvasser is clearly
            the same person.
          </p>
        </div>

        <div className="border-border/60 bg-card overflow-hidden rounded-sm border shadow-none">
          <div className="flex items-start justify-between gap-3 px-4 py-4">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
                  Typed In
                </p>
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
                >
                  {activeMatch.submissionCount}
                </Badge>
              </div>
              <p className="text-base font-semibold">
                {formatPersonName(activeMatch.manualName)}
              </p>
              <p className="text-muted-foreground font-mono text-xs">
                {activeMatch.manualPhone || "No phone shared"}
              </p>
              <p className="text-muted-foreground text-xs">
                {activeMatch.submissionCount} submission
                {activeMatch.submissionCount !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-8 shrink-0 rounded-sm font-mono text-[10px] tracking-widest uppercase"
              onClick={() => handleDismiss(activeMatch)}
            >
              Keep Separate
            </Button>
          </div>

          <div className="border-border/60 border-t px-4 py-4">
            <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
              Suggested Saved List Match
            </p>
            <div className="mt-3 space-y-3">
              {activeMatch.suggestions.map((suggestion) => {
                const matchMeta = cleanupConfidenceMeta({
                  confidence: suggestion.confidence,
                  namesMatch:
                    normalizeCleanupName(activeMatch.manualName) ===
                    normalizeCleanupName(suggestion.canvasserName),
                });
                const isLinkingThis =
                  linkMutation.isPending &&
                  activeLinkKey === getSuggestionKey(activeMatch, suggestion);

                return (
                  <div
                    key={suggestion.canvasserId}
                    className="border-border/60 bg-muted/10 rounded-sm border px-3 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">
                        {formatPersonName(suggestion.canvasserName)}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-sm px-1.5 py-0 font-mono text-[9px] font-bold tracking-widest uppercase",
                          matchMeta.badgeClass,
                        )}
                      >
                        {matchMeta.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 font-mono text-xs">
                      {suggestion.canvasserPhone}
                    </p>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 mt-3 h-8 w-full rounded-sm font-mono text-[10px] tracking-widest uppercase"
                      disabled={isLinkingThis}
                      onClick={() => handleLink(activeMatch, suggestion)}
                    >
                      {isLinkingThis ? (
                        <>
                          <Spinner className="mr-1 h-3 w-3" />
                          Linking...
                        </>
                      ) : (
                        <>
                          <IconLink className="mr-1 h-3 w-3" />
                          Link to List
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-border/60 bg-background/95 sticky bottom-0 space-y-2 border-t pt-3 pb-1 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-sm font-mono text-[10px] tracking-widest uppercase"
              disabled={currentIndex === 0}
              onClick={() =>
                setActiveIndex((current) => Math.max(0, current - 1))
              }
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-sm font-mono text-[10px] tracking-widest uppercase"
              disabled={currentIndex === visibleMatches.length - 1}
              onClick={() =>
                setActiveIndex((current) =>
                  Math.min(visibleMatches.length - 1, current + 1),
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-border/60 bg-muted/20 flex items-center justify-between gap-3 rounded-sm border px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
              Match Review
            </p>
            <Badge
              variant="secondary"
              className="rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
            >
              {visibleMatches.length}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Typed-in names only appear here when they clearly match someone on
            your saved canvasser list.
          </p>
        </div>
      </div>

      <div className="border-border/60 bg-card overflow-hidden rounded-sm border shadow-none">
        {visibleMatches.map((match, index) => (
          <div
            key={getMatchKey(match)}
            className={cn(
              "space-y-3 px-4 py-4",
              index > 0 && "border-border/60 border-t",
            )}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
                      Typed In
                    </p>
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1.5 py-0 font-mono text-[10px] tabular-nums"
                    >
                      {match.submissionCount}
                    </Badge>
                  </div>
                  <p className="text-base font-semibold">
                    {formatPersonName(match.manualName)}
                  </p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {match.manualPhone || "No phone shared"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {match.submissionCount} submission
                    {match.submissionCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-8 shrink-0 rounded-sm font-mono text-[10px] tracking-widest uppercase"
                  onClick={() => handleDismiss(match)}
                >
                  Keep Separate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
                Suggested Saved List Match
                {match.suggestions.length > 1 ? "es" : ""}
              </p>

              {match.suggestions.map((suggestion) => {
                const matchMeta = cleanupConfidenceMeta({
                  confidence: suggestion.confidence,
                  namesMatch:
                    normalizeCleanupName(match.manualName) ===
                    normalizeCleanupName(suggestion.canvasserName),
                });
                const isLinkingThis =
                  linkMutation.isPending &&
                  activeLinkKey === getSuggestionKey(match, suggestion);

                return (
                  <div
                    key={suggestion.canvasserId}
                    className="border-border/60 bg-muted/10 flex items-center justify-between gap-3 rounded-sm border px-3 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {formatPersonName(suggestion.canvasserName)}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-sm px-1.5 py-0 font-mono text-[9px] font-bold tracking-widest uppercase",
                            matchMeta.badgeClass,
                          )}
                        >
                          {matchMeta.label}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 font-mono text-xs">
                        {suggestion.canvasserPhone}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 shrink-0 rounded-sm font-mono text-[10px] tracking-widest uppercase"
                      disabled={isLinkingThis}
                      onClick={() => handleLink(match, suggestion)}
                    >
                      {isLinkingThis ? (
                        <>
                          <Spinner className="mr-1 h-3 w-3" />
                          Linking...
                        </>
                      ) : (
                        <>
                          <IconLink className="mr-1 h-3 w-3" />
                          Link to List
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
