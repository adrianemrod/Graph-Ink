import "server-only";
import type { DeliveryAdapter } from "../types";
import { logAdapter } from "./log";
import { resendAdapter } from "./resend";
import { webhookAdapter } from "./webhook";
import { formspreeAdapter } from "./formspree";

const registry: Record<string, DeliveryAdapter> = {
  log: logAdapter,
  resend: resendAdapter,
  webhook: webhookAdapter,
  formspree: formspreeAdapter,
};

/**
 * Picks the delivery provider from QUOTE_PROVIDER.
 * In production there is deliberately NO silent default: if nothing is
 * configured, submissions are rejected with a friendly message rather than
 * being lost.
 */
export function getDeliveryAdapter(): DeliveryAdapter | null {
  const name = (process.env.QUOTE_PROVIDER || "").trim().toLowerCase();
  if (name && registry[name]) return registry[name];
  if (process.env.NODE_ENV !== "production") return logAdapter;
  return null;
}
