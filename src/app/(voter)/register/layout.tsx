import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register to Vote | WardWise",
  description:
    "Register to participate in your State elections. Complete our survey and choose your candidate.",
  openGraph: {
    title: "Register to Vote | WardWise",
    description:
      "Register to participate in your State elections. Complete our survey and choose your candidate.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
