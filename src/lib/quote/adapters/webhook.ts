import type { DeliveryAdapter } from "../types";
import { submissionRows, submissionSubject } from "../format";

/**
 * Generic JSON webhook — works with Zapier, Make, n8n, a Supabase Edge
 * Function, or your own backend. Requires QUOTE_WEBHOOK_URL.
 * Optional QUOTE_WEBHOOK_SECRET is sent as the X-GraphInk-Secret header.
 * Attachments are sent as base64 — keep your receiver's body limit in mind.
 */
export const webhookAdapter: DeliveryAdapter = {
  name: "webhook",
  async deliver(s) {
    const url = process.env.QUOTE_WEBHOOK_URL;
    if (!url) throw new Error("QUOTE_WEBHOOK_URL is not set.");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.QUOTE_WEBHOOK_SECRET ? { "X-GraphInk-Secret": process.env.QUOTE_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({
        kind: s.kind,
        reference: s.reference,
        submittedAt: s.submittedAt,
        subject: submissionSubject(s),
        data: s.data,
        summary: Object.fromEntries(submissionRows(s)),
        attachments: s.attachments.map((a) => ({ filename: a.filename, contentType: a.contentType, size: a.size, base64: a.content.toString("base64") })),
      }),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  },
};
