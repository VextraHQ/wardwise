import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Privacy Policy`,
  description:
    "Learn how WardWise collects, uses, and protects your personal information on our civic intelligence platform.",
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
