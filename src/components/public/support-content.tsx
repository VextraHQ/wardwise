"use client";

import Link from "next/link";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  HiChevronDown,
  HiChip,
  HiGlobeAlt,
  HiLockClosed,
  HiMail,
  HiUserGroup,
} from "react-icons/hi";
import { PublicSupportLayout } from "@/components/layout/public-support-layout";
import { Button } from "@/components/ui/button";
import { faqItems, supportChannels } from "@/lib/data/support-data";
import type { FAQItem } from "@/lib/data/support-data";
import { cn } from "@/lib/utils";

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
    <PublicSupportLayout
      eyebrow="Support Center"
      title="Find answers before you need escalation"
      subtitle="Start with the common questions, then jump straight into contact if you need a human response."
    >
      <div className="space-y-8">
        <section className="grid gap-4 sm:grid-cols-[minmax(0,1.15fr)_320px]">
          <div className="border-border/60 bg-card overflow-hidden rounded-sm border shadow-none">
            <div className="border-border/60 bg-muted/20 border-b px-5 py-3">
              <p className="text-foreground text-sm font-semibold">
                Direct channels
              </p>
            </div>

            <div className="divide-border/60 divide-y">
              {supportChannels.map((channel) => (
                <Link
                  key={channel.name}
                  href={channel.href}
                  className="hover:bg-primary/5 flex items-start gap-3 px-5 py-4 transition-colors"
                >
                  <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-sm">
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

          <div className="border-primary/30 bg-primary/5 rounded-sm border shadow-none">
            <div className="border-primary/20 border-b px-5 py-3">
              <p className="text-foreground text-sm font-semibold">
                Need a guided reply?
              </p>
            </div>
            <div className="space-y-4 px-5 py-5">
              <p className="text-muted-foreground text-sm leading-6">
                Use the structured contact form when you want your request
                routed with context for support, demos, press, or partnerships.
              </p>
              <Button
                asChild
                className="w-full rounded-sm font-mono text-[11px] tracking-widest uppercase"
              >
                <Link href="/contact">Open Contact Form</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-border/60 bg-card space-y-6 rounded-sm border p-5 shadow-none sm:p-6">
          <h2 className="text-foreground text-base font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          {Object.entries(groupedFAQs).map(([categoryKey, items]) => (
            <FAQAccordion
              key={categoryKey}
              items={items}
              categoryKey={categoryKey}
              category={
                categoryNames[categoryKey as keyof typeof categoryNames]
              }
            />
          ))}
        </section>
      </div>
    </PublicSupportLayout>
  );
}
