import type { Submission } from "./types";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function submissionRows(s: Submission): [string, string][] {
  if (s.kind === "contact") {
    const d = s.data;
    return [
      ["Name", d.name], ["Email", d.email], ["Mobile", d.mobile], ["Company", d.company], ["Topic", d.topic], ["Message", d.message],
    ];
  }
  const d = s.data;
  return [
    ["Product", d.product === "other" ? `Other — ${d.productOther}` : s.productLabel],
    ["Quantity", d.quantity],
    ["Finished size", d.size || "Not specified"],
    ["Printing", d.sides],
    ["Color", d.color],
    ["Paper / material", [d.paper, d.paperNotes].filter(Boolean).join(" — ")],
    ["Finishing", [d.finishing.join(", "), d.finishingNotes].filter(Boolean).join(" — ")],
    ["Deadline", d.deadlineType === "date" ? d.deadlineDate : d.deadlineType === "asap" ? "As soon as possible" : "Flexible"],
    ["Delivery", d.delivery || "Not specified"],
    ["Artwork", d.artwork || "Not specified"],
    ["File link", d.fileLink || "—"],
    ["Attachments", s.attachments.map((a) => a.filename).join(", ") || "—"],
    ["Name", d.name],
    ["Company", d.company || "—"],
    ["Email", d.email],
    ["Mobile", d.mobile || "—"],
    ["Message", d.message || "—"],
  ];
}

export function submissionSubject(s: Submission) {
  return s.kind === "quote"
    ? `Quote request ${s.reference} — ${s.productLabel} (${s.data.quantity})`
    : `Message ${s.reference} — ${s.data.topic || "General enquiry"}`;
}

export function submissionText(s: Submission) {
  return [`${submissionSubject(s)}`, `Received: ${s.submittedAt}`, "", ...submissionRows(s).map(([k, v]) => `${k}: ${v}`)].join("\n");
}

export function submissionHtml(s: Submission) {
  const rows = submissionRows(s)
    .map(([k, v]) => `<tr><td style="padding:8px 12px;color:#6b6b66;font:12px monospace;text-transform:uppercase;vertical-align:top">${esc(k)}</td><td style="padding:8px 12px;font:14px/1.5 sans-serif;color:#111;white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join("");
  return `<div style="max-width:640px"><div style="height:4px;background:linear-gradient(90deg,#0898D8,#582888,#E80888,#E87818,#F8E808,#089848)"></div><h2 style="font:600 20px sans-serif;margin:20px 12px 4px">${esc(submissionSubject(s))}</h2><p style="font:12px monospace;color:#6b6b66;margin:0 12px 16px">${esc(s.submittedAt)}</p><table style="border-collapse:collapse;width:100%">${rows}</table></div>`;
}
