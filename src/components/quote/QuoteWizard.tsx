"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { BrandLogo } from "@/lib/brand";
import { emptyQuote, quoteStepFields, validateQuote, type QuoteErrors, type QuoteRequest } from "@/lib/quote/schema";
import {
  artworkOptions, colorOptions, deadlineOptions, deliveryOptions, finishingOptions, paperOptions, quoteProductOptions, sidesOptions,
} from "@/content/quote";
import { PrintArtwork } from "@/components/print/PrintArtwork";
import { contactLinks } from "@/config/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { CheckGroup, ChoiceGroup, Chips, StepHeader, TextField, FieldError } from "./fields";
import { FileUpload } from "./FileUpload";
import { QuoteSuccess } from "./QuoteSuccess";

const STEPS = [
  { key: "product", label: "What you need", color: "#0898D8" },
  { key: "details", label: "Project details", color: "#085888" },
  { key: "paper", label: "Paper / material", color: "#582888" },
  { key: "finishing", label: "Finishing", color: "#E80888" },
  { key: "deadline", label: "Deadline", color: "#E87818" },
  { key: "files", label: "Files", color: "#F8E808" },
  { key: "contact", label: "Contact", color: "#089848" },
  { key: "summary", label: "Summary", color: "#111111" },
] as const;

const DRAFT_KEY = "gi-quote-draft-v1";
const EASE = [0.2, 0.8, 0.2, 1] as const;

type State = { data: QuoteRequest; step: number; errors: QuoteErrors };
type Action =
  | { type: "set"; key: keyof QuoteRequest; value: QuoteRequest[keyof QuoteRequest] }
  | { type: "toggleFinishing"; value: string }
  | { type: "step"; step: number }
  | { type: "errors"; errors: QuoteErrors }
  | { type: "load"; data: Partial<QuoteRequest>; step?: number }
  | { type: "reset" };

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case "set": {
      const errors = { ...state.errors };
      delete errors[a.key];
      return { ...state, data: { ...state.data, [a.key]: a.value }, errors };
    }
    case "toggleFinishing": {
      const cur = state.data.finishing;
      let next: string[];
      if (a.value === "None") next = cur.includes("None") ? [] : ["None"];
      else next = cur.includes(a.value) ? cur.filter((x) => x !== a.value) : [...cur.filter((x) => x !== "None"), a.value];
      const errors = { ...state.errors };
      delete errors.finishing;
      return { ...state, data: { ...state.data, finishing: next }, errors };
    }
    case "step":
      return { ...state, step: a.step, errors: {} };
    case "errors":
      return { ...state, errors: a.errors };
    case "load":
      return { ...state, data: { ...state.data, ...a.data }, step: a.step ?? state.step };
    case "reset":
      return { data: emptyQuote, step: 0, errors: {} };
  }
}

const sizeHints: Record<string, string[]> = {
  "business-cards": ["Standard business card", "Square", "Custom"],
  flyers: ["A4", "A5", "A6", "Letter", "Custom"],
  brochures: ["A4 tri-fold", "A4 bi-fold", "Letter tri-fold", "Custom"],
  posters: ["A3", "A2", "A1", "Custom"],
  menus: ["A4", "A3 folded", "Legal", "Custom"],
  default: ["A4", "A5", "Letter", "Custom", "Not sure"],
};

