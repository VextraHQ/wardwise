import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Cookie Policy`,
  description:
    "Understand how WardWise uses cookies and similar technologies to enhance your experience.",
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
