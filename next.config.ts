import type { NextConfig } from "next";
import crypto from "node:crypto";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Optimize static asset serving
  generateEtags: false,
  poweredByHeader: false,

  // Unique build ID per deploy — used by sw.js version cache
  generateBuildId: async () => {
    return crypto.randomBytes(6).toString("hex");
  },

  // Required so PostHog's trailing-slash API requests reach the proxy
  skipTrailingSlashRedirect: true,

  // Reverse proxy PostHog through our own domain to avoid ad-blocker ERR_BLOCKED_BY_CLIENT
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },

  // Prevent browsers from caching sw.js itself
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
