import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Contact Us`,
  description:
    "Get in touch with the WardWise team. Send us a message for general inquiries, support, partnerships, or press.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
