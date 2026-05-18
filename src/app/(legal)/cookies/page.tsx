import type { Metadata } from "next";
import { CookiesContent } from "@/features/public-site/components/legal/cookies-content";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Understand how WardWise uses cookies and similar technologies to enhance your experience.",
};

export default function CookiePolicyPage() {
  return <CookiesContent />;
}
