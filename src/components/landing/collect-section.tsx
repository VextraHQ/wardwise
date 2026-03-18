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

const collectFeatures = [
  {
    icon: HiClipboardList,
    title: "Multi-Step Registration",
    description:
      "Guided supporter registration with cascading LGA, Ward, and Polling Unit selection using real INEC data.",
  },
  {
    icon: HiUsers,
    title: "Canvasser Attribution",
    description:
      "Track which canvassers bring registrations via shareable links with embedded referral parameters.",
  },
  {
    icon: HiShieldCheck,
    title: "Verified Deduplication",
    description:
      "Phone number and Voter ID (VIN) cross-validation prevents duplicate registrations at the database level.",
  },
];

export function CollectSection() {
  return (
    <section
      id="collect"
      className="border-border/40 bg-muted relative border-y py-20 lg:py-28"
    >
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="relative mx-auto mb-16 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 flex flex-col items-center"
          >
            <div className="flex items-center gap-2">
              <span className="border-primary text-primary border-l-2 pl-4 font-mono text-[9px] font-black tracking-[0.4em] uppercase">
                Product Ecosystem
              </span>
              <span className="text-muted-foreground font-mono text-[8px] tracking-widest uppercase">
                MODULE_01: COLLECT
              </span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.1]"
          >
            Grassroots registration,{" "}
            <span className="text-primary font-serif font-normal italic">
              digitised.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed font-medium sm:text-lg"
          >
            While your Dashboard handles strategy, the attached WardWise Collect Module turns supporter registration into a verified, trackable pipeline. Share a link, scan a QR code — watch your command center populate in real-time.
          </motion.p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {collectFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="border-border/60 bg-background relative border p-8"
              >
                {/* Corner markers */}
                <div className="border-primary absolute -top-px -left-px size-3 border-t-2 border-l-2" />
                <div className="border-primary absolute -top-px -right-px size-3 border-t-2 border-r-2" />

                <div className="bg-primary/10 text-primary mb-5 flex h-10 w-10 items-center justify-center rounded-sm">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="text-foreground mb-2 text-sm font-bold tracking-widest uppercase">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Visual: Form Preview + Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="border-border/60 bg-background relative mx-auto mt-12 max-w-4xl border p-8 sm:p-12"
        >
          <div className="border-primary absolute -top-px -left-px size-3 border-t-2 border-l-2" />
          <div className="border-primary absolute -top-px -right-px size-3 border-t-2 border-r-2" />
          <div className="border-primary absolute -bottom-px -left-px size-3 border-b-2 border-l-2" />
          <div className="border-primary absolute -right-px -bottom-px size-3 border-r-2 border-b-2" />

          <div className="flex flex-col items-center gap-8 md:flex-row">
            {/* Left: Simulated form steps */}
            <div className="flex-1 space-y-4">
              <div className="text-muted-foreground/30 font-mono text-[8px] font-black tracking-widest">
                FORM_FLOW_PREVIEW
              </div>
              <div className="space-y-2">
                {[
                  { step: "01", label: "Personal Details", status: "complete" },
                  {
                    step: "02",
                    label: "Polling Unit Location",
                    status: "complete",
                  },
                  { step: "03", label: "Party Verification", status: "active" },
                  { step: "04", label: "Role Selection", status: "pending" },
                  {
                    step: "05",
                    label: "Canvasser Attribution",
                    status: "pending",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded font-mono text-[9px] font-black ${
                        item.status === "complete"
                          ? "bg-primary text-primary-foreground"
                          : item.status === "active"
                            ? "border-primary text-primary border-2"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.step}
                    </div>
                    <span
                      className={`text-xs font-bold tracking-widest uppercase ${
                        item.status === "complete"
                          ? "text-primary"
                          : item.status === "active"
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.status === "complete" && (
                      <span className="text-primary font-mono text-[8px] font-black tracking-widest">
                        VERIFIED
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Stats + CTA */}
            <div className="flex flex-col items-center gap-5 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-primary text-2xl font-extrabold">2,123</p>
                  <p className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                    Polling Units
                  </p>
                </div>
                <div>
                  <p className="text-primary text-2xl font-extrabold">143</p>
                  <p className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                    Wards Mapped
                  </p>
                </div>
                <div>
                  <p className="text-primary text-2xl font-extrabold">14</p>
                  <p className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                    LGAs Active
                  </p>
                </div>
                <div>
                  <p className="text-primary text-2xl font-extrabold">5</p>
                  <p className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                    Step Form
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="group bg-primary text-primary-foreground hover:bg-primary/95 h-12 rounded-full px-8 text-xs font-black tracking-widest uppercase transition-all"
                asChild
              >
                <Link href="/contact">
                  See Module in Action
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
