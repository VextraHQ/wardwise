"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  HiMail,
  HiLocationMarker,
  HiGlobeAlt,
  HiCheckCircle,
  HiExclamation,
} from "react-icons/hi";
import { LegalPageLayout } from "@/components/layout/legal-page-layout";
import { COMPANY_INFO } from "@/lib/data/legal-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type FormStatus = "idle" | "loading" | "success" | "error";

const contactReasons = [
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "account", label: "Account Issues" },
  { value: "partnership", label: "Partnership Opportunities" },
  { value: "press", label: "Press & Media" },
  { value: "legal", label: "Legal Inquiry" },
] as const;

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "general",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("loading");

    // TODO: Implement actual form submission
    // This is a placeholder that simulates submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate success
    setFormStatus("success");
    setFormData({ name: "", email: "", reason: "general", message: "" });

    // Reset after 5 seconds
    setTimeout(() => setFormStatus("idle"), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <LegalPageLayout
      title="Contact Us"
      subtitle="We'd love to hear from you"
      systemCode="SUPPORT_CONT_001"
      icon={HiMail}
      variant="orange"
      activePage="/contact"
    >
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Contact Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {formStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4"
              >
                <HiCheckCircle className="size-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-foreground font-semibold">
                    Message Sent Successfully!
                  </p>
                  <p className="text-muted-foreground text-sm">
                    We&apos;ll get back to you within 24-48 hours.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {formStatus === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4"
              >
                <HiExclamation className="size-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-foreground font-semibold">
                    Something went wrong
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Please try again or email us directly.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-11"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11"
              />
            </div>

            {/* Reason Select */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Contact</Label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className={cn(
                  "border-input bg-background text-foreground placeholder:text-muted-foreground",
                  "focus-visible:ring-ring flex h-11 w-full rounded-md border px-3 py-2 text-sm",
                  "focus-visible:ring-2 focus-visible:outline-none",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {contactReasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us how we can help..."
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={formStatus === "loading" || formStatus === "success"}
              className="bg-primary hover:bg-primary/90 w-full"
            >
              {formStatus === "loading" ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending...
                </span>
              ) : formStatus === "success" ? (
                <span className="flex items-center gap-2">
                  <HiCheckCircle className="size-4" />
                  Sent!
                </span>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
        </div>

        {/* Contact Information Sidebar */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Contact Cards */}
          <div className="space-y-4">
            <h3 className="text-foreground font-semibold">Quick Contact</h3>

            {/* Email Cards */}
            <div className="border-border bg-muted/30 rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                  <HiMail className="size-4" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    General Inquiries
                  </p>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="text-primary text-sm hover:underline"
                  >
                    {COMPANY_INFO.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
                  <HiMail className="size-4" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    Technical Support
                  </p>
                  <a
                    href={`mailto:${COMPANY_INFO.supportEmail}`}
                    className="text-sm text-orange-600 hover:underline"
                  >
                    {COMPANY_INFO.supportEmail}
                  </a>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="border-border bg-muted/30 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <HiLocationMarker className="size-4" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    Headquarters
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {COMPANY_INFO.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Website Card */}
            <div className="border-border bg-muted/30 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                  <HiGlobeAlt className="size-4" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    Website
                  </p>
                  <a
                    href={COMPANY_INFO.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    {COMPANY_INFO.website.replace("https://", "")}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Response Time Box */}
          <div className="border-primary/30 bg-primary/5 rounded-lg border p-4">
            <h4 className="text-foreground mb-2 font-semibold">
              Response Time
            </h4>
            <p className="text-muted-foreground text-sm">
              We typically respond within <strong>24-48 business hours</strong>.
              For urgent matters, please include &quot;URGENT&quot; in your
              message subject.
            </p>
          </div>
        </div>
      </div>
    </LegalPageLayout>
  );
}
