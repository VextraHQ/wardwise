"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  HiChartBar,
  HiCheckCircle,
  HiDeviceMobile,
  HiExclamation,
  HiMail,
  HiClock,
  HiQuestionMarkCircle,
  HiUserGroup,
} from "react-icons/hi";
import { PublicSupportLayout } from "@/features/public-site/components/support/public-support-layout";
import { TurnstileWidget } from "@/features/public-site/components/support/turnstile-widget";
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
import { contactReasonOptions } from "@/lib/constants/contact-reasons";
import { COMPANY_INFO } from "@/lib/constants/legal-data";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/features/public-site/schemas/contact-schemas";
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

const reasonValues = contactReasonOptions.map((option) => option.value);

function isContactReason(value: string | null): value is ContactFormValues["reason"] {
  return value !== null && reasonValues.includes(value as ContactFormValues["reason"]);
}

const reasonDetailsByReason: Partial<
  Record<
    ContactFormValues["reason"],
    {
      label: string;
      placeholder: string;
      helper?: string;
    }
  >
> = {
  demo: {
    label: "Campaign context",
    placeholder: "For example: governorship race, field team size, or target state",
    helper:
      "A little campaign context helps us shape the walkthrough around the right use case.",
  },
  support: {
    label: "Where did this happen?",
    placeholder: "For example: dashboard, supporter form, submission sync, reporting page",
    helper: "This helps us route technical issues faster.",
  },
  partnership: {
    label: "Partnership type",
    placeholder: "For example: civic group, consultant network, field operations partner",
  },
  press: {
    label: "Deadline or outlet",
    placeholder: "For example: publication name, story angle, or response deadline",
  },
  other: {
    label: "What should we classify this as?",
    placeholder: "For example: procurement, training, civic partnership",
  },
};

const pageContentByReason: Record<
  ContactFormValues["reason"],
  {
    title: string;
    subtitle: string;
    formTitle: string;
    formDescription: string;
    submitLabel: string;
    cards: Array<{
      title: string;
      body: string;
      icon: React.ComponentType<{ className?: string }>;
      bullets?: string[];
    }>;
  }
> = {
  demo: {
    title: "See how WardWise fits your campaign",
    subtitle:
      "Tell us about your campaign, team, or rollout focus and we’ll shape the walkthrough around the field reality you care about most.",
    formTitle: "Request a demo",
    formDescription:
      "Share a bit of campaign context and we’ll reply with the best next step for a tailored walkthrough.",
    submitLabel: "Request Demo",
    cards: [
      {
        title: "What we’ll show",
        body: "A focused walkthrough of how WardWise works from field capture to campaign reporting.",
        icon: HiChartBar,
        bullets: [
          "How Collect captures supporters in the field",
          "How records stay tied to LGA, ward, and polling unit",
          "How campaign reporting turns field activity into decisions",
        ],
      },
      {
        title: "Best for",
        body: "Useful for campaigns that need more structure than notebooks, WhatsApp updates, or generic forms.",
        icon: HiUserGroup,
        bullets: [
          "Candidates",
          "Campaign managers",
          "Field directors and operations teams",
        ],
      },
      {
        title: "What happens next",
        body: "We review your request, reply from a real inbox, and tailor the next conversation around your race or rollout stage.",
        icon: HiDeviceMobile,
      },
    ],
  },
  general: {
    title: "Talk to the WardWise team",
    subtitle:
      "Use the contact form for demos, partnerships, support, or general questions. We’ll route it internally and reply from a real inbox.",
    formTitle: "Send a message",
    formDescription: "We’ll only use your email to reply to this request.",
    submitLabel: "Send Message",
    cards: [
      {
        title: "Direct email lines",
        body: "Handled by the WardWise team at Vextra Limited.",
        icon: HiMail,
      },
      {
        title: "Need answers first?",
        body: "Start from the support center if you want quick answers before opening a thread.",
        icon: HiQuestionMarkCircle,
      },
    ],
  },
  support: {
    title: "Get help from the WardWise team",
    subtitle:
      "Tell us what you were trying to do, what broke, and where it happened. We’ll route the issue to the right person and reply from a real inbox.",
    formTitle: "Open a support request",
    formDescription:
      "The more context you give us, the faster we can understand the issue.",
    submitLabel: "Send Support Request",
    cards: [
      {
        title: "Need help fast?",
        body: "If the answer may already exist, the support center is still the fastest place to start.",
        icon: HiQuestionMarkCircle,
      },
      {
        title: "Response window",
        body: "We typically reply within 24–48 business hours.",
        icon: HiClock,
      },
    ],
  },
  partnership: {
    title: "Talk to us about partnership opportunities",
    subtitle:
      "If you’re exploring partnerships around campaign operations, civic work, or field infrastructure, send the context here and we’ll route it properly.",
    formTitle: "Start a partnership conversation",
    formDescription:
      "A few details about your organization or angle will help us reply more meaningfully.",
    submitLabel: "Send Partnership Note",
    cards: [
      {
        title: "What helps most",
        body: "Tell us what kind of collaboration you have in mind and the outcome you’re aiming for.",
        icon: HiUserGroup,
      },
      {
        title: "Response window",
        body: "We typically reply within 24–48 business hours.",
        icon: HiClock,
      },
    ],
  },
  press: {
    title: "Reach WardWise for press or media",
    subtitle:
      "Send the outlet, angle, or deadline and we’ll route it to the right person for a direct reply.",
    formTitle: "Press inquiry",
    formDescription:
      "We’ll use your details only to respond to this media request.",
    submitLabel: "Send Press Inquiry",
    cards: [
      {
        title: "Best information to include",
        body: "Story angle, outlet name, deadline, and anything that helps us understand the request quickly.",
        icon: HiMail,
      },
      {
        title: "Response window",
        body: "We typically reply within 24–48 business hours.",
        icon: HiClock,
      },
    ],
  },
  other: {
    title: "Talk to the WardWise team",
    subtitle:
      "If your request doesn’t fit neatly into one category, send the context here and we’ll route it to the right person.",
    formTitle: "Send a message",
    formDescription: "We’ll only use your email to reply to this request.",
    submitLabel: "Send Message",
    cards: [
      {
        title: "Direct email lines",
        body: "Handled by the WardWise team at Vextra Limited.",
        icon: HiMail,
      },
      {
        title: "Need answers first?",
        body: "Start from the support center if you want quick answers before opening a thread.",
        icon: HiQuestionMarkCircle,
      },
    ],
  },
};

