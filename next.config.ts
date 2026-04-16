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
