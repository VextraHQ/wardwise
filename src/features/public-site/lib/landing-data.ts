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
  {
    label: "Collect",
    section: "collect",
  },
];

export type StatHighlight = {
  label: string;
  value: string;
  annotation?: string;
};

export const statHighlights: StatHighlight[] = [
  {
    label: "Supporters Captured",
    value: "10,000+",
    annotation: "Growing records across live campaign wards",
  },
  {
    label: "Polling Units Mapped",
    value: "420",
    annotation: "Structured around where people actually vote",
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
    name: "Share the campaign form",
    number: "01",
    description:
      "Campaign teams launch a branded supporter form and give field staff a simple way to start capturing support from the ground.",
    icon: HiViewGrid,
  },
  {
    name: "Capture supporters in the field",
    number: "02",
    description:
      "Canvassers and coordinators register supporters on mobile, with the right LGA, ward, and polling unit attached to each record.",
    icon: HiLocationMarker,
  },
  {
    name: "See where support is growing",
    number: "03",
    description:
      "Candidates and managers open a shared reporting view to spot strong areas, weak spots, and where to deploy attention next.",
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
    title: "Real Electoral Geography",
    description:
      "Every supporter record is organized by state, LGA, ward, and polling unit so the data matches the real campaign map.",
    icon: HiLocationMarker,
    metricLabel: "Map Structure",
    metricValue: "Ward-Level",
    metricTrend: "Precise",
    color: "primary",
  },
  {
    title: "Mobile Field Capture",
    description:
      "Field teams can capture supporters on mobile and keep moving, even when signal conditions are weak or inconsistent.",
    icon: HiDeviceMobile,
    metricLabel: "Capture Mode",
    metricValue: "Mobile-First",
    metricTrend: "Low-signal ready",
    color: "orange",
  },
  {
    title: "Supporter Capture Flow",
    description:
      "Supporters can be captured through a guided, campaign-ready flow that feeds straight into reporting instead of staying in scattered notes.",
    icon: HiCheckCircle,
    metricLabel: "Structured Records",
    metricValue: "12,305",
    metricTrend: "+12%",
    color: "emerald",
  },
  {
    title: "Cleaner Records",
    description:
      "WardWise helps reduce duplicate or weak supporter records so follow-up, reporting, and mobilization stay cleaner.",
    icon: HiLockClosed,
    metricLabel: "Record Confidence",
    metricValue: "High",
    metricTrend: "Tracked",
    color: "primary",
  },
  {
    title: "Candidate Insights",
    description:
      "Dashboards show where support is building, where coverage is thin, and what the field is telling the campaign in real time.",
    icon: HiChartBar,
    metricLabel: "Insights Generated",
    metricValue: "740",
    metricTrend: "+38",
    color: "emerald",
  },
  {
    title: "Field Deployment",
    description:
      "See geographic gaps early and direct field effort to the wards and polling-unit areas that still need attention.",
    icon: HiSpeakerphone,
    metricLabel: "Reach Extension",
    metricValue: "85%",
    metricTrend: "+15%",
    color: "orange",
  },
];

export const nigeriaGradient =
  "bg-[radial-gradient(circle_at_14%_18%,rgba(2,201,136,0.22),transparent_55%),radial-gradient(circle_at_88%_22%,rgba(9,40,42,0.18),transparent_60%)]";

export const heroBackgroundGradient =
  "bg-[linear-gradient(140deg,_#F5F5ED_0%,_#ffffff_55%,_#F5F5ED_100%)]";

// export const heroPlaceholder = {
//   imageUrl:
//     "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80",
//   alt: "Illustration of data points across Nigeria",
// };

