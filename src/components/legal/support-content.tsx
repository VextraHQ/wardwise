"use client";

import { HiQuestionMarkCircle, HiMail, HiChevronDown } from "react-icons/hi";
import { HiGlobeAlt, HiUserGroup, HiLockClosed, HiChip } from "react-icons/hi";
import Link from "next/link";
import { LegalPageLayout } from "@/components/layout/legal-page-layout";
import { faqItems, supportChannels } from "@/lib/data/legal-data";
import type { FAQItem } from "@/lib/data/legal-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

const categoryIcons = {
  general: HiGlobeAlt,
  account: HiUserGroup,
  privacy: HiLockClosed,
  technical: HiChip,
} as const;

const categoryNames = {
  general: "General",
  account: "Account & Registration",
  privacy: "Privacy & Data",
  technical: "Technical Issues",
} as const;

/**
 * FAQAccordion - Displays FAQ items grouped by category
 */
function FAQAccordion({
  items,
  category,
  categoryKey,
}: {
  items: FAQItem[];
  category: string;
  categoryKey: string;
}) {
  const Icon =
    categoryIcons[categoryKey as keyof typeof categoryIcons] || HiGlobeAlt;

  return (
    <div className="space-y-3">
      {/* Category Header - Cleaner inline style */}
      <div className="flex items-center gap-3 pb-1">
        <div className="text-primary">
          <Icon className="size-5" />
        </div>
        <h3 className="text-foreground text-sm font-semibold tracking-wide">
          {category}
        </h3>
        <span className="text-muted-foreground/70 text-xs tabular-nums">
          ({items.length})
        </span>
      </div>

      {/* Accordion Items */}
      <AccordionPrimitive.Root type="single" collapsible className="space-y-2">
        {items.map((faq, index) => (
          <AccordionPrimitive.Item
            key={index}
            value={`${categoryKey}-${index}`}
            className="group"
          >
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-sm border px-4 py-2.5 text-left transition-all",
                  "border-border/60 bg-card hover:border-primary/30 hover:bg-muted/50",
                  "data-[state=open]:border-primary/50 data-[state=open]:bg-primary/5",
                  "text-foreground text-sm font-medium",
                )}
              >
                <span className="leading-snug">{faq.question}</span>
                <HiChevronDown className="text-muted-foreground group-data-[state=open]:text-primary size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content
              className={cn(
                "overflow-hidden transition-all",
                "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
              )}
            >
              <div className="border-primary/20 bg-primary/5 text-muted-foreground mt-1.5 ml-1 rounded-sm border-l-2 py-2.5 pr-4 pl-4 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    </div>
  );
}

export function SupportContent() {
  const groupedFAQs = faqItems.reduce(
    (acc, faq) => {
      const category = faq.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(faq);
      return acc;
    },
    {} as Record<string, FAQItem[]>,
  );

  return (
    <LegalPageLayout
      title="Support Center"
      subtitle="Find answers and get help with WardWise"
      systemCode="SUPPORT_FAQ_001"
      icon={HiQuestionMarkCircle}
    >
      {/* Contact Cards */}
      <div className="mb-10">
        <h2 className="text-foreground mb-4 text-base font-bold">
          Contact Support
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {supportChannels.map((channel) => (
            <Link
              key={channel.name}
              href={channel.href}
              className="border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 group flex items-start gap-3 rounded-sm border p-4 shadow-none transition-all"
            >
              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-sm">
                <HiMail className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground text-sm font-semibold">
                  {channel.name}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {channel.description}
                </p>
                <p className="text-primary mt-1 truncate text-xs font-medium">
                  {channel.contact}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h2 className="text-foreground text-base font-bold">
          Frequently Asked Questions
        </h2>
        {Object.entries(groupedFAQs).map(([categoryKey, items]) => (
          <FAQAccordion
            key={categoryKey}
            items={items}
            categoryKey={categoryKey}
            category={categoryNames[categoryKey as keyof typeof categoryNames]}
          />
        ))}
      </div>

      {/* Still Need Help? */}
      <div className="border-border/60 bg-muted/30 mt-10 rounded-sm border p-5 text-center shadow-none">
        <h3 className="text-foreground mb-1.5 text-sm font-semibold tracking-tight">
          Still Need Help?
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Can&apos;t find what you&apos;re looking for? Our support team is
          ready to assist.
        </p>
        <Button
          asChild
          size="sm"
          className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
        >
          <Link href="/contact" className="gap-2">
            <HiMail className="size-4" />
            Contact Us
          </Link>
        </Button>
      </div>
    </LegalPageLayout>
  );
}
