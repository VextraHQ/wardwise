import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const poppinsMono = Poppins({
  variable: "--font-poppins-mono",
  weight: ["400", "500", "600", "700"],
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
        className={`${poppins.variable} ${poppinsMono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
