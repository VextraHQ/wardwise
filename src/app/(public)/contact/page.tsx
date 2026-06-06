import { ContactContent } from "@/features/public-site/components/support/contact-content";
import {
  contactReasonValues,
  type ContactReason,
} from "@/lib/constants/contact-reasons";
import { createPublicMetadata } from "@/lib/core/metadata";

export const metadata = createPublicMetadata({
  title: "Contact Us",
  description:
    "Reach the WardWise team for demos, partnerships, support, or press inquiries.",
});

type ContactPageProps = {
  searchParams?: Promise<{
    reason?: string | string[];
  }>;
};

function parseContactReason(
  value: string | string[] | undefined,
): ContactReason | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;

  return contactReasonValues.includes(raw as ContactReason)
    ? (raw as ContactReason)
    : null;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialReason = parseContactReason(params?.reason) ?? "demo";

  return (
    <ContactContent
      initialReason={initialReason}
      turnstileSiteKey={process.env.TURNSTILE_SITE_KEY?.trim() || null}
    />
  );
}
