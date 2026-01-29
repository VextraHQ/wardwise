import type { Metadata } from "next";
import { ContactContent } from "@/components/legal/contact-content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the WardWise team. We're here to help with any questions or feedback.",
};

export default function ContactPage() {
  return <ContactContent />;
}
