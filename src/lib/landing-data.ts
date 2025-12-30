import {
  HiArrowDown,
  HiChartBar,
  HiCheckCircle,
  HiDeviceMobile,
  HiGlobeAlt,
  HiLockClosed,
  HiLocationMarker,
  HiSpeakerphone,
  HiShieldCheck,
  HiViewGrid,
} from "react-icons/hi";
import type { ComponentType } from "react";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

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
    icon: HiViewGrid,
  },
  {
    name: "Geographic Precision",
    number: "02",
    description:
      "Responses organize automatically by State → LGA → Ward → Polling Unit for unrivaled accuracy.",
    icon: HiLocationMarker,
  },
  {
    name: "Actionable Insights",
    number: "03",
    description:
      "Candidates view real-time dashboards surfacing support strength, sentiment, and policy priorities.",
    icon: HiChartBar,
  },
];

export type FeatureCard = {
  title: string;
  description: string;
  icon: IconType;
  metricLabel: string;
  metricValue: string;
  metricTrend: string;
  color?: "primary" | "orange" | "emerald";
};

export const featureCards: FeatureCard[] = [
  {
    title: "Voter Ward Mapping",
    description:
      "We organize every response by State → LGA → Ward → Polling Unit for unmatched clarity.",
    icon: HiLocationMarker,
    metricLabel: "Coverage Accuracy",
    metricValue: "99.2%",
    metricTrend: "+4.8%",
    color: "primary",
  },
  {
    title: "Canvasser Field Portal",
    description:
      "Empower your boots on the ground with a mobile-optimized interface for real-time verification.",
    icon: HiDeviceMobile,
    metricLabel: "Active Canvassers",
    metricValue: "420+",
    metricTrend: "+12.4%",
    color: "orange",
  },
  {
    title: "Support Who You Trust",
    description:
      "Choose the candidate you believe in—your support routes straight to their dashboard.",
    icon: HiCheckCircle,
    metricLabel: "Verified Choices",
    metricValue: "12,305",
    metricTrend: "+12%",
    color: "emerald",
  },
  {
    title: "Secure Verification",
    description:
      "OTP verification and unique agent codes ensure every voter is real and uniquely registered.",
    icon: HiLockClosed,
    metricLabel: "Security Uptime",
    metricValue: "100%",
    metricTrend: "Secure",
    color: "primary",
  },
  {
    title: "Candidate Insights",
    description:
      "Dashboards surface demographics, sentiment, and issue trends in real time for strategic decisions.",
    icon: HiChartBar,
    metricLabel: "Insights Generated",
    metricValue: "740",
    metricTrend: "+38",
    color: "emerald",
  },
  {
    title: "Community Outreach",
    description:
      "Identify gaps in coverage and coordinate field efforts at the polling-unit level.",
    icon: HiSpeakerphone,
    metricLabel: "Reach Extension",
    metricValue: "85%",
    metricTrend: "+15%",
    color: "orange",
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
  "Empowering citizens, canvassers, and candidates with ward-level precision. From field-verified data to strategic victory, WardWise is Nigeria's premier civic engagement ecosystem.";

export type EcosystemRole = {
  role: string;
  title: string;
  description: string;
  color: string;
  features: string[];
  icon: IconType;
};

export const ecosystemRoles: EcosystemRole[] = [
  {
    role: "Voters",
    title: "Voice Your Priorities",
    description:
      "Support candidates and share community needs directly from your device.",
    color: "teal",
    features: ["Quick Registration", "Issue Reporting", "Candidate Support"],
    icon: HiCheckCircle,
  },
  {
    role: "Canvassers",
    title: "Activate the Field",
    description:
      "Securely register and verify voters house-to-house with real-time sync.",
    color: "orange",
    features: ["Field-Ready Mobile App", "Agent Codes", "Instant Verification"],
    icon: HiDeviceMobile,
  },
  {
    role: "Candidates",
    title: "Drive to Victory",
    description:
      "Access deep ward-level insights to optimize your campaign strategy.",
    color: "emerald",
    features: [
      "Strategic Dashboards",
      "Sentiment Analysis",
      "Resource Allocation",
    ],
    icon: HiChartBar,
  },
];

export const platformPillars = [
  {
    title: "Connected Field Network",
    description:
      "Local canvassers, digital forms, and automated lookups ensure voter registrations are verified at the polling-unit level without friction.",
    focus: "Field Operations",
    signal:
      "Polling-unit canvassers sync with verification bots to confirm identity records before campaigns go live.",
    metric: {
      label: "Verification speed",
      value: "12m",
      context: "Avg. per ward",
    },
  },
  {
    title: "Campaign Intelligence Cloud",
    description:
      "Dashboards, segmentation tools, and exportable dossiers give candidates a command centre for every supporter touchpoint.",
    focus: "Decision Tools",
    signal:
      "Custom dashboards surface sentiment trends, issue priorities, and supporter journeys for rapid decision-making.",
    metric: {
      label: "Insights refreshed",
      value: "Hourly",
      context: "Real-time sync",
    },
  },
  {
    title: "Nationwide Rollout Ready",
    description:
      "State-by-state onboarding playbooks, language localization, and partner APIs make it simple to scale WardWise across Nigeria.",
    focus: "Scale",
    signal:
      "Regional playbooks and partner APIs orchestrate growth from pilot LGAs to national coalitions in weeks, not months.",
    metric: {
      label: "States prepared",
      value: "10",
      context: "Launch-ready",
    },
  },
];

export const impactHighlights = [
  {
    title: "Built for nationwide rollout",
    description:
      "WardWise maps Nigeria's electoral structure so campaigns and civic teams can activate every ward and polling unit with confidence.",
    icon: HiGlobeAlt,
  },
  {
    title: "Trusted by seekers of change",
    description:
      "Voters, canvassers, and candidates trust our secure, transparent, and ward-focused data protocols.",
    icon: HiShieldCheck,
  },
  {
    title: "Decisions grounded in communities",
    description:
      "Leadership groups interpret real-time dashboards that highlight local needs—from jobs to infrastructure—so action plans start with constituents.",
    icon: HiChartBar,
  },
];

export const trustIndicators = [
  "Validated by field agents and campaign strategists",
  "Verified polling-unit mapping and validation",
  "Secure infrastructure with end-to-end encryption",
];

export const securityHighlights = [
  {
    title: "Verified identities",
    description:
      "Phone OTP verification, agent-facilitated attestations, and field-agent validation keep registrations real.",
    icon: HiCheckCircle,
  },
  {
    title: "Secure Field Access",
    description:
      "Canvassers use limited-access agent codes and location-locked registration to prevent fraud.",
    icon: HiLockClosed,
  },
  {
    title: "Role-based access",
    description:
      "Candidates, canvassers, and analysts get tailored workspaces with auditable access trails.",
    icon: HiShieldCheck,
  },
  {
    title: "Data Protection",
    description:
      "All voter information is encrypted and stored according to strict privacy standards.",
    icon: HiArrowDown,
  },
];

export const candidateBenefits = [
  "See all your supporters organized by polling unit",
  "Empower your canvassers with mobile tools",
  "Understand what issues matter most in each ward",
  "Track registration growth in real time",
  "Identify gaps in your field coverage",
];
