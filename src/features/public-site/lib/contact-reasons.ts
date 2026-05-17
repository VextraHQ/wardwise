export const contactReasonOptions = [
  { value: "demo", label: "Request a Demo" },
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "partnership", label: "Partnership Opportunities" },
  { value: "press", label: "Press & Media" },
  { value: "other", label: "Other / Something Else" },
] as const;

export const contactReasonValues = contactReasonOptions.map(
  (option) => option.value,
) as [
  (typeof contactReasonOptions)[number]["value"],
  ...(typeof contactReasonOptions)[number]["value"][],
];

export type ContactReason = (typeof contactReasonOptions)[number]["value"];

export function getContactReasonLabel(reason: ContactReason): string {
  return (
    contactReasonOptions.find((option) => option.value === reason)?.label ??
    "General Inquiry"
  );
}
