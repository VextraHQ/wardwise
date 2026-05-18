"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  IconCheck,
  IconShieldCheck,
  IconUsers,
  IconPhone,
  IconMail,
  IconMessageCircle,
  IconReportAnalytics,
  IconHeadset,
  IconMapPin,
  IconDatabase,
  IconStar,
} from "@tabler/icons-react";
import { toast } from "sonner";

/**
 * TODO: [BACKEND] Pricing & Subscription API
 * - GET /api/subscriptions/plans - Available plans
 * - POST /api/subscriptions/subscribe - Create subscription
 * - GET /api/subscriptions/current - Current plan details
 * - Integration with Paystack/Flutterwave for payments
 */

interface PlanFeature {
  text: string;
  icon: React.ReactNode;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  priceDetail: string;
  badge?: string;
  highlighted?: boolean;
  features: PlanFeature[];
  cta: string;
  ctaVariant: "default" | "outline" | "secondary";
  currentPlan?: boolean;
}

const PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Database access with voter registration data",
    price: "\u20A650,000",
    priceDetail: "per month, per LGA",
    currentPlan: true,
    features: [
      {
        text: "Voter names & demographics",
        icon: <IconUsers className="size-4" />,
        included: true,
      },
      {
        text: "Location data (State, LGA, Ward)",
        icon: <IconMapPin className="size-4" />,
        included: true,
      },
      {
        text: "Supporter preferences",
        icon: <IconDatabase className="size-4" />,
        included: true,
      },
      {
        text: "Registration date & status",
        icon: <IconReportAnalytics className="size-4" />,
        included: true,
      },
      {
        text: "Phone & email contact info",
        icon: <IconPhone className="size-4" />,
        included: false,
      },
      {
        text: "SMS/email outreach tools",
        icon: <IconMessageCircle className="size-4" />,
        included: false,
      },
    ],
    cta: "Current Plan",
    ctaVariant: "secondary",
  },
  {
    id: "standard",
    name: "Standard",
    description: "Contact access with outreach capabilities",
    price: "\u20A6150,000",
    priceDetail: "per month, per LGA + \u20A610/SMS",
    features: [
      {
        text: "Everything in Starter",
        icon: <IconCheck className="size-4" />,
        included: true,
      },
      {
        text: "Phone numbers & email addresses",
        icon: <IconPhone className="size-4" />,
        included: true,
      },
      {
        text: "Email outreach tools",
        icon: <IconMail className="size-4" />,
        included: true,
      },
      {
        text: "SMS campaign tools",
        icon: <IconMessageCircle className="size-4" />,
        included: true,
      },
      {
        text: "Deduplication report",
        icon: <IconReportAnalytics className="size-4" />,
        included: false,
      },
    ],
    cta: "Upgrade to Standard",
    ctaVariant: "outline",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Full analytics with advanced field insights",
    price: "\u20A6300,000",
    priceDetail: "per month, per LGA",
    badge: "Recommended",
    highlighted: true,
    features: [
      {
        text: "Everything in Standard",
        icon: <IconCheck className="size-4" />,
        included: true,
      },
      {
        text: "Deduplication report",
        icon: <IconReportAnalytics className="size-4" />,
        included: true,
      },
      {
        text: "GPS field tracking",
        icon: <IconShieldCheck className="size-4" />,
        included: true,
      },
      {
        text: "Priority support",
        icon: <IconHeadset className="size-4" />,
        included: true,
      },
      {
        text: "Advanced analytics",
        icon: <IconReportAnalytics className="size-4" />,
        included: true,
      },
    ],
    cta: "Upgrade to Premium",
    ctaVariant: "default",
  },
];

const FAQ_ITEMS = [
  {
    question: "What's included in each plan?",
    answer:
      "Each plan builds on the previous tier. Starter gives you database access with names, locations, and candidate preferences. Standard adds contact information and outreach tools. Premium adds deduplication reports and advanced analytics.",
  },
  {
    question: "Can I change plans at any time?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. When upgrading, the price difference is prorated for the remainder of your billing cycle. Downgrades take effect at the start of your next billing cycle.",
  },
  {
    question: "How does billing work?",
    answer:
      "Plans are billed monthly per LGA. SMS outreach (Standard and above) is billed per message at \u20A610 each. You only pay for outreach you initiate.",
  },
];

export function PricingContent() {
  const handleUpgrade = (planId: string) => {
    toast.info("Payment integration coming soon", {
      description: `Upgrade to ${planId} plan will be available when payment processing is connected.`,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Plans & Pricing
          </h1>
          <Badge
            variant="outline"
            className="rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
          >
            Demo Pricing
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Choose the right plan for your campaign. Access supporter data,
          contact information, and advanced analytics based on your needs.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col rounded-sm shadow-none ${
              plan.highlighted
                ? "border-primary ring-primary/20 ring-2"
                : "border-border/60"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground gap-1 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase">
                  <IconStar className="size-3" />
                  {plan.badge}
                </Badge>
              </div>
            )}
            <CardHeader className={plan.badge ? "pt-6" : undefined}>
              <CardTitle className="text-sm font-semibold tracking-tight">
                {plan.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-sm">
                {plan.description}
              </CardDescription>
              <div className="pt-2">
                <span className="text-foreground font-mono text-3xl font-bold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-muted-foreground ml-1 font-mono text-[11px] tracking-widest uppercase">
                  / {plan.priceDetail}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <div className="flex-1 space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                        feature.included
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {feature.included ? (
                        <IconCheck className="size-3" />
                      ) : (
                        <span className="text-[11px]">&mdash;</span>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        feature.included
                          ? "text-foreground"
                          : "text-muted-foreground line-through"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button
                  variant={plan.ctaVariant}
                  className="w-full rounded-sm font-mono text-[11px] tracking-widest uppercase"
                  disabled={plan.currentPlan}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {plan.cta}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enterprise Callout */}
      <Card className="border-primary/20 bg-primary/5 rounded-sm shadow-none">
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            <h3 className="text-foreground font-semibold">
              Need custom volume pricing?
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              For campaigns covering multiple LGAs or states, contact us for
              enterprise pricing with volume discounts.
            </p>
          </div>
          <Button
            variant="outline"
            className="shrink-0 rounded-sm font-mono text-[11px] tracking-widest uppercase"
            onClick={() =>
              toast.info("Contact sales at enterprise@wardwise.ng")
            }
          >
            Contact Sales
          </Button>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Frequently Asked Questions
        </h2>
        <Accordion
          type="single"
          collapsible
          className="border-border/60 rounded-sm border"
        >
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border-border/60 px-4 last:border-b-0"
            >
              <AccordionTrigger className="py-4 text-sm font-medium transition-all hover:no-underline!">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
