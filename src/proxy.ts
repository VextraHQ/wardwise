import { withAuth } from "next-auth/middleware";
import { isSessionWithinLifetime } from "@/lib/auth/session";

export default withAuth(
  function proxy(_req) {
    // Add any additional proxy logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isSessionActive = token ? isSessionWithinLifetime(token) : false;

        // Protect candidate dashboard routes
        if (
          req.nextUrl.pathname.startsWith("/dashboard") ||
          req.nextUrl.pathname.startsWith("/(candidate)")
        ) {
          return (
            !!token &&
            isSessionActive &&
            token.role === "candidate" &&
            token.onboardingStatus === "active"
          );
        }
        // Protect admin routes
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token && isSessionActive && token.role === "admin";
        }
        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/(candidate)/:path*",
    "/admin/:path*",
    "/admin",
  ],
};
