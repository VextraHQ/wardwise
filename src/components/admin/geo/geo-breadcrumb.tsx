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
    <div className="bg-muted/40 border-border/60 rounded-sm border px-4 py-2.5">
      <Breadcrumb>
        <BreadcrumbList>
        <BreadcrumbItem>
          {stateCode ? (
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() => onNavigate({})}
            >
              All States
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>All States</BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {stateCode && state && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {lgaId ? (
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => onNavigate({ state: stateCode })}
                >
                  {state.name}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{state.name}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {lgaId && lgaName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {wardId ? (
                <BreadcrumbLink
                  className="cursor-pointer"
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
                <BreadcrumbPage>{lgaName}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {wardId && wardName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{wardName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
    </div>
  );
}