export function ContactContent({
  turnstileSiteKey,
}: {
  turnstileSiteKey: string | null;
}) {
  const searchParams = useSearchParams();
  const [formStatus, setFormStatus] = useState<FormStatus>({ kind: "idle" });
  const [turnstileResetNonce, setTurnstileResetNonce] = useState(0);
  const isTurnstileBypassedLocally =
    !turnstileSiteKey && process.env.NODE_ENV !== "production";
  const isFormTemporarilyUnavailable =
    !turnstileSiteKey && process.env.NODE_ENV === "production";
  const requestedReason = searchParams.get("reason");
  const initialReason = isContactReason(requestedReason)
    ? requestedReason
    : defaultValues.reason;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      ...defaultValues,
      reason: initialReason,
    },
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
  const activePageContent = useMemo(
    () => pageContentByReason[selectedReason],
    [selectedReason],
  );
  const reasonDetailsConfig = reasonDetailsByReason[selectedReason];

  useEffect(() => {
    if (isContactReason(requestedReason) && requestedReason !== selectedReason) {
      form.setValue("reason", requestedReason, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      });
    }
  }, [form, requestedReason, selectedReason]);

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

      form.reset({
        ...defaultValues,
        reason: initialReason,
      });
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
      title={activePageContent.title}
      subtitle={activePageContent.subtitle}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_320px]">
        <section className="border-border/60 bg-card relative overflow-hidden rounded-sm border shadow-none">
          <div className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 sm:px-6">
            <div>
              <p className="text-foreground text-sm font-semibold">
                {selectedReason === "demo" ? "Demo request" : "Contact form"}
              </p>
              <p className="text-muted-foreground text-xs">
                {selectedReason === "demo"
                  ? "Structured intake for campaign walkthroughs and platform evaluation."
                  : "Structured intake for support, demos, partnerships, and press."}
              </p>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            <div className="space-y-2">
              <h2 className="text-foreground text-lg font-bold tracking-tight">
                {activePageContent.formTitle}
              </h2>
              <p className="text-muted-foreground text-sm leading-6">
                {activePageContent.formDescription}
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

                {reasonDetailsConfig ? (
                  <FormField
                    control={form.control}
                    name="reasonDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{reasonDetailsConfig.label}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={reasonDetailsConfig.placeholder}
                            className="border-border/60 h-11 rounded-sm"
                            {...field}
                          />
                        </FormControl>
                        {reasonDetailsConfig.helper ? (
                          <p className="text-muted-foreground text-xs">
                            {reasonDetailsConfig.helper}
                          </p>
                        ) : null}
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
                    activePageContent.submitLabel
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </section>

        <aside className="space-y-4">
          {activePageContent.cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="border-border/60 bg-card rounded-sm border shadow-none"
              >
                <div className="border-border/60 bg-muted/20 border-b px-5 py-3">
                  <p className="text-foreground text-sm font-semibold">
                    {card.title}
                  </p>
                </div>
                <div className="space-y-4 px-5 py-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-sm">
                      <Icon className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm leading-6">
                        {card.body}
                      </p>
                    </div>
                  </div>

                  {card.bullets?.length ? (
                    <ul className="space-y-2 border-t pt-4">
                      {card.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="text-foreground/85 flex items-start gap-2 text-sm leading-6"
                        >
                          <HiCheckCircle className="text-primary mt-0.5 size-4 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {card.title === "Direct email lines" ? (
                    <a
                      href={`mailto:${COMPANY_INFO.supportEmail}`}
                      className="text-primary inline-block text-sm font-medium hover:underline"
                    >
                      {COMPANY_INFO.supportEmail}
                    </a>
                  ) : null}

                  {card.title === "Need answers first?" ||
                  card.title === "Need help fast?" ? (
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
                  ) : null}
                </div>
              </div>
            );
          })}
        </aside>
      </div>
    </PublicSupportLayout>
  );
}
