import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
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
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
