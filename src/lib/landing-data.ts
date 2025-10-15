import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  LockClosedIcon,
  MapPinIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import type { ComponentType } from "react";

type IconType = ComponentType<React.SVGProps<SVGSVGElement>>;

export type NavigationLink = {
  label: string;
  section: string;
};

export const navigationLinks: NavigationLink[] = [
  {
    label: "How It Works",
    section: "how-it-works",
  },
  {
    label: "Features",
    section: "features",
  },
  {
    label: "Platform",
    section: "platform-pillars",
  },
  {
    label: "Impact",
    section: "impact",
  },
  {
    label: "Security",
    section: "security",
  },
];

export type StatHighlight = {
  label: string;
  value: string;
  annotation?: string;
};

export const statHighlights: StatHighlight[] = [
  {
    label: "Registered Voters",
    value: "10,000+",
    annotation: "Growing community voices across Adamawa wards",
  },
  {
    label: "Polling Units",
    value: "420",
    annotation: "Data structured exactly where voters vote",
  },
  {
    label: "Data Precision",
    value: "Ward-Level",
    annotation: "Organized down to the polling unit level",
  },
];

export type ProcessStep = {
  name: string;
  number: string;
  description: string;
  icon: IconType;
};

export const processSteps: ProcessStep[] = [
  {
    name: "Citizens Share Their Voice",
    number: "01",
    description:
      "Voters complete a guided survey about their priorities, concerns, and candidate support from any device.",
    icon: Squares2X2Icon,
  },
  {
    name: "Geographic Precision",
    number: "02",
    description:
      "Responses organize automatically by State → LGA → Ward → Polling Unit for unrivaled accuracy.",
    icon: MapPinIcon,
  },
  {
    name: "Actionable Insights",
    number: "03",
    description:
      "Candidates view real-time dashboards surfacing support strength, sentiment, and policy priorities.",
    icon: ChartBarIcon,
  },
];

export type FeatureCard = {
  title: string;
  description: string;
  icon: IconType;
};

export const featureCards: FeatureCard[] = [
  {
    title: "Know Your Exact Location",
    description:
      "We organize every response by State → LGA → Ward → Polling Unit for unmatched clarity.",
    icon: MapPinIcon,
  },
  {
    title: "Make Your Voice Heard",
    description:
      "Let candidates know the priorities in your community through concise survey questions.",
    icon: MegaphoneIcon,
  },
  {
    title: "Support Who You Trust",
    description:
      "Choose the candidate you believe in—your support routes straight to their dashboard.",
    icon: CheckCircleIcon,
  },
  {
    title: "Your Data is Protected",
    description:
      "Phone verification and encrypted storage protect voter information from end to end.",
    icon: LockClosedIcon,
  },
  {
    title: "Candidates See Trends",
    description:
      "Dashboards surface demographics, sentiment, and issue trends in real time.",
    icon: ChartBarIcon,
  },
  {
    title: "Register Anywhere",
    description:
      "Optimized for mobile, tablet, or desktop so supporters can join from any device.",
    icon: DevicePhoneMobileIcon,
  },
];

export const nigeriaGradient =
  "bg-[radial-gradient(circle_at_14%_18%,rgba(70,194,167,0.22),transparent_55%),radial-gradient(circle_at_88%_22%,rgba(20,53,46,0.18),transparent_60%)]";

export const heroBackgroundGradient =
  "bg-[linear-gradient(140deg,_#eff9f5_0%,_#ffffff_55%,_#f9fbfa_100%)]";

export const heroPlaceholder = {
  imageUrl:
    "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80",
  alt: "Illustration of data points across Nigeria",
};

export const heroSupportingCopy =
  "Supporters across Nigeria register their details, choose their candidate, and surface the issues that matter most. WardWise keeps every data point organized, private, and ready for action.";

export const platformPillars = [
  {
    title: "Connected Field Network",
    description:
      "Local enumerators, digital forms, and automated lookups ensure voter registrations are verified at the polling-unit level without friction.",
    focus: "Field Operations",
  },
  {
    title: "Campaign Intelligence Cloud",
    description:
      "Dashboards, segmentation tools, and exportable dossiers give candidates a command centre for every supporter touchpoint.",
    focus: "Decision Tools",
  },
  {
    title: "Nationwide Rollout Ready",
    description:
      "State-by-state onboarding playbooks, language localization, and partner APIs make it simple to scale WardWise across Nigeria.",
    focus: "Scale",
  },
];

export const impactHighlights = [
  {
    title: "Built for nationwide rollout",
    description:
      "WardWise maps Nigeria’s electoral structure so campaigns and civic teams can activate every ward and polling unit with confidence.",
    icon: GlobeAltIcon,
  },
  {
    title: "Trusted by supporters and candidates",
    description:
      "Voters know their insights go straight to the candidate they choose, while teams receive structured, consent-driven data.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Decisions grounded in communities",
    description:
      "Leadership groups interpret real-time dashboards that highlight local needs—from jobs to infrastructure—so action plans start with constituents.",
    icon: ChartBarIcon,
  },
];

export const trustIndicators = [
  "Backed by civic leaders and campaign strategists",
  "Verified polling-unit mapping and validation",
  "Secure infrastructure hosted in Nigeria",
];

export const securityHighlights = [
  {
    title: "Verified identities",
    description:
      "Phone OTP verification, voter roll matching, and field-agent attestations keep registrations real and duplications out.",
    icon: CheckCircleIcon,
  },
  {
    title: "Data residency in Nigeria",
    description:
      "Encrypted databases hosted within Nigeria offer compliance with national data protection laws and resilient uptime.",
    icon: LockClosedIcon,
  },
  {
    title: "Role-based access",
    description:
      "Candidates, analysts, and field teams get tailored workspaces with auditable access trails and download controls.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Secure exports",
    description:
      "Sensitive exports are watermarked, timed, and logged so campaign assets stay in the right hands.",
    icon: ArrowDownTrayIcon,
  },
];

export const candidateBenefits = [
  "See all your supporters organized by polling unit",
  "Understand what issues matter most in each ward",
  "Track registration growth in real time",
  "Export data for campaign planning",
  "Identify gaps in your coverage",
];

export const candidateDashboardPlaceholder = {
  imageUrl:
    "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
  alt: "Candidate dashboard mockup",
};
