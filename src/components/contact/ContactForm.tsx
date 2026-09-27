"use client";

import { useRef, useState } from "react";
import { TextField, ChoiceGroup } from "@/components/quote/fields";
import { Button } from "@/components/ui/Button";
import { Check } from "@/components/ui/Icons";

type Data = { name: string; email: string; mobile: string; company: string; topic: string; message: string };
const empty: Data = { name: "", email: "", mobile: "", company: "", topic: "General question", message: "" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactForm() {
  const [data, setData] = useState<Data>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Data, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (k: keyof Data) => (v: string) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    const errs: typeof errors = {};
    if (data.name.trim().length < 2) errs.name = "Enter your name.";
    if (!EMAIL.test(data.email.trim())) errs.email = "Enter a valid email address.";
    if (data.message.trim().length < 10) errs.message = "Tell us a little more (at least 10 characters).";
    if (Object.keys(errs).length) {
      setErrors(errs);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`#c-${Object.keys(errs)[0]}`)?.focus());
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, company_website: honeypot.current?.value ?? "" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.fields) setErrors(json.fields);
        setMessage(json.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setReference(json.reference);
      setStatus("sent");
    } catch {
      setMessage("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="bg-paper p-8 md:p-10">
        <span className="flex size-12 items-center justify-center bg-ink text-paper"><Check size={22} /></span>
        <h2 className="mt-6 text-title font-semibold uppercase">Message received.</h2>
        <p className="mt-3 text-smoke">Thanks, {data.name.split(" ")[0]}. We&apos;ll get back to you at {data.email}.</p>
        <p className="spec mt-6 text-mute">Reference {reference}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative space-y-6 bg-paper p-6 md:p-10">
      <input ref={honeypot} type="text" name="company_website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden />
      <ChoiceGroup
        name="c-topic"
        legend="What's this about?"
        columns="sm:grid-cols-3"
        value={data.topic}
        onChange={set("topic")}
        options={["General question", "Existing request", "Partnership"].map((v) => ({ value: v, label: v }))}
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField id="c-name" label="Name" value={data.name} onChange={set("name")} error={errors.name} autoComplete="name" maxLength={120} />
        <TextField id="c-company" label="Company" optional value={data.company} onChange={set("company")} autoComplete="organization" maxLength={160} />
        <TextField id="c-email" label="Email" type="email" value={data.email} onChange={set("email")} error={errors.email} autoComplete="email" maxLength={200} />
        <TextField id="c-mobile" label="Mobile" optional type="tel" value={data.mobile} onChange={set("mobile")} autoComplete="tel" maxLength={40} />
      </div>
      <TextField id="c-message" label="Message" multiline value={data.message} onChange={set("message")} error={errors.message} maxLength={3000} />
      {status === "error" && (
        <p role="alert" className="border-l-4 border-gi-magenta bg-paper-soft p-4 text-sm font-semibold">{message}</p>
      )}
      <div className="flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-xs text-mute">Printing something specific? The <a href="/quote" className="underline">quote builder</a> gets you a faster, more accurate answer.</p>
        <Button type="submit" arrow disabled={status === "sending"} aria-busy={status === "sending"}>{status === "sending" ? "Sending…" : "Send message"}</Button>
      </div>
    </form>
  );
}
