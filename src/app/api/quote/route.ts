import { NextResponse } from "next/server";
import { coerceQuote, makeReference, validateFiles, validateQuote } from "@/lib/quote/schema";
import { getDeliveryAdapter } from "@/lib/quote/adapters";
import { clientKey, rateLimit, recall, remember } from "@/lib/quote/guard";
import type { Attachment } from "@/lib/quote/types";
import { products } from "@/content/services";

export const runtime = "nodejs";

function fail(status: number, error: string, fields?: Record<string, string>) {
  return NextResponse.json({ ok: false, error, fields }, { status });
}

export async function POST(req: Request) {
  const ip = clientKey(req.headers);
  if (!rateLimit(`quote:${ip}`)) return fail(429, "Too many requests. Please wait a few minutes and try again.");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "We couldn't read your request. If you attached large files, try sharing them with a cloud link instead.");
  }

  // Honeypot: real visitors never fill this hidden field.
  if (String(form.get("company_website") ?? "").length > 0) {
    return NextResponse.json({ ok: true, reference: makeReference() });
  }

  const idem = String(form.get("idempotencyKey") ?? "").slice(0, 80);
  if (idem) {
    const prior = recall(idem);
    if (prior) return NextResponse.json({ ok: true, reference: prior, duplicate: true });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("payload") ?? "{}"));
  } catch {
    return fail(400, "Malformed request.");
  }
  const data = coerceQuote(raw);
  const errors = validateQuote(data);
  if (Object.keys(errors).length) return fail(422, "Some details need attention.", errors as Record<string, string>);

  const files = form.getAll("files").filter((f): f is File => typeof f === "object" && f !== null && "arrayBuffer" in f);
  const fileError = validateFiles(files);
  if (fileError) return fail(422, fileError, { files: fileError });

  const adapter = getDeliveryAdapter();
  if (!adapter) {
    return fail(503, "Online quote requests aren't connected yet. Please reach us through the contact options on this page.");
  }

  const attachments: Attachment[] = await Promise.all(
    files.map(async (f) => ({
      filename: f.name.replace(/[^\w.\- ()]/g, "_").slice(0, 140),
      contentType: f.type || "application/octet-stream",
      size: f.size,
      content: Buffer.from(await f.arrayBuffer()),
    })),
  );

  const reference = makeReference();
  const productLabel = products.find((p) => p.id === data.product)?.name ?? (data.product === "other" ? "Other" : data.product);

  try {
    await adapter.deliver({ kind: "quote", reference, submittedAt: new Date().toISOString(), data, productLabel, attachments });
  } catch (err) {
    console.error(`[quote] delivery via ${adapter.name} failed`, err);
    return fail(502, "We couldn't send your request just now. Please try again in a moment, or contact us directly.");
  }

  if (idem) remember(idem, reference);
  return NextResponse.json({ ok: true, reference });
}
