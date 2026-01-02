import { withAuth } from "next-auth/middleware";

export default withAuth(
  function proxy(_req) {
    // Add any additional proxy logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect candidate dashboard routes
        if (
          req.nextUrl.pathname.startsWith("/dashboard") ||
          req.nextUrl.pathname.startsWith("/(candidate)")
        ) {
          return !!token && token.role === "candidate";
        }
        // Protect admin routes
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token && token.role === "admin";
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
