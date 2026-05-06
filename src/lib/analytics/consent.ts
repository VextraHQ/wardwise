export const CONSENT_COOKIE_NAME = "wardwise_cookie_consent_v1";
const LEGACY_CONSENT_KEY = "wardwise-cookie-consent";
const CONSENT_EVENT_NAME = "cookie-consent-change";
const OPEN_COOKIE_SETTINGS_EVENT_NAME = "cookie-settings-open";
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 6 months

export type ConsentValue = "accepted" | "declined" | null;

function normalizeConsentValue(value: string | null | undefined): ConsentValue {
  if (value === "accepted" || value === "declined") {
    return value;
  }

  return null;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean);

  for (const cookie of cookies) {
    if (cookie.startsWith(`${name}=`)) {
      return decodeURIComponent(cookie.slice(name.length + 1));
    }
  }

  return null;
}

function writeConsentCookie(value: Exclude<ConsentValue, null>) {
  if (typeof document === "undefined") return;

  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; samesite=lax`;
}

function removeLegacyConsent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LEGACY_CONSENT_KEY);
}

function dispatchConsentChange(value: ConsentValue) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ConsentValue>(CONSENT_EVENT_NAME, { detail: value }),
  );
}

export function getConsentValue(): ConsentValue {
  if (typeof window === "undefined") return null;

  const cookieValue = normalizeConsentValue(readCookie(CONSENT_COOKIE_NAME));
  if (cookieValue) return cookieValue;

  const legacyValue = normalizeConsentValue(
    window.localStorage.getItem(LEGACY_CONSENT_KEY),
  );

  if (legacyValue) {
    writeConsentCookie(legacyValue);
    removeLegacyConsent();
    return legacyValue;
  }

  return null;
}

export function hasAnalyticsConsent(): boolean {
  return getConsentValue() === "accepted";
}

export function setConsentValue(value: Exclude<ConsentValue, null>) {
  if (typeof window === "undefined") return;

  writeConsentCookie(value);
  removeLegacyConsent();
  dispatchConsentChange(value);
}

export function subscribeToConsentChanges(
  listener: (value: ConsentValue) => void,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = (event: Event) => {
    const detail = (event as CustomEvent<ConsentValue>).detail;
    listener(normalizeConsentValue(detail));
  };

  window.addEventListener(CONSENT_EVENT_NAME, handleChange);

  return () => {
    window.removeEventListener(CONSENT_EVENT_NAME, handleChange);
  };
}

export function openCookieSettings() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT_NAME));
}

export function subscribeToCookieSettingsOpens(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT_NAME, listener);

  return () => {
    window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT_NAME, listener);
  };
}
