import { navigationLinks } from "@/features/public-site/lib/landing-data";

/** Standalone product page — same nav chrome as sections; meta label signals a route. */
export const publicProductLink = {
  label: "For Campaigns",
  meta: "Overview",
  href: "/for-campaigns",
  description: "How WardWise fits a campaign",
} as const;

export const publicSiteLinks = [
  publicProductLink,
  {
    label: "Support",
    meta: "Help",
    href: "/support",
    description: "Answers and contact paths",
  },
  {
    label: "Contact",
    meta: "Reach us",
    href: "/contact",
    description: "General inquiries and demos",
  },
] as const;

/** Homepage section anchors (hash links on `/`). */
export const homepageSectionNav = navigationLinks.map((link) => ({
  label: link.label,
  href: `/#${link.section}`,
  section: link.section,
}));

export const publicSiteCta = {
  label: "Request a Demo",
  href: "/contact",
} as const;
