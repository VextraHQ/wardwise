import type { FormEvent } from "react";

const PHONE_INPUT_INVALID_CHARS_RE = /[^\d\s().+-]/g;

// Sanitize phone input characters to ensure only valid phone number characters are allowed.
export function sanitizePhoneInputChars(value: string): string {
  const stripped = value.replace(PHONE_INPUT_INVALID_CHARS_RE, "");
  const hasLeadingPlus = stripped.startsWith("+");
  const withoutExtraPluses = stripped.replace(/\+/g, "");

  return hasLeadingPlus ? `+${withoutExtraPluses}` : withoutExtraPluses;
}

// Sanitize phone input event to ensure only valid phone number characters are allowed.
export function sanitizePhoneInputEvent(event: FormEvent<HTMLInputElement>) {
  const sanitized = sanitizePhoneInputChars(event.currentTarget.value);
  if (sanitized !== event.currentTarget.value) {
    event.currentTarget.value = sanitized;
  }
}
