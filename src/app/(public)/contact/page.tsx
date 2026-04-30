import { ContactContent } from "@/components/public/contact-content";
import { createPublicMetadata } from "@/lib/core/metadata";

export const metadata = createPublicMetadata({
  title: "Contact Us",
  description:
    "Reach the WardWise team for demos, partnerships, support, or press inquiries.",
});

export default function ContactPage() {
  return (
    <ContactContent
      turnstileSiteKey={process.env.TURNSTILE_SITE_KEY?.trim() || null}
    />
  );
}
