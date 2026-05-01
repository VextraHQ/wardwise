"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  HiCheckCircle,
  HiExclamation,
  HiMail,
  HiClock,
  HiQuestionMarkCircle,
} from "react-icons/hi";
import { PublicSupportLayout } from "@/components/layout/public-support-layout";
import { TurnstileWidget } from "@/components/public/turnstile-widget";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contactReasonOptions } from "@/lib/contact/reasons";
import { COMPANY_INFO } from "@/lib/data/legal-data";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/schemas/contact-schemas";
import { toast } from "sonner";

type FormStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

const messagePlaceholders = {
  demo: "Tell us about your team, timeline, and what you want to evaluate in WardWise.",
  general: "Tell us what you need and we’ll route it to the right person.",
  support:
    "Tell us what broke, what page or workflow you were on, and what you expected to happen.",
  partnership:
    "Tell us what kind of partnership you have in mind and what outcome you're aiming for.",
  press:
    "Tell us the story angle, deadline, and the best way for us to respond.",
  other:
    "Tell us what this request is about and any context that will help us route it properly.",
} satisfies Record<ContactFormValues["reason"], string>;

const defaultValues: ContactFormValues = {
  name: "",
  email: "",
  reason: "demo",
  reasonDetails: "",
  message: "",
  website: "",
  turnstileToken: "",
};

function getContactErrorMessage(status: number, fallback?: string) {
  if (fallback) {
    return fallback;
  }

  if (status === 429) {
    return "Too many attempts right now. Please wait a little and try again.";
  }

  if (status === 400) {
    return "Please review your details and try again.";
  }

  return "We couldn't send your message right now. Please use the email option below if this keeps happening.";
}

