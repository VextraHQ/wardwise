/**
 * Legal and Support Page Data
 *
 * This file contains placeholder/template content for legal pages.
 * The structure follows industry standards and should be reviewed
 * and finalized by legal counsel before production deployment.
 *
 * Last Updated: April 2026
 */

// ============================================================================
// COMPANY & PLATFORM INFO
// Note: Update this when legal/company details change
// ============================================================================

/**
 * Date when legal documents were last updated.
 * Update this whenever you modify the legal content.
 */
export const LEGAL_LAST_UPDATED = new Date("2026-04-07");
export function formatLegalDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const COMPANY_INFO = {
  /** Product/Platform name */
  name: "WardWise",
  /** Registered legal entity */
  legalName: "Vextra Limited",
  /** Parent company website */
  companyWebsite: "https://vextralimited.com",
  /** General contact email */
  email: "info@wardwise.ng",
  /** Support email */
  supportEmail: "support@wardwise.ng",
  /** Headquarters location */
  address: "Abuja, Nigeria",
  /** Platform URL */
  website: "https://wardwise.ng",
} as const;

export interface LegalSection {
  id: string;
  title: string;
  content: string[];
}

// ============================================================================
// PRIVACY POLICY DATA
// ============================================================================
export const privacyPolicySections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: [
      `${COMPANY_INFO.legalName} ("WardWise", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our civic intelligence platform.`,
      "By accessing or using WardWise, you agree to this Privacy Policy. If you do not agree with the terms, please do not access the platform.",
    ],
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: [
      "**Account Information:** When you request a demo or register for an account, we collect your name, email address, phone number, and organization details.",
      "**Field Data:** Information securely uploaded or collected via the WardWise Collect module by your authorized canvassers and field agents, which may include demographic data, political affiliation (e.g., APC status), Permanent Voter Card (PVC) details, Voter Identification Number (VIN), and National Identification Number (NIN).",
      "**Usage Data:** Information about how you interact with our platform, including access times, pages viewed, and referring URLs.",
      "**Device Information:** Browser type, operating system, device identifiers, and IP address for security and analytics purposes.",
    ],
  },
  {
    id: "how-we-use-your-information",
    title: "How We Use Your Information",
    content: [
      "**Platform Services:** To provide, maintain, and improve our civic intelligence and campaign management services.",
      "**Account Management:** To manage your organization's platform access, user access roles, and billing.",
      "**Data Processing:** To securely process, deduplicate, and store the field data collected by your campaign.",
      "**Communication:** To send important updates about the platform, security notices, and feature releases.",
      "**Security:** To detect, prevent, and address technical issues, fraud, or security breaches.",
    ],
  },
  {
    id: "data-sharing",
    title: "Data Sharing & Disclosure",
    content: [
      "**We Do Not Sell Your Data:** WardWise does not sell, rent, or trade your personal information to third parties for marketing purposes.",
      "**Aggregated Data:** Candidates and campaign teams receive only aggregated, anonymized insights at the ward or LGA level. They cannot identify individual voters.",
      "**Legal Requirements:** We may disclose information if required by law, court order, or government authority.",
      "**Service Providers:** We work with trusted third-party service providers who assist in operating our platform, subject to strict confidentiality agreements.",
    ],
  },
  {
    id: "data-security",
    title: "Data Security",
    content: [
      "We implement industry-standard security measures including encryption in transit (TLS/SSL) and at rest, secure authentication, and regular security audits.",
      "Access to personal data is restricted to authorized personnel who need it to perform their duties.",
      "While we strive to protect your data, no method of transmission over the internet is 100% secure. Use the platform at your own risk.",
    ],
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: [
      "We retain your personal information for as long as your account is active or as needed to provide services.",
      "You may request deletion of your account and associated data by contacting our support team.",
      "Some information may be retained for legal, regulatory, or legitimate business purposes even after account deletion.",
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights",
    content: [
      "**Access:** You have the right to request access to the personal information we hold about you.",
      "**Correction:** You may request correction of inaccurate or incomplete information.",
      "**Deletion:** You may request deletion of your account and personal data, subject to legal retention requirements.",
      "**Portability:** You may request a copy of your data in a commonly used format.",
      `To exercise these rights, contact us at ${COMPANY_INFO.supportEmail}`,
    ],
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the 'Last Updated' date.",
      "Continued use of the platform after changes constitutes acceptance of the updated policy.",
    ],
  },
];

