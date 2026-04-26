import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";
import {
  createDefaultOpenGraph,
  createDefaultTwitter,
  getMetadataBase,
} from "@/lib/core/metadata";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultTitle = "WardWise | From Ward to Victory";
const defaultDescription =
  "Nigeria's first location-precise civic intelligence platform for voter insights organized by LGA, Ward, and Polling Unit.";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5ed" },
    { media: "(prefers-color-scheme: dark)", color: "#09282a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: defaultTitle,
    template: "%s | WardWise",
  },
  description: defaultDescription,
  openGraph: createDefaultOpenGraph({
    title: defaultTitle,
    description: defaultDescription,
  }),
  twitter: createDefaultTwitter({
    title: defaultTitle,
    description: defaultDescription,
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="scroll-smooth!"
      data-scroll-behavior="smooth"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} selection:bg-primary/30 selection:text-foreground antialiased`}
      >
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
