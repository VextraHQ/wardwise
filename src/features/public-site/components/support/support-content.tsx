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
import { PublicSupportLayout } from "@/features/public-site/components/support/public-support-layout";
import { Button } from "@/components/ui/button";
import { faqItems, supportChannels } from "@/lib/constants/support-data";
import type { FAQItem } from "@/lib/constants/support-data";
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

const supportChannelIcons = {
  email: HiMail,
  website: HiGlobeAlt,
  phone: HiMail,
  whatsapp: HiMail,
  twitter: HiMail,
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
          <Icon className="size-5" aria-hidden />
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
                  "border-border/60 bg-card/90 flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left shadow-none transition-all",
                  "hover:border-primary/30 hover:bg-muted/40",
                  "data-[state=open]:border-primary/40 data-[state=open]:bg-primary/5",
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
              <div className="border-primary/20 bg-primary/5 text-muted-foreground mt-2 rounded-xl border-l-2 py-3 pr-4 pl-4 text-sm leading-relaxed">
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
      title="Answers about WardWise, Collect, and campaign onboarding"
      subtitle="Use these quick explanations to understand what the platform does today, then contact us if you want a demo or a direct reply."
    >
      <div className="space-y-8">
        <section className="grid gap-5 sm:grid-cols-[minmax(0,1.15fr)_320px]">
          <div className="border-border/60 bg-card/90 overflow-hidden rounded-2xl border shadow-none">
            <div className="border-border/60 bg-muted/20 border-b px-5 py-3.5">
              <p className="text-foreground text-sm font-semibold">
                Reach the WardWise team
              </p>
            </div>

            <div className="divide-border/60 divide-y">
              {supportChannels.map((channel) => {
                const ChannelIcon = supportChannelIcons[channel.icon] ?? HiMail;

                return (
                  <Link
                    key={channel.name}
                    href={channel.href}
                    className="hover:bg-primary/5 flex items-start gap-3 px-5 py-4 transition-colors"
                  >
                    <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                      <ChannelIcon className="size-4" aria-hidden />
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
                );
              })}
            </div>
          </div>

          <div className="border-primary/25 bg-primary/5 rounded-2xl border p-5">
            <p className="text-foreground text-sm font-semibold">
              Need a demo or direct reply?
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Use the contact form when you want help with onboarding, demos,
              support, partnerships, or a more guided explanation of how
              WardWise fits your campaign.
            </p>
            <Button
              asChild
              className="mt-4 w-full rounded-sm text-[11px] font-bold tracking-widest uppercase"
            >
              <Link href="/contact">Open contact form</Link>
            </Button>
          </div>
        </section>

        <section className="border-border/60 bg-card/90 space-y-6 rounded-2xl border p-5 shadow-none sm:p-6">
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
