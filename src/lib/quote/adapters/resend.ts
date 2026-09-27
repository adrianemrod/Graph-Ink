import type { DeliveryAdapter } from "../types";
import { submissionHtml, submissionSubject, submissionText } from "../format";

/**
 * Resend (https://resend.com). Requires:
 *   RESEND_API_KEY, QUOTE_TO_EMAIL, QUOTE_FROM_EMAIL (a verified sender).
 */
export const resendAdapter: DeliveryAdapter = {
  name: "resend",
  async deliver(s) {
    const key = process.env.RESEND_API_KEY;
    const to = process.env.QUOTE_TO_EMAIL;
    const from = process.env.QUOTE_FROM_EMAIL;
    if (!key || !to || !from) throw new Error("Resend is not fully configured.");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: to.split(",").map((x) => x.trim()),
        reply_to: s.data.email,
        subject: submissionSubject(s),
        text: submissionText(s),
        html: submissionHtml(s),
        attachments: s.attachments.map((a) => ({ filename: a.filename, content: a.content.toString("base64") })),
      }),
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
  },
};
