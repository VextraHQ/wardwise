import { COMPANY_INFO } from "@/lib/constants/legal-data";

export interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "account" | "privacy" | "technical";
}

export const faqItems: FAQItem[] = [
  {
    question: "What is WardWise?",
    answer:
      "WardWise is a campaign field intelligence platform. It helps campaigns capture supporters from the field, organize them by LGA, ward, and polling unit, and understand where support is growing.",
    category: "general",
  },
  {
    question: "What is WardWise Collect?",
    answer:
      "WardWise Collect is the field registration side of the platform. It gives campaigns a mobile-friendly supporter capture flow that feeds directly into reporting instead of leaving names scattered across notebooks, chats, or spreadsheets.",
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
      "Canvassers use a mobile-friendly flow to capture supporters in the field, attach the right location details, and keep records flowing into one shared campaign system. That helps managers and candidates see what the field is producing without waiting for scattered updates.",
    category: "general",
  },
  {
    question: "How is WardWise different from Google Forms or spreadsheets?",
    answer:
      "Google Forms can collect responses, but WardWise is built for campaign operations. It structures supporter records around real electoral geography, supports field attribution, improves record quality, and gives campaigns a reporting view they can actually use for decisions.",
    category: "general",
  },
  {
    question: "How is supporter data organized?",
    answer:
      "Supporter records are organized around the real campaign map: state, LGA, ward, and polling unit. That makes follow-up, reporting, and deployment decisions much easier than working from a flat spreadsheet.",
    category: "general",
  },
  {
    question: "How do I onboard on WardWise?",
    answer:
      "After a demo and workspace setup, campaign administrators can invite the people who need access and start rolling the platform out to managers, operators, and field teams.",
    category: "account",
  },
  {
    question: "How do I cancel our platform access?",
    answer: `Contact your dedicated account manager at ${COMPANY_INFO.supportEmail} to discuss adjusting or sunsetting your workspace infrastructure.`,
    category: "account",
  },
  {
    question:
      "Is a supporter's NIN or VIN safe with WardWise?",
    answer:
      "Yes. Sensitive supporter identity details are handled carefully and are not exposed as general campaign notes. They are collected only when the campaign flow requires them and are meant to support cleaner records, verification, and responsible data handling.",
    category: "privacy",
  },
  {
    question: "Is data transmission secure?",
    answer:
      "Yes. Data sent from the field to the campaign workspace is protected in transit and handled through secure infrastructure designed for controlled access.",
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
      "WardWise is built with privacy-conscious handling and access controls that help campaigns treat supporter data responsibly under Nigerian data protection expectations.",
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
  icon: "email" | "website" | "phone" | "whatsapp" | "twitter";
  action: string;
  href: string;
}

export const supportChannels: SupportChannel[] = [
  {
    name: "Email Support",
    description: "Handled by the WardWise team at Vextra Limited",
    contact: COMPANY_INFO.supportEmail,
    icon: "email",
    action: "Send Email",
    href: `mailto:${COMPANY_INFO.supportEmail}`,
  },
  {
    name: "Company Website",
    description: "Learn more about the team behind WardWise",
    contact: COMPANY_INFO.companyWebsite.replace(/^https?:\/\//, ""),
    icon: "website",
    action: "Visit Website",
    href: COMPANY_INFO.companyWebsite,
  },
];

export const supportNavigation = [
  { label: "Support Center", href: "/support" },
  { label: "Contact Us", href: "/contact" },
] as const;
