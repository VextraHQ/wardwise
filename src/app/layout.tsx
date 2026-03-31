import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WardWise | From Ward to Victory",
    template: "%s | WardWise",
  },
  description:
    "Nigeria's first location-precise civic intelligence platform for voter insights organized by LGA, Ward, and Polling Unit.",
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
        className={`${geistSans.variable} ${geistMono.variable} selection:bg-primary/30 antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