// ============================================================================
// TERMS OF SERVICE DATA
// ============================================================================
export const termsOfServiceSections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    content: [
      `By accessing or using WardWise ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to all terms, you must not use the Platform.`,
      "These terms apply to all authorized users, including campaign administrators, candidates, and field agents.",
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility",
    content: [
      "You must be an authorized representative of a recognized political campaign, civic organization, or agency to use this Platform.",
      "You are responsible for ensuring your organization's use of the Platform complies with all local electoral laws and data privacy regulations.",
    ],
  },
  {
    id: "account-responsibilities",
    title: "Account Responsibilities",
    content: [
      "You are responsible for maintaining the confidentiality of your account credentials.",
      "You must not share your account with others or allow unauthorized access.",
      "You must immediately notify us of any unauthorized use of your account.",
      "One person, one account: Creating multiple accounts is strictly prohibited and may result in permanent ban.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use Policy",
    content: [
      "**You Agree To:** Use the Platform only for lawful civic intelligence purposes; ensure your field agents have obtained proper consent before recording data; respect data privacy laws.",
      "**You Agree NOT To:** Use the platform to distribute malicious software; attempt to bypass security or encryption protocols; resell the platform access to unauthorized third parties.",
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    content: [
      `All content, features, and functionality of WardWise are owned by ${COMPANY_INFO.legalName} and are protected by intellectual property laws.`,
      "You may not copy, reproduce, distribute, or create derivative works without our express written permission.",
      "User-submitted content (survey responses) remains your property, but you grant us a license to use it for aggregated insights.",
    ],
  },
  {
    id: "platform-availability",
    title: "Platform Availability",
    content: [
      "We strive to maintain continuous availability but do not guarantee uninterrupted access to the Platform.",
      "We reserve the right to modify, suspend, or discontinue any part of the Platform at any time.",
      "We may perform maintenance that requires temporary downtime, and we will try to provide advance notice when possible.",
    ],
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    content: [
      `${COMPANY_INFO.legalName} is not liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.`,
      "Our total liability shall not exceed the amount you paid to use the Platform in the 12 months preceding the claim.",
      "We are not responsible for any decisions made by political candidates based on data derived from the Platform.",
    ],
  },
  {
    id: "termination",
    title: "Termination",
    content: [
      "We may suspend or terminate your access to the Platform at any time for violation of these terms.",
      "You may terminate your account at any time by contacting our support team.",
      "Upon termination, your right to use the Platform ceases immediately.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing Law",
    content: [
      "These Terms shall be governed by the laws of the Federal Republic of Nigeria.",
      "Any disputes shall be resolved in the courts of Lagos State, Nigeria.",
    ],
  },
];

// ============================================================================
// COOKIE POLICY DATA
// ============================================================================
export const cookiePolicySections: LegalSection[] = [
  {
    id: "what-are-cookies",
    title: "What Are Cookies?",
    content: [
      "Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience.",
      "WardWise uses cookies and similar technologies to operate effectively, remember your consent choices, and improve the product experience where permitted.",
    ],
  },
  {
    id: "cookies-we-use",
    title: "Cookies We Use",
    content: [
      "**Essential Cookies:** Required for the Platform to function. These include authentication tokens and session management. You cannot opt out of these.",
      "**Consent Cookies:** We store a first-party cookie to remember whether you accepted or declined optional analytics tracking.",
      "**Analytics Cookies:** If you accept analytics cookies, we use PostHog to understand aggregate product usage and improve our services.",
      "**Preference Cookies:** Remember your settings, such as theme preference (light/dark mode) and language settings.",
    ],
  },
  {
    id: "managing-cookies",
    title: "Managing Cookies",
    content: [
      "Most browsers allow you to control cookies through their settings. You can block or delete cookies, but this may affect Platform functionality.",
      "Essential cookies cannot be disabled as they are necessary for core Platform features.",
      "You can manage your analytics cookie preference through our cookie settings controls, including the banner, footer links, and in-app navigation. If you clear your cookies, WardWise may ask for your preference again on your next visit.",
    ],
  },
  {
    id: "third-party-cookies",
    title: "Third-Party Cookies",
    content: [
      "If you opt in to analytics, WardWise uses PostHog as a third-party analytics provider to help us measure page views and product usage trends.",
      "These third parties have their own privacy policies governing how they process analytics data.",
      "We do not use analytics cookies until you provide consent through our banner.",
    ],
  },
];

// ============================================================================
// SUPPORT / FAQ DATA
// ============================================================================
export interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "account" | "privacy" | "technical";
}

export const faqItems: FAQItem[] = [
  // General
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
  // Account
  {
    question: "How do I onboard on WardWise?",
    answer:
      "After completing a demo and setting up your workspace, Administrators can invite operators via email and generate unique access codes for field canvassers.",
    category: "account",
  },

  {
    question: "How do I cancel our platform access?",
    answer: `Contact your dedicated account manager at ${COMPANY_INFO.supportEmail} to discuss adjusting or sunsetting your workspace infrastructure.`,
    category: "account",
  },
  // Privacy
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
  // Technical
  {
    question: "Why can't I log in?",
    answer:
      "Ensure you're using the correct phone number or email and password. If you've forgotten your password, use the 'Forgot Password' link. Contact support if issues persist.",
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

// ============================================================================
// SUPPORT CONTACT CHANNELS
// ============================================================================
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
  // Add more channels as needed (WhatsApp, phone, etc.)
];

// ============================================================================
// NAVIGATION FOR LEGAL PAGES
// ============================================================================
export const legalNavigation = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Support & FAQs", href: "/support" },
  { label: "Contact Us", href: "/contact" },
] as const;

export type LegalPageType =
  | "privacy"
  | "terms"
  | "cookies"
  | "support"
  | "contact";