export const heroSupportingCopy =
  "WardWise helps your campaign capture supporters from the field, organize them by LGA, ward, and polling unit, and see where support is growing in real time.";

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
    role: "Supporters",
    title: "The Ground Picture",
    description:
      "Supporters captured from the field and tied to the real electoral map your campaign works with every day.",
    color: "teal",
    features: ["Ward & PU structure", "Cleaner records", "Follow-up readiness"],
    icon: HiCheckCircle,
  },
  {
    role: "Canvassers",
    title: "Activate the Field",
    description:
      "Capture supporter details from the ground with a mobile flow built for real campaign fieldwork.",
    color: "orange",
    features: ["Field-ready mobile flow", "Referral tracking", "Real-time sync"],
    icon: HiDeviceMobile,
  },
  {
    role: "Candidates",
    title: "Drive to Victory",
    description:
      "See where support is building, where coverage is weak, and where the next deployment should go.",
    color: "emerald",
    features: ["Campaign dashboards", "Field analytics", "Deployment decisions"],
    icon: HiChartBar,
  },
];

export const platformPillars = [
  {
    title: "Field Capture That Matches the Map",
    description:
      "WardWise Collect helps field teams capture supporters and tie every record to the real electoral map: LGA, ward, and polling unit.",
    focus: "Field Capture",
    signal:
      "The same record a canvasser captures in the field becomes the same record the campaign reports on later.",
    metric: {
      label: "Capture flow",
      value: "5 Steps",
      context: "Mobile-friendly",
    },
  },
  {
    title: "Reporting That Guides Campaign Decisions",
    description:
      "Candidates and campaign managers get one shared view of supporter growth, field activity, and where the campaign needs more attention.",
    focus: "Reporting",
    signal:
      "Instead of waiting for scattered updates, teams can see what the field is saying while the campaign is still moving.",
    metric: {
      label: "Insight refresh",
      value: "Real Time",
      context: "As data lands",
    },
  },
  {
    title: "State-Ready Now, Expandable Nationwide",
    description:
      "WardWise is built to start with one live state campaign and expand cleanly across more states without changing the underlying field structure.",
    focus: "Growth",
    signal:
      "Campaigns can start with the geography they need now and keep the same operating model as coverage grows into more states later.",
    metric: {
      label: "Scale path",
      value: "Nationwide",
      context: "Built to expand",
    },
  },
];

export type CoreStat = {
  label: string;
  value: string;
  delta: string;
  caption: string;
};

export const coreStats: CoreStat[] = [
  {
    label: "Supporters Captured",
    value: "12,305",
    delta: "+12%",
    caption: "Structured field records",
  },
  {
    label: "LGAs Active",
    value: "14",
    delta: "+3",
    caption: "Live campaign coverage",
  },
];

export const impactHighlights = [
  {
    title: "Built around real voting locations",
    description:
      "WardWise organizes support around the places campaigns actually work: LGAs, wards, and polling units.",
    icon: HiGlobeAlt,
  },
  {
    title: "Useful to candidates and field teams",
    description:
      "The same system helps field teams capture support and helps candidates understand what the field is producing.",
    icon: HiShieldCheck,
  },
  {
    title: "Turns field work into decisions",
    description:
      "Instead of waiting on notebooks, chats, and verbal summaries, campaigns get a clearer picture they can act on quickly.",
    icon: HiChartBar,
  },
];

export const trustIndicators = [
  "Built for real field teams",
  "Organized by wards and polling units",
  "Secure campaign data handling",
];

export const securityHighlights = [
  {
    title: "Cleaner supporter records",
    description:
      "WardWise helps campaigns reduce duplicate or messy field records so supporter lists stay more useful for real follow-up.",
    icon: HiCheckCircle,
  },
  {
    title: "Controlled field access",
    description:
      "Campaign teams can control who captures data and which users can see the larger reporting picture.",
    icon: HiLockClosed,
  },
  {
    title: "Role-based visibility",
    description:
      "Canvassers, managers, and candidates each get the level of access they need without exposing everything to everyone.",
    icon: HiShieldCheck,
  },
  {
    title: "Protected campaign data",
    description:
      "Supporter data is handled through secure infrastructure with privacy controls that help campaigns treat records responsibly.",
    icon: HiArrowDown,
  },
];

export const candidateBenefits = [
  "See supporters organized by LGA, ward, and polling unit",
  "Give field teams a cleaner mobile capture flow",
  "Track where support is growing in real time",
  "Follow up with stronger records later",
  "Spot weak coverage areas earlier",
];
