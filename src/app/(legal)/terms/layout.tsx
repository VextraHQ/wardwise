import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Terms of Service`,
  description:
    "Read the terms and conditions governing your use of WardWise civic intelligence platform.",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
