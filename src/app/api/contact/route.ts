import { NextResponse } from "next/server";
import { makeReference } from "@/lib/quote/schema";
import { getDeliveryAdapter } from "@/lib/quote/adapters";
import { clientKey, rateLimit } from "@/lib/quote/guard";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientKey(req.headers)}`)) {
    return NextResponse.json({ ok: false, error: "Too many messages. Please try again later." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }
  if (typeof body.company_website === "string" && body.company_website) return NextResponse.json({ ok: true, reference: makeReference() });

  const s = (k: string, max: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");
  const data = { name: s("name", 120), email: s("email", 200), mobile: s("mobile", 40), company: s("company", 160), topic: s("topic", 80), message: s("message", 3000) };

  const fields: Record<string, string> = {};
  if (data.name.length < 2) fields.name = "Enter your name.";
  if (!EMAIL.test(data.email)) fields.email = "Enter a valid email address.";
  if (data.message.length < 10) fields.message = "Tell us a little more (at least 10 characters).";
  if (Object.keys(fields).length) return NextResponse.json({ ok: false, error: "Some details need attention.", fields }, { status: 422 });

  const adapter = getDeliveryAdapter();
  if (!adapter) return NextResponse.json({ ok: false, error: "Online messages aren't connected yet. Please use the contact options on this page." }, { status: 503 });

  const reference = makeReference();
  try {
    await adapter.deliver({ kind: "contact", reference, submittedAt: new Date().toISOString(), data, attachments: [] });
  } catch (err) {
    console.error("[contact] delivery failed", err);
    return NextResponse.json({ ok: false, error: "We couldn't send your message just now. Please try again shortly." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, reference });
}
