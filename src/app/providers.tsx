"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { type ReactNode, useState } from "react";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsentBanner } from "@/components/layout/cookie-consent";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus>
      <QueryClientProvider client={queryClient}>
        {children}
        <AnalyticsProvider />
        <Toaster />
        <CookieConsentBanner />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
