import type { IconType } from "react-icons";
import {
  HiChartBar,
  HiDeviceMobile,
  HiViewGrid,
} from "react-icons/hi";

export type PlatformModule = {
  status: "Live" | "Active" | "Direction";
  module: string;
  title: string;
  description: string;
  bullets: string[];
};

export const platformModules: PlatformModule[] = [
  {
    status: "Live",
    module: "WardWise Collect",
    title: "Capture supporters where the campaign actually happens",
    description:
      "The field registration module. Mobile-friendly capture that ties every supporter to a real LGA, ward, and polling unit instead of leaving names scattered across notebooks and chats.",
    bullets: [
      "Branded supporter form for field teams",
      "Records organized by ward and polling unit",
      "Referral and field attribution built in",
    ],
  },
  {
    status: "Active",
    module: "Reporting & Insights",
    title: "Turn field activity into a campaign view leadership can use",
    description:
      "A shared reporting layer for candidates and managers. See where support is building, where coverage is thin, and what the field is producing without waiting on verbal summaries.",
    bullets: [
      "Live supporter growth by geography",
      "Field and referral visibility",
      "Campaign readouts for candidates and managers",
    ],
  },
  {
    status: "Direction",
    module: "Wider Field Operations",
    title: "Built to grow into the rest of campaign operations",
    description:
      "WardWise is designed as a platform, not a single form. As campaigns adopt Collect and reporting, more workflows for candidates, canvassers, and operations teams come online without changing the underlying field structure.",
    bullets: [
      "Deeper candidate-facing dashboards",
      "Dedicated canvasser and mobile workflows",
      "Broader integrated campaign operations",
    ],
  },
];

export type AudienceCard = {
  role: string;
  title: string;
  description: string;
  outcomes: string[];
  icon: IconType;
};

export const audiences: AudienceCard[] = [
  {
    role: "Candidates",
    title: "See the campaign you're actually running",
    description:
      "Stop guessing where support is strong. Open one shared view that turns field activity into a picture you can act on.",
    outcomes: [
      "Where supporters are growing",
      "Where coverage is still thin",
      "Where to deploy attention next",
    ],
    icon: HiChartBar,
  },
  {
    role: "Campaign Managers",
    title: "One operating picture for the whole team",
    description:
      "Stop pulling spreadsheets together. Give every coordinator the same map, the same numbers, and the same daily readout.",
    outcomes: [
      "Cleaner supporter records",
      "Coordinated field deployment",
      "Faster, defensible decisions",
    ],
    icon: HiViewGrid,
  },
  {
    role: "Field Teams",
    title: "A capture flow built for the trail, not a desk",
    description:
      "Designed for the real conditions canvassers work in. Mobile-friendly, light on signal, and structured around the ward they're actually walking.",
    outcomes: [
      "Mobile-first supporter capture",
      "Works in low-signal conditions",
      "Records tied to real polling units",
    ],
    icon: HiDeviceMobile,
  },
];

export const beforeAfter = [
  {
    before:
      "Supporter names live in WhatsApp threads, notebooks, and spreadsheets.",
    after:
      "One structured supporter record tied to LGA, ward, and polling unit.",
  },
  {
    before:
      "Field updates trickle in through phone calls and informal summaries.",
    after: "Live capture feeds straight into a shared campaign view.",
  },
  {
    before: "Coverage decisions rely on instinct and the loudest coordinator.",
    after:
      "Coverage decisions follow the geography the campaign actually owns.",
  },
  {
    before:
      "Reporting to the candidate happens at the end of the week, if at all.",
    after: "Candidates open the same readout the operations team works from.",
  },
];

export const heroStats = [
  { label: "Platform", value: "WardWise" },
  { label: "Live module", value: "Collect" },
  { label: "Built around", value: "Electoral geography" },
];
