"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HiMail, HiCheckCircle, HiExclamation } from "react-icons/hi";
import { LegalPageLayout } from "@/components/layout/legal-page-layout";
import { COMPANY_INFO } from "@/lib/data/legal-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  reason: z.string().min(1, "Please select a reason"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const contactReasons = [
  { value: "demo", label: "Request a Demo" },
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "partnership", label: "Partnership Opportunities" },
  { value: "press", label: "Press & Media" },
] as const;

type FormStatus = "idle" | "loading" | "success" | "error";

export function ContactContent() {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      reason: "demo",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setFormStatus("loading");

    // TODO(contact): Wire this to a server API route that reuses
    // `src/lib/email/send.ts` and records consistent contact/email delivery
    // events once the public contact flow ships.
    console.log("Form data:", data);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFormStatus("success");
    form.reset();
    setTimeout(() => setFormStatus("idle"), 5000);
  };

  return (
    <LegalPageLayout
      title="Contact Us"
      subtitle="We'd love to hear from you"
      systemCode="SUPPORT_CONT_001"
      icon={HiMail}
    >
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Contact Form */}
        <div className="lg:col-span-3">
          {formStatus === "success" && (
            <div className="border-primary/30 bg-primary/10 mb-6 flex items-center gap-3 rounded-sm border p-4">
              <HiCheckCircle className="text-primary size-5 shrink-0" />
              <div>
                <p className="text-foreground font-semibold">
                  Message Sent Successfully!
                </p>
                <p className="text-muted-foreground text-sm">
                  We&apos;ll get back to you within 24-48 hours.
                </p>
              </div>
            </div>
          )}

          {formStatus === "error" && (
            <div className="border-destructive/30 bg-destructive/10 mb-6 flex items-center gap-3 rounded-sm border p-4">
              <HiExclamation className="text-destructive size-5 shrink-0" />
              <div>
                <p className="text-foreground font-semibold">
                  Something went wrong
                </p>
                <p className="text-muted-foreground text-sm">
                  Please try again or email us directly.
                </p>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        autoComplete="name"
                        className="border-border/60 h-11 rounded-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="border-border/60 h-11 rounded-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Contact</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-border/60 h-11 w-full rounded-sm">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contactReasons.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us how we can help..."
                        rows={5}
                        className="border-border/60 resize-none rounded-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                disabled={formStatus === "loading" || formStatus === "success"}
                className="w-full rounded-sm font-mono text-[11px] tracking-widest uppercase"
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
          </Form>
        </div>

        {/* Contact Information Sidebar */}
        <div className="space-y-4 lg:col-span-2">
          <h3 className="text-foreground font-semibold">Quick Contact</h3>

          <div className="border-border/60 bg-muted/30 relative space-y-3 overflow-hidden rounded-sm border p-4 shadow-none">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-sm">
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
          </div>

          <div className="border-primary/30 bg-primary/5 relative overflow-hidden rounded-sm border p-4 shadow-none">
            <h4 className="text-foreground mb-2 font-semibold">
              Response Time
            </h4>
            <p className="text-muted-foreground text-sm">
              We typically respond within <strong>24-48 business hours</strong>.
            </p>
          </div>
        </div>
      </div>
    </LegalPageLayout>
  );
}
