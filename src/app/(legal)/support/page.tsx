"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HiQuestionMarkCircle,
  HiChevronDown,
  HiMail,
  HiGlobeAlt,
  HiUserGroup,
  HiLockClosed,
  HiChip,
} from "react-icons/hi";
import { LegalPageLayout } from "@/components/layout/legal-page-layout";
import { faqItems, supportChannels } from "@/lib/data/legal-data";
import type { FAQItem } from "@/lib/data/legal-data";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
}: {
  items: FAQItem[];
  category: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const Icon = categoryIcons[items[0]?.category ?? "general"];

  return (
    <div className="space-y-3">
      {/* Category Header */}
      <div className="flex items-center gap-2 pb-2">
        <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg">
          <Icon className="size-3.5" />
        </div>
        <h3 className="text-foreground font-semibold">{category}</h3>
        <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs">
          {items.length}
        </span>
      </div>

      {/* FAQ Items */}
      <div className="space-y-2">
        {items.map((faq, index) => (
          <div
            key={index}
            className="border-border bg-card/50 overflow-hidden rounded-lg border"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3 text-left transition-colors"
            >
              <span className="text-foreground pr-4 text-sm font-medium">
                {faq.question}
              </span>
              <HiChevronDown
                className={cn(
                  "text-muted-foreground size-4 shrink-0 transition-transform duration-200",
                  openIndex === index && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-muted-foreground border-border border-t px-4 py-3 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SupportCenterPage() {
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
      variant="emerald"
      activePage="/support"
    >
      {/* Contact Cards */}
      <div className="mb-10">
        <h2 className="text-foreground mb-4 text-lg font-bold">
          Contact Support
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {supportChannels.map((channel) => (
            <Link
              key={channel.name}
              href={channel.href}
              className="border-border bg-muted/30 hover:border-primary/30 hover:bg-primary/5 group flex items-start gap-4 rounded-lg border p-4 transition-all"
            >
              <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                <HiMail className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground font-semibold">
                  {channel.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {channel.description}
                </p>
                <p className="text-primary mt-1 truncate text-sm font-medium">
                  {channel.contact}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-lg font-bold">
            Frequently Asked Questions
          </h2>
        </div>

        {Object.entries(groupedFAQs).map(([category, items]) => (
          <FAQAccordion
            key={category}
            items={items}
            category={categoryNames[category as keyof typeof categoryNames]}
          />
        ))}
      </div>

      {/* Still Need Help? */}
      <div className="border-primary/20 bg-primary/5 mt-10 rounded-lg border p-6 text-center">
        <h3 className="text-foreground mb-2 text-lg font-bold">
          Still Need Help?
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Can&apos;t find what you&apos;re looking for? Our support team is here
          to help.
        </p>
        <Link
          href="/contact"
          className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors"
        >
          <HiMail className="size-4" />
          Contact Us
        </Link>
      </div>
    </LegalPageLayout>
  );
}
