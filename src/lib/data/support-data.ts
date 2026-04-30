import { COMPANY_INFO } from "@/lib/data/legal-data";

export interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "account" | "privacy" | "technical";
}

export const faqItems: FAQItem[] = [
  {
    question: "What is WardWise?",
    answer:
      "WardWise is Nigeria's premier campaign intelligence platform that empowers strategic teams with real-time field data. We help campaigns make geographic-based decisions organized precisely by Ward and Polling Unit.",
    category: "general",
  },
  {
    question: "Is WardWise affiliated with any political party?",
    answer:
      "No. WardWise is an independent, non-partisan technology provider. We provide platform infrastructure to verified campaigns, candidates, and civic monitoring teams.",
    category: "general",
  },
  {
    question: "How does the platform assist canvassers?",
    answer:
      "Canvassers use our mobile-optimized portal to securely collect constituent data. This includes validating voters via Permanent Voter Card (PVC), VIN, or National Identity Number (NIN) credentials directly in the field, ensuring instant deduplication.",
    category: "general",
  },
  {
    question: "How do I onboard on WardWise?",
    answer:
      "After completing a demo and setting up your workspace, administrators can invite operators by email and generate unique access codes for field canvassers.",
    category: "account",
  },
  {
    question: "How do I cancel our platform access?",
    answer: `Contact your dedicated account manager at ${COMPANY_INFO.supportEmail} to discuss adjusting or sunsetting your workspace infrastructure.`,
    category: "account",
  },
  {
    question:
      "Is the constituent's NIN, VIN, or PVC number safe with WardWise?",
    answer:
      "Yes. Any NIN, VIN, or PVC number collected in the field by canvassers is encrypted and used purely to verify uniqueness and valid polling unit registration. We ensure the strictest data privacy and never distribute this raw identifier data.",
    category: "privacy",
  },
  {
    question: "Is data transmission secure?",
    answer:
      "Yes. All data flowing from the field to your command center is protected by TLS/SSL encryption. We host our infrastructure on enterprise-grade cloud servers.",
    category: "privacy",
  },
  {
    question: "Who owns the data collected by our agents?",
    answer:
      "Your campaign is the sole owner of all data collected via the WardWise Collect module. We act exclusively as a data processor for your organization.",
    category: "privacy",
  },
  {
    question: "Is the platform compliant with Nigerian data laws?",
    answer:
      "Absolutely. Our systems enforce data privacy features compliant with the Nigerian Data Protection Act (NDPA) to ensure constituent data is securely handled.",
    category: "privacy",
  },
  {
    question: "Why can't I log in?",
    answer:
      "Ensure you're using the correct phone number or email and password. If you've forgotten your password, use the Forgot Password link. Contact support if issues persist.",
    category: "technical",
  },
  {
    question: "The app is running slowly. What can I do?",
    answer:
      "Try refreshing the page, clearing your browser cache, or using a different browser. If problems persist, contact our support team.",
    category: "technical",
  },
  {
    question: "I found a bug. How do I report it?",
    answer:
      "Email " +
      COMPANY_INFO.supportEmail +
      " with details about the issue, including what you were doing when it occurred and any error messages you saw.",
    category: "technical",
  },
];

export interface SupportChannel {
  name: string;
  description: string;
  contact: string;
  icon: "email" | "phone" | "whatsapp" | "twitter";
  action: string;
  href: string;
}

export const supportChannels: SupportChannel[] = [
  {
    name: "Email Support",
    description: "Get detailed help via email",
    contact: COMPANY_INFO.supportEmail,
    icon: "email",
    action: "Send Email",
    href: `mailto:${COMPANY_INFO.supportEmail}`,
  },
  {
    name: "General Inquiries",
    description: "For partnerships and press",
    contact: COMPANY_INFO.email,
    icon: "email",
    action: "Contact Us",
    href: `mailto:${COMPANY_INFO.email}`,
  },
];

export const supportNavigation = [
  { label: "Support Center", href: "/support" },
  { label: "Contact Us", href: "/contact" },
] as const;
