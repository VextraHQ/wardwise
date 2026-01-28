import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Support Center`,
  description:
    "Get help with WardWise. Find answers to frequently asked questions and contact our support team.",
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
