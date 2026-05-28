"use client";

import { motion } from "motion/react";
import {
  HiArrowRight,
  HiUsers,
  HiClipboardList,
  HiShieldCheck,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LandingSectionEyebrow } from "@/features/public-site/components/shared/landing-section-eyebrow";
import { cn } from "@/lib/utils";

const collectFeatures = [
  {
    icon: HiClipboardList,
    title: "Mobile Supporter Capture",
    description:
      "A guided mobile flow helps field teams capture supporter details with the right LGA, ward, and polling unit.",
  },
  {
    icon: HiUsers,
    title: "Referral and Field Attribution",
    description:
      "See which field people or referral sources are actually bringing supporters into the system.",
  },
  {
    icon: HiShieldCheck,
    title: "Cleaner Supporter Records",
    description:
      "WardWise helps reduce duplicate or incomplete records so reporting and follow-up stay more reliable later.",
  },
];

export function CollectSection() {
  return (
    <section
      id="collect"
      className="bg-background text-foreground border-border/40 relative overflow-hidden border-b py-20 lg:py-28"
    >
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="relative mx-auto mb-14 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <LandingSectionEyebrow
              align="center"
              label="WardWise Collect"
              hint="Field module"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.15]"
          >
            Capture support from the field,{" "}
            <span className="text-primary font-serif font-normal italic">
              clearly.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed font-medium sm:text-lg"
          >
            WardWise Collect is the field registration side of the platform. It
            helps your team capture supporters on mobile, attach them to the
            right LGA, ward, and polling unit, and feed that information
            straight into campaign reporting.
          </motion.p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {collectFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="border-border/60 bg-card rounded-sm border p-7 shadow-none"
              >
                <div className="bg-primary/10 text-primary mb-5 flex size-10 items-center justify-center rounded-sm">
                  <Icon className="size-5" aria-hidden />
                </div>

                <h3 className="text-foreground mb-2 text-sm font-bold tracking-wide uppercase">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="border-border/60 bg-card relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-none border shadow-none"
        >
          <div className="border-primary absolute -top-px -left-px size-3 border-t-2 border-l-2" />
          <div className="border-primary absolute -top-px -right-px size-3 border-t-2 border-r-2" />
          <div className="border-primary absolute -bottom-px -left-px size-3 border-b-2 border-l-2" />
          <div className="border-primary absolute -right-px -bottom-px size-3 border-r-2 border-b-2" />

          <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="space-y-4 p-8 sm:p-10 md:pr-6 lg:pr-8">
              <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                Registration flow
              </p>
              <ul className="space-y-3" role="list">
                {[
                  {
                    step: "01",
                    label: "Supporter Details",
                    status: "complete",
                  },
                  {
                    step: "02",
                    label: "Location & Polling Unit",
                    status: "complete",
                  },
                  {
                    step: "03",
                    label: "Verification Details",
                    status: "active",
                  },
                  { step: "04", label: "Role & Group", status: "pending" },
                  { step: "05", label: "Referral Source", status: "pending" },
                ].map((item) => (
                  <li
                    key={item.step}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1"
                  >
                    <div
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-sm text-[9px] font-black",
                        item.status === "complete"
                          ? "bg-primary text-primary-foreground"
                          : item.status === "active"
                            ? "border-primary text-primary border-2"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.step}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold tracking-wide uppercase",
                        item.status === "complete"
                          ? "text-primary"
                          : item.status === "active"
                            ? "text-foreground"
                            : "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                    {item.status === "complete" ? (
                      <span className="text-primary text-[9px] font-bold tracking-widest uppercase">
                        Saved
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-border/60 flex flex-col justify-center gap-8 border-t p-8 sm:p-10 md:border-t-0 md:border-l md:px-8 lg:px-10">
              <div className="mx-auto grid w-full max-w-[280px] grid-cols-2 gap-x-6 gap-y-6 sm:max-w-none">
                {[
                  { value: "2,123", label: "Polling units mapped" },
                  { value: "143", label: "Wards covered" },
                  { value: "14", label: "LGAs active" },
                  { value: "5", label: "Mobile steps" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-primary text-2xl font-extrabold tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-muted-foreground mt-1 text-[9px] font-bold tracking-widest uppercase">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="group bg-primary text-primary-foreground hover:bg-primary/95 mx-auto h-12 w-full max-w-xs rounded-full text-xs font-black tracking-widest uppercase sm:w-auto sm:min-w-[240px]"
                asChild
              >
                <Link
                  href="/contact"
                  className="flex items-center justify-center"
                >
                  See Collect in Action
                  <HiArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
