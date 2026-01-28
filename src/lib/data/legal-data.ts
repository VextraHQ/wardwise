/**
 * Legal and Support Page Data
 *
 * This file contains placeholder/template content for legal pages.
 * The structure follows industry standards and should be reviewed
 * and finalized by legal counsel before production deployment.
 *
 * Last Updated: January 2026
 */

// ============================================================================
// COMPANY & PLATFORM INFO
// Note: Update this when legal/company details change
// ============================================================================
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
  lastUpdated: "January 28, 2026",
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
      "**Personal Information:** When you register, we collect your National Identification Number (NIN), name, phone number, email address, and location data (state, LGA, ward, polling unit).",
      "**Survey Responses:** Your responses to civic surveys about community priorities and candidate preferences.",
      "**Usage Data:** Information about how you interact with our platform, including access times, pages viewed, and referring URLs.",
      "**Device Information:** Browser type, operating system, device identifiers, and IP address for security and analytics purposes.",
    ],
  },
  {
    id: "how-we-use-your-information",
    title: "How We Use Your Information",
    content: [
      "**Voter Verification:** To verify your identity and eligibility using NIN validation through authorized government APIs.",
      "**Platform Services:** To provide, maintain, and improve our civic engagement services.",
      "**Aggregated Insights:** To generate anonymized, aggregate data insights for candidates and political campaigns. Individual responses are never shared.",
      "**Communication:** To send important updates about the platform, your account, and civic activities in your area.",
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
      "These terms apply to all users, including voters, canvassers, candidates, and administrators.",
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility",
    content: [
      "You must be at least 18 years old and a Nigerian citizen to use this Platform.",
      "You must possess a valid National Identification Number (NIN) to register as a voter.",
      "By registering, you confirm that all information provided is accurate and truthful.",
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
      "**You Agree To:** Use the Platform only for lawful civic engagement purposes; provide accurate information in surveys and registrations; respect other users and their opinions.",
      "**You Agree NOT To:** Submit false or misleading information; attempt to manipulate poll results or surveys; impersonate others or create fake registrations; access the Platform through automated means (bots, scrapers); attempt to breach security measures.",
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
      "WardWise uses cookies and similar technologies (local storage, session storage) to operate effectively.",
    ],
  },
  {
    id: "cookies-we-use",
    title: "Cookies We Use",
    content: [
      "**Essential Cookies:** Required for the Platform to function. These include authentication tokens and session management. You cannot opt out of these.",
      "**Analytics Cookies:** Help us understand how users interact with the Platform. We use this data to improve our services.",
      "**Preference Cookies:** Remember your settings, such as theme preference (light/dark mode) and language settings.",
    ],
  },
  {
    id: "managing-cookies",
    title: "Managing Cookies",
    content: [
      "Most browsers allow you to control cookies through their settings. You can block or delete cookies, but this may affect Platform functionality.",
      "Essential cookies cannot be disabled as they are necessary for core Platform features.",
      "You can manage your cookie preferences through your browser settings or our cookie consent banner.",
    ],
  },
  {
    id: "third-party-cookies",
    title: "Third-Party Cookies",
    content: [
      "We may use third-party services that set their own cookies, such as analytics providers (e.g., Vercel Analytics).",
      "These third parties have their own privacy policies governing the use of their cookies.",
      "We do not control third-party cookies and are not responsible for their practices.",
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
      "WardWise is Nigeria's civic intelligence platform that bridges the gap between voters and political candidates. We help citizens voice their priorities and enable candidates to understand community needs at the ward level.",
    category: "general",
  },
  {
    question: "Is WardWise affiliated with any political party?",
    answer:
      "No. WardWise is a non-partisan platform. We provide services to voters and candidates across all political parties equally.",
    category: "general",
  },
  {
    question: "How does my data help candidates?",
    answer:
      "Your survey responses are aggregated and anonymized at the ward level. Candidates see community trends and priorities, not individual responses. This helps them understand what matters most to voters in specific areas.",
    category: "general",
  },
  // Account
  {
    question: "How do I register as a voter?",
    answer:
      "Visit our registration page and enter your NIN. We'll verify your identity through secure government APIs, then guide you through selecting your ward and polling unit.",
    category: "account",
  },
  {
    question: "Can I change my registered ward or polling unit?",
    answer:
      "Core verified information (like NIN-linked data) cannot be changed without support approval. Contact our support team if you need to update your location details.",
    category: "account",
  },
  {
    question: "How do I delete my account?",
    answer: `Contact our support team at ${COMPANY_INFO.supportEmail} to request account deletion. We'll process your request within 7-14 business days.`,
    category: "account",
  },
  // Privacy
  {
    question: "Is my NIN safe with WardWise?",
    answer:
      "Yes. Your NIN is used only for verification and is stored securely with encryption. We never share your NIN with candidates or third parties.",
    category: "privacy",
  },
  {
    question: "Can candidates see my individual survey responses?",
    answer:
      "No. Candidates only see aggregated, anonymized data at the ward or LGA level. Your individual responses are never linked to your identity in any data we share.",
    category: "privacy",
  },
  {
    question: "How long do you keep my data?",
    answer:
      "We retain your data for as long as your account is active. You can request deletion at any time. Some data may be retained for legal compliance purposes.",
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
  { label: "Support", href: "/support" },
  { label: "Contact", href: "/contact" },
] as const;

export type LegalPageType =
  | "privacy"
  | "terms"
  | "cookies"
  | "support"
  | "contact";
