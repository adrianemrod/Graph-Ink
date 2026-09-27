"use client";

/**
 * Tiny analytics facade. Events are forwarded to GA4 and/or Meta Pixel only
 * when those scripts were initialised (i.e. when their env IDs are set).
 */
export type AnalyticsEvent =
  | "quote_started"
  | "quote_step_completed"
  | "quote_submitted"
  | "contact_clicked"
  | "phone_clicked"
  | "facebook_clicked"
  | "service_viewed"
  | "portfolio_viewed";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const META_STANDARD: Partial<Record<AnalyticsEvent, string>> = {
  quote_submitted: "Lead",
  contact_clicked: "Contact",
  phone_clicked: "Contact",
};

export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params);
    if (window.fbq) {
      const std = META_STANDARD[event];
      if (std) window.fbq("track", std, params);
      else window.fbq("trackCustom", event, params);
    }
    if (process.env.NODE_ENV === "development") console.debug("[analytics]", event, params);
  } catch {
    /* analytics must never break the UI */
  }
}