function newKey() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function QuoteWizard({ initialProduct, logo }: { initialProduct?: string; logo: BrandLogo }) {
  const [state, dispatch] = useReducer(reducer, { data: emptyQuote, step: 0, errors: {} });
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const loaded = useRef(false);
  const idemKey = useRef<string>("");
  const panelRef = useRef<HTMLDivElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();
  const { data, step, errors } = state;
  const total = STEPS.length;

  // Restore draft (files can't be persisted) and apply ?product=
  useEffect(() => {
    let draft: Partial<QuoteRequest> = {};
    let draftStep = 0;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { data: Partial<QuoteRequest>; step: number; key: string };
        draft = parsed.data ?? {};
        draftStep = Math.min(parsed.step ?? 0, total - 2);
        idemKey.current = parsed.key || "";
      }
    } catch {
      /* storage unavailable */
    }
    if (!idemKey.current) idemKey.current = newKey();
    const valid = initialProduct && quoteProductOptions.some((o) => o.id === initialProduct);
    if (valid && draft.product !== initialProduct) {
      draft = { ...draft, product: initialProduct };
    }
    dispatch({ type: "load", data: draft, step: draftStep });
    loaded.current = true;
    track("quote_started", { source: "quote_page", product: initialProduct ?? "" });
  }, [initialProduct, total]);

  useEffect(() => {
    if (!loaded.current || reference) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ data, step, key: idemKey.current }));
    } catch {
      /* ignore */
    }
  }, [data, step, reference]);

  const focusTitle = useCallback(() => {
    requestAnimationFrame(() => {
      const el = panelRef.current?.querySelector<HTMLElement>("[data-step-title]");
      el?.focus({ preventScroll: true });
      const top = (panelRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 110;
      if (window.scrollY > top) window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    });
  }, [reduce]);

  function goTo(i: number) {
    setDirection(i > step ? 1 : -1);
    dispatch({ type: "step", step: i });
    setSubmitError(null);
    focusTitle();
  }

  function focusFirstError(errs: QuoteErrors) {
    requestAnimationFrame(() => {
      const first = Object.keys(errs)[0];
      const el = panelRef.current?.querySelector<HTMLElement>(`#q-${first}, [name="q-${first}"]`);
      el?.focus();
    });
  }

  function next() {
    if (step < total - 1) {
      const errs = validateQuote(data, quoteStepFields[step]);
      if (Object.keys(errs).length) {
        dispatch({ type: "errors", errors: errs });
        focusFirstError(errs);
        return;
      }
      track("quote_step_completed", { step: step + 1, name: STEPS[step].key });
      goTo(step + 1);
    }
  }

  async function submit() {
    if (submitting) return;
    const errs = validateQuote(data);
    if (Object.keys(errs).length) {
      const firstStep = quoteStepFields.findIndex((fs) => fs.some((f) => errs[f]));
      goTo(firstStep >= 0 ? firstStep : 0);
      dispatch({ type: "errors", errors: errs });
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      fd.set("payload", JSON.stringify(data));
      fd.set("idempotencyKey", idemKey.current);
      fd.set("company_website", honeypot.current?.value ?? "");
      files.forEach((f) => fd.append("files", f, f.name));
      const res = await fetch("/api/quote", { method: "POST", body: fd });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; reference?: string; error?: string; fields?: QuoteErrors };
      if (!res.ok || !json.ok || !json.reference) {
        if (json.fields && Object.keys(json.fields).length) {
          const firstStep = quoteStepFields.findIndex((fs) => fs.some((f) => json.fields?.[f]));
          if (firstStep >= 0) goTo(firstStep);
          else if (json.fields.files) goTo(5);
          dispatch({ type: "errors", errors: json.fields });
        }
        setSubmitError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setReference(json.reference);
      track("quote_submitted", { product: data.product, reference: json.reference });
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      focusTitle();
    } catch {
      setSubmitError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === total - 1) submit();
    else next();
  }

  function reset() {
    dispatch({ type: "reset" });
    setFiles([]);
    setReference(null);
    idemKey.current = newKey();
    focusTitle();
  }

  const set = <K extends keyof QuoteRequest>(key: K) => (value: QuoteRequest[K]) => dispatch({ type: "set", key, value });
  const productLabel = data.product === "other" ? data.productOther || "Other" : quoteProductOptions.find((o) => o.id === data.product)?.label ?? "";

  if (reference) {
    return (
      <div ref={panelRef} className="py-8">
        <QuoteSuccess reference={reference} email={data.email} logo={logo} onReset={reset} />
      </div>
    );
  }

  const links = contactLinks();
  const fallbackChannel = links.messenger ?? links.email ?? links.phone;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      {/* Progress rail */}
      <aside className="lg:col-span-3">
        <div className="lg:sticky lg:top-28">
          {/* Mobile progress */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between">
              <span className="spec text-smoke">{STEPS[step].label}</span>
              <span className="spec text-smoke">{step + 1} / {total}</span>
            </div>
            <div className="mt-3 grid grid-cols-8 gap-1" aria-hidden>
              {STEPS.map((s, i) => (
                <span key={s.key} className="h-1 transition-opacity duration-300" style={{ background: s.color, opacity: i <= step ? 1 : 0.15 }} />
              ))}
            </div>
          </div>
          {/* Desktop rail */}
          <ol className="hidden border-t border-ink/10 lg:block" aria-label="Quote steps">
            {STEPS.map((s, i) => {
              const done = i < step;
              const current = i === step;
              return (
                <li key={s.key} className="border-b border-ink/10">
                  <button
                    type="button"
                    disabled={i > step}
                    onClick={() => goTo(i)}
                    aria-current={current ? "step" : undefined}
                    className={cn("flex w-full items-center gap-4 py-3.5 text-left transition-colors disabled:cursor-default", current ? "text-ink" : done ? "text-ink/70 hover:text-ink" : "text-ink/30")}
                  >
                    <span className="block h-4 w-1 transition-all duration-300" style={{ background: s.color, opacity: current || done ? 1 : 0.2, transform: current ? "scaleY(1.6)" : undefined }} />
                    <span className="spec w-5">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-semibold uppercase tracking-[0.04em]">{s.label}</span>
                    {done && <span className="spec ml-auto text-mute">Edit</span>}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-6 hidden text-sm text-smoke lg:block">Your progress is saved in this browser tab. No prices are shown here — we review every request and send a proper quotation.</p>
        </div>
      </aside>

      {/* Panel */}
      <div className="lg:col-span-9 xl:col-span-6" ref={panelRef}>
        <form onSubmit={onSubmit} noValidate className="relative">
          <input ref={honeypot} type="text" name="company_website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden />
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <m.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: 40 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 * direction }}
              transition={{ duration: 0.35, ease: EASE }}
              className="min-h-[28rem]"
            >
              {step === 0 && (
                <div className="space-y-8">
                  <StepHeader n={1} total={total} title="What do you need?" lead="Pick the closest match. You can describe anything unusual under “Other”." />
                  <ChoiceGroup
                    name="q-product"
                    legend="Product"
                    hideLegend
                    columns="sm:grid-cols-3 xl:grid-cols-4"
                    value={data.product}
                    onChange={set("product")}
                    error={errors.product}
                    options={quoteProductOptions.map((o) => ({ value: o.id, label: o.label, visual: <PrintArtwork kind={o.art} className="h-full w-full" /> }))}
                  />
                  {data.product === "other" && (
                    <TextField id="q-productOther" label="Describe what you need" value={data.productOther} onChange={set("productOther")} error={errors.productOther} placeholder="e.g. Hang tags for a clothing line" maxLength={120} />
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8">
                  <StepHeader n={2} total={total} title="Project details" lead={productLabel ? `Tell us about your ${productLabel.toLowerCase()}.` : undefined} />
                  <div>
                    <TextField id="q-quantity" label="Quantity" value={data.quantity} onChange={set("quantity")} error={errors.quantity} placeholder="e.g. 500" inputMode="numeric" hint="An estimate is fine. Add versions if they differ (e.g. 3 names × 200)." maxLength={60} />
                    <Chips label="Common quantities" options={["100", "250", "500", "1,000", "5,000+"]} onPick={set("quantity")} active={data.quantity} />
                  </div>
                  <div>
                    <TextField id="q-size" label="Finished size" optional value={data.size} onChange={set("size")} error={errors.size} placeholder="e.g. A5, or 8.5 × 11 in" maxLength={120} />
                    <Chips label="Common sizes" options={sizeHints[data.product] ?? sizeHints.default} onPick={set("size")} active={data.size} />
                  </div>
                  <ChoiceGroup name="q-sides" legend="Printing" value={data.sides} onChange={set("sides")} error={errors.sides} options={sidesOptions.map((v) => ({ value: v, label: v }))} />
                  <ChoiceGroup name="q-color" legend="Color" value={data.color} onChange={set("color")} error={errors.color} options={colorOptions.map((v) => ({ value: v, label: v }))} />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <StepHeader n={3} total={total} title="Paper / material" lead="Not sure? That's completely fine — we'll recommend a stock based on how the piece will be used." />
                  <ChoiceGroup name="q-paper" legend="Paper preference" hideLegend columns="sm:grid-cols-3 xl:grid-cols-4" value={data.paper} onChange={set("paper")} error={errors.paper} options={paperOptions.map((p) => ({ value: p.id, label: p.id, hint: p.hint }))} />
                  <TextField id="q-paperNotes" label={data.paper === "Custom" ? "Describe the paper or material" : "Paper notes"} optional={data.paper !== "Custom"} multiline value={data.paperNotes} onChange={set("paperNotes")} error={errors.paperNotes} placeholder="e.g. Something thick and textured for a premium feel" maxLength={500} />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <StepHeader n={4} total={total} title="Finishing" lead="Select everything that applies. Availability is confirmed in your quotation." />
                  <CheckGroup name="q-finishing" legend="Finishing options" options={finishingOptions} values={data.finishing} onToggle={(v) => dispatch({ type: "toggleFinishing", value: v })} error={errors.finishing} />
                  <TextField id="q-finishingNotes" label="Finishing notes" optional={!data.finishing.includes("Other")} multiline value={data.finishingNotes} onChange={set("finishingNotes")} error={errors.finishingNotes} placeholder="e.g. Tri-fold, rounded corners, saddle-stitch binding" maxLength={500} />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <StepHeader n={5} total={total} title="When do you need the project?" lead="We'll confirm a realistic timeline with your quotation, before anything goes to production." />
                  <ChoiceGroup name="q-deadlineType" legend="Timing" hideLegend value={data.deadlineType} onChange={set("deadlineType")} error={errors.deadlineType} options={deadlineOptions.map((d) => ({ value: d.id, label: d.label, hint: d.hint }))} />
                  {data.deadlineType === "date" && (
                    <TextField id="q-deadlineDate" label="Date needed" type="date" value={data.deadlineDate} onChange={set("deadlineDate")} error={errors.deadlineDate} min={new Date().toISOString().slice(0, 10)} className="max-w-xs" />
                  )}
                  <ChoiceGroup name="q-delivery" legend="Pickup or delivery" value={data.delivery} onChange={set("delivery")} options={deliveryOptions.map((d) => ({ value: d, label: d }))} />
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8">
                  <StepHeader n={6} total={total} title="Upload your files" lead="Optional. Attach artwork, references or spec sheets — or share a link for large files." />
                  <ChoiceGroup name="q-artwork" legend="Where's your artwork?" value={data.artwork} onChange={set("artwork")} options={artworkOptions.map((a) => ({ value: a, label: a }))} />
                  <FileUpload files={files} onChange={setFiles} error={errors.files} />
                  <TextField id="q-fileLink" label="Or share a link" optional type="url" value={data.fileLink} onChange={set("fileLink")} error={errors.fileLink} placeholder="https://drive.google.com/…" hint="Google Drive, Dropbox, WeTransfer — make sure the link is viewable." maxLength={500} />
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6">
                  <StepHeader n={7} total={total} title="Your details" lead="So we can send your quotation and reach you if we have questions." />
                  <div className="grid gap-6 sm:grid-cols-2">
                    <TextField id="q-name" label="Name" value={data.name} onChange={set("name")} error={errors.name} autoComplete="name" maxLength={120} />
                    <TextField id="q-company" label="Company / organization" optional value={data.company} onChange={set("company")} error={errors.company} autoComplete="organization" maxLength={160} />
                    <TextField id="q-email" label="Email" type="email" value={data.email} onChange={set("email")} error={errors.email} autoComplete="email" inputMode="email" maxLength={200} />
                    <TextField id="q-mobile" label="Mobile" optional type="tel" value={data.mobile} onChange={set("mobile")} error={errors.mobile} autoComplete="tel" inputMode="tel" placeholder="0917 123 4567" maxLength={40} />
                  </div>
                  <TextField id="q-message" label="Anything else we should know?" optional multiline value={data.message} onChange={set("message")} error={errors.message} maxLength={3000} placeholder="Brand colors, references, special requirements…" />
                  <div>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input id="q-consent" type="checkbox" checked={data.consent} onChange={(e) => set("consent")(e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "q-consent-error" : undefined} className="mt-1 size-4 accent-ink" />
                      <span className="text-sm text-smoke">
                        I agree that GraphInk Media may contact me about this request and store the details I&apos;ve provided, as described in the <a href="/privacy" className="underline underline-offset-2 hover:text-ink" target="_blank">privacy notice</a>.
                      </span>
                    </label>
                    <FieldError id="q-consent-error" message={errors.consent} />
                  </div>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-8">
                  <StepHeader n={8} total={total} title="Review your request" lead="Check the details below. We'll review your specifications and send a quotation." />
                  <Summary data={data} files={files} productLabel={productLabel} onEdit={goTo} />
                </div>
              )}
            </m.div>
          </AnimatePresence>

          {submitError && (
            <div role="alert" className="mt-8 border-l-4 border-gi-magenta bg-paper p-5">
              <p className="font-semibold">{submitError}</p>
              {fallbackChannel && (
                <p className="mt-2 text-sm text-smoke">
                  You can also reach us via <a href={fallbackChannel.href} className="underline">{fallbackChannel.label}</a>.
                </p>
              )}
            </div>
          )}

          {/* Nav */}
          <div className="mt-12 flex items-center justify-between gap-4 border-t border-ink/10 pt-6">
            <button type="button" onClick={() => goTo(step - 1)} disabled={step === 0} className="inline-flex h-12 items-center gap-2 px-1 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] transition-opacity disabled:opacity-0">
              <ArrowLeft size={16} /> Back
            </button>
            {step < total - 1 ? (
              <Button type="submit" size="lg" arrow>Continue</Button>
            ) : (
              <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting}>
                {submitting ? "Sending…" : "Request quote"}
                {!submitting && <ArrowRight size={16} className="relative z-10" />}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Job ticket */}
      <aside className="hidden xl:col-span-3 xl:block" aria-label="Job ticket">
        <div className="sticky top-28">
          <JobTicket data={data} files={files} productLabel={productLabel} />
        </div>
      </aside>
    </div>
  );
}

function summaryRows(data: QuoteRequest, files: File[], productLabel: string) {
  return [
    { step: 0, label: "Product", value: productLabel },
    { step: 1, label: "Quantity", value: data.quantity },
    { step: 1, label: "Finished size", value: data.size },
    { step: 1, label: "Printing", value: data.sides },
    { step: 1, label: "Color", value: data.color },
    { step: 2, label: "Paper", value: [data.paper, data.paperNotes].filter(Boolean).join(" — ") },
    { step: 3, label: "Finishing", value: [data.finishing.join(", "), data.finishingNotes].filter(Boolean).join(" — ") },
    { step: 4, label: "Deadline", value: data.deadlineType === "date" ? data.deadlineDate : deadlineOptions.find((d) => d.id === data.deadlineType)?.label ?? "" },
    { step: 4, label: "Delivery", value: data.delivery },
    { step: 5, label: "Artwork", value: data.artwork },
    { step: 5, label: "Files", value: [files.map((f) => f.name).join(", "), data.fileLink].filter(Boolean).join(" · ") },
    { step: 6, label: "Name", value: data.name },
    { step: 6, label: "Company", value: data.company },
    { step: 6, label: "Email", value: data.email },
    { step: 6, label: "Mobile", value: data.mobile },
    { step: 6, label: "Message", value: data.message },
  ];
}

function Summary({ data, files, productLabel, onEdit }: { data: QuoteRequest; files: File[]; productLabel: string; onEdit: (s: number) => void }) {
  const rows = summaryRows(data, files, productLabel);
  const groups = STEPS.slice(0, 7).map((s, i) => ({ ...s, i, rows: rows.filter((r) => r.step === i) }));
  return (
    <div className="border-t border-ink/15">
      {groups.map((g) => (
        <section key={g.key} className="border-b border-ink/15 py-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.06em]">
              <span className="block h-3 w-1" style={{ background: g.color }} />
              {g.label}
            </h3>
            <button type="button" onClick={() => onEdit(g.i)} className="spec h-8 px-2 text-smoke underline-offset-4 hover:text-ink hover:underline" aria-label={`Edit ${g.label}`}>
              Edit
            </button>
          </div>
          <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[10rem_1fr]">
            {g.rows.map((r) => (
              <div key={r.label} className="contents">
                <dt className="spec pt-0.5 text-mute">{r.label}</dt>
                <dd className="break-words text-sm">{r.value || <span className="text-mute">—</span>}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

function JobTicket({ data, files, productLabel }: { data: QuoteRequest; files: File[]; productLabel: string }) {
  const rows = summaryRows(data, files, productLabel).filter((r) => r.step <= 5 && r.label !== "Artwork");
  return (
    <div className="relative bg-paper shadow-[0_24px_48px_-28px_rgba(0,0,0,0.35)]">
      <div className="spectrum-bar h-1" />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <p className="spec text-smoke">Job ticket</p>
          <p className="spec text-mute">Draft</p>
        </div>
        <p className="mt-3 text-xl font-semibold uppercase tracking-[-0.02em]">{productLabel || "New print job"}</p>
        <dl className="mt-4 space-y-2 border-t border-dashed border-ink/20 pt-4">
          {rows.slice(1).map((r) => (
            <div key={r.label} className="flex justify-between gap-4 text-sm">
              <dt className="spec pt-0.5 text-mute">{r.label}</dt>
              <dd className="max-w-[60%] truncate text-right">{r.value || <span className="text-ink/20">——</span>}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex items-center justify-between border-t border-dashed border-ink/20 pt-4">
          <span className="spec text-mute">Price</span>
          <span className="spec">Quoted after review</span>
        </div>
      </div>
      {/* perforation */}
      <div className="flex justify-between px-2 pb-2" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="size-1 rounded-full bg-paper-soft" />
        ))}
      </div>
    </div>
  );
}