export function ContactContent({
  turnstileSiteKey,
}: {
  turnstileSiteKey: string | null;
}) {
  const [formStatus, setFormStatus] = useState<FormStatus>({ kind: "idle" });
  const [turnstileResetNonce, setTurnstileResetNonce] = useState(0);
  const isTurnstileBypassedLocally =
    !turnstileSiteKey && process.env.NODE_ENV !== "production";
  const isFormTemporarilyUnavailable =
    !turnstileSiteKey && process.env.NODE_ENV === "production";

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  });

  const messageLength =
    useWatch({
      control: form.control,
      name: "message",
    })?.length ?? 0;
  const selectedReason = useWatch({
    control: form.control,
    name: "reason",
  });

  const handleTurnstileTokenChange = (token: string) => {
    form.setValue("turnstileToken", token, { shouldValidate: true });
  };

  const onSubmit = async (data: ContactFormValues) => {
    if (formStatus.kind === "loading") {
      return;
    }

    if (isFormTemporarilyUnavailable) {
      setFormStatus({
        kind: "error",
        message:
          "Contact form verification is temporarily unavailable. Please email us directly below.",
      });
      return;
    }

    if (!isTurnstileBypassedLocally && !data.turnstileToken) {
      setFormStatus({
        kind: "error",
        message: "Please complete the verification step and try again.",
      });
      return;
    }

    setFormStatus({ kind: "loading" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;

      if (!response.ok) {
        const message = getContactErrorMessage(response.status, payload?.error);
        setFormStatus({
          kind: "error",
          message,
        });
        toast.error("Could not send message", {
          description: message,
        });
        setTurnstileResetNonce((current) => current + 1);
        return;
      }

      form.reset(defaultValues);
      setTurnstileResetNonce((current) => current + 1);
      setFormStatus({
        kind: "success",
        message:
          "Your message is in. We'll review it and reply within 24–48 business hours.",
      });
      toast.success("Message sent", {
        description: "We'll reply within 24–48 business hours.",
      });
    } catch {
      const message =
        "We couldn't send your message right now. Please use the email option below if this keeps happening.";
      setFormStatus({
        kind: "error",
        message,
      });
      toast.error("Could not send message", {
        description: message,
      });
      setTurnstileResetNonce((current) => current + 1);
    }
  };

  return (
    <PublicSupportLayout
      eyebrow="Public Contact"
      title="Talk to the WardWise team"
      subtitle="Use the contact form for demos, partnerships, support, or press. We'll route it internally and reply from a real inbox."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_320px]">
        <section className="border-border/60 bg-card relative overflow-hidden border shadow-none">
          <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
          <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

          <div className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 sm:px-6">
            <div>
              <p className="text-foreground text-sm font-semibold">
                Contact form
              </p>
              <p className="text-muted-foreground text-xs">
                Structured intake for support, demos, partnerships, and press.
              </p>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            <div className="space-y-2">
              <h2 className="text-foreground text-lg font-bold tracking-tight">
                Send a message
              </h2>
              <p className="text-muted-foreground text-sm leading-6">
                We&apos;ll only use your email to reply to this request.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute top-auto left-[-10000px] h-px w-px opacity-0"
                  {...form.register("website")}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="name"
                            placeholder="Enter your name"
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
                </div>

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
                          {contactReasonOptions.map((reason) => (
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

                {selectedReason === "other" ? (
                  <FormField
                    control={form.control}
                    name="reasonDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What should we classify this as?</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="For example: procurement, training, civic partnership"
                            className="border-border/60 h-11 rounded-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-3">
                        <FormLabel>Message</FormLabel>
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {messageLength}/4000
                        </span>
                      </div>
                      <FormControl>
                        <Textarea
                          rows={8}
                          placeholder={messagePlaceholders[selectedReason]}
                          className="border-border/60 placeholder:text-foreground/70 min-h-[150px] resize-y rounded-sm placeholder:opacity-80"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      {!fieldState.error && selectedReason !== "other" ? (
                        <p className="text-muted-foreground text-xs">
                          If the reason above doesn&apos;t fit perfectly,
                          explain the angle here and we&apos;ll route it
                          properly.
                        </p>
                      ) : null}
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  {turnstileSiteKey ? (
                    <div className="w-fit max-w-full">
                      <TurnstileWidget
                        siteKey={turnstileSiteKey}
                        resetNonce={turnstileResetNonce}
                        onTokenChange={handleTurnstileTokenChange}
                      />
                    </div>
                  ) : isFormTemporarilyUnavailable ? (
                    <div className="border-destructive/20 bg-destructive/5 text-muted-foreground rounded-sm border px-4 py-3 text-xs leading-6">
                      Verification is temporarily unavailable right now. Please
                      use the direct email option instead.
                    </div>
                  ) : null}

                  {formStatus.kind === "success" ? (
                    <div
                      role="status"
                      aria-live="polite"
                      className="border-primary/30 bg-primary/10 flex items-start gap-3 rounded-sm border p-4"
                    >
                      <HiCheckCircle className="text-primary mt-0.5 size-5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-foreground text-sm font-semibold">
                          Message sent successfully
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {formStatus.message}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {formStatus.kind === "error" ? (
                    <div
                      role="alert"
                      className="border-destructive/30 bg-destructive/10 flex items-start gap-3 rounded-sm border p-4"
                    >
                      <HiExclamation className="text-destructive mt-0.5 size-5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-foreground text-sm font-semibold">
                          We couldn&apos;t send that yet
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {formStatus.message}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    formStatus.kind === "loading" ||
                    isFormTemporarilyUnavailable
                  }
                  className="w-full rounded-sm font-mono text-[11px] tracking-widest uppercase"
                >
                  {formStatus.kind === "loading" ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="border-border/60 bg-card rounded-sm border shadow-none">
            <div className="border-border/60 bg-muted/20 border-b px-5 py-3">
              <p className="text-foreground text-sm font-semibold">
                Direct email lines
              </p>
            </div>
            <div className="divide-border/60 divide-y">
              <div className="flex items-start gap-3 px-5 py-4">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-sm">
                  <HiMail className="size-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-foreground text-sm font-semibold">
                    General inquiries
                  </p>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    {COMPANY_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 px-5 py-4">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-sm">
                  <HiClock className="size-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-foreground text-sm font-semibold">
                    Response window
                  </p>
                  <p className="text-muted-foreground text-sm">
                    We typically reply within 24–48 business hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-primary/30 bg-primary/5 rounded-sm border shadow-none">
            <div className="border-primary/20 border-b px-5 py-3">
              <p className="text-foreground text-sm font-semibold">
                Need answers first?
              </p>
            </div>
            <div className="space-y-4 px-5 py-5">
              <p className="text-muted-foreground text-sm leading-6">
                Start from the support center if you want quick answers before
                opening a thread.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10 w-full rounded-sm font-mono text-[11px] tracking-widest uppercase"
              >
                <Link href="/support" className="gap-2">
                  <HiQuestionMarkCircle className="size-4" />
                  View Support Center
                </Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </PublicSupportLayout>
  );
}
