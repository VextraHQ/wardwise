"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getStateByCode } from "@/lib/data/state-lga-locations";

interface GeoBreadcrumbProps {
  stateCode: string | null;
  lgaId: number | null;
  lgaName: string | null;
  wardId: number | null;
  wardName: string | null;
  onNavigate: (params: Record<string, string>) => void;
}

export function GeoBreadcrumb({
  stateCode,
  lgaId,
  lgaName,
  wardId,
  wardName,
  onNavigate,
}: GeoBreadcrumbProps) {
  const state = stateCode ? getStateByCode(stateCode) : null;

  // Only show breadcrumb when drilled into a state (not at root level)
  if (!stateCode) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {stateCode ? (
            <BreadcrumbLink
              className="text-foreground/60 hover:text-foreground cursor-pointer font-mono text-[9px] font-bold tracking-[0.15em] uppercase transition-colors"
              onClick={() => onNavigate({})}
            >
              All States
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="text-foreground/30 font-mono text-[9px] font-bold tracking-[0.15em] uppercase">
              All States
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {stateCode && state && (
          <>
            <BreadcrumbSeparator className="text-muted-foreground/30">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {lgaId ? (
                <BreadcrumbLink
                  className="text-foreground/60 hover:text-foreground cursor-pointer font-mono text-[9px] font-bold tracking-[0.15em] uppercase transition-colors"
                  onClick={() => onNavigate({ state: stateCode })}
                >
                  {state.name}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-foreground/30 font-mono text-[9px] font-bold tracking-[0.15em] uppercase">
                  {state.name}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {lgaId && lgaName && (
          <>
            <BreadcrumbSeparator className="text-muted-foreground/30">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {wardId ? (
                <BreadcrumbLink
                  className="text-foreground/60 hover:text-foreground cursor-pointer font-mono text-[9px] font-bold tracking-[0.15em] uppercase transition-colors"
                  onClick={() =>
                    onNavigate({
                      state: stateCode || "",
                      lga: String(lgaId),
                      lgaName: lgaName,
                    })
                  }
                >
                  {lgaName}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-foreground/30 font-mono text-[9px] font-bold tracking-[0.15em] uppercase">
                  {lgaName}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {wardId && wardName && (
          <>
            <BreadcrumbSeparator className="text-muted-foreground/30">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground/30 font-mono text-[9px] font-bold tracking-[0.15em] uppercase">
                {wardName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
