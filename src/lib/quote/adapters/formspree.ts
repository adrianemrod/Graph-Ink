import type { DeliveryAdapter } from "../types";
import { submissionRows, submissionSubject } from "../format";

/**
 * Formspree (https://formspree.io). Requires FORMSPREE_FORM_ID.
 * File attachments are not forwarded by this adapter — the file names and any
 * cloud link are included instead. Use Resend or a webhook for attachments.
 */
export const formspreeAdapter: DeliveryAdapter = {
  name: "formspree",
  async deliver(s) {
    const id = process.env.FORMSPREE_FORM_ID;
    if (!id) throw new Error("FORMSPREE_FORM_ID is not set.");
    const res = await fetch(`https://formspree.io/f/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: submissionSubject(s), email: s.data.email, reference: s.reference, ...Object.fromEntries(submissionRows(s)) }),
    });
    if (!res.ok) throw new Error(`Formspree responded ${res.status}`);
  },
};
