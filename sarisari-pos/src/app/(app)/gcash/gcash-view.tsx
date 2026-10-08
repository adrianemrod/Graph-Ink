"use client";

import { useRef, useState, useTransition } from "react";
import { ArrowDownLeft, ArrowUpRight, Check, Smartphone } from "lucide-react";
import { recordGcash } from "@/actions/gcash";
import { pesoCents, toCents } from "@/lib/money";
import { formatShortDate, formatTime, manilaDateKey } from "@/lib/time";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, EmptyState, PageHeader, Stat } from "@/components/ui/card";
import { Field, FormError, Input, MoneyInput } from "@/components/ui/input";

type Tx = { id: string; type: "CASH_IN" | "CASH_OUT"; amount: number; serviceFee: number; customerReference: string | null; notes: string | null; createdAt: string; createdBy: string };
type Stats = { balance: number; todayCashIn: number; todayCashOut: number; todayFees: number; monthFees: number };

function newRequestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function GcashView({ isOwner, stats, recent }: { isOwner: boolean; stats: Stats | null; recent: Tx[] }) {
  const todayKey = manilaDateKey();
  return (
    <PageContainer>
      <PageHeader title="GCash" description="Cash In and Cash Out service. Separate from product sales — only the service fee is income." />

      {stats ? (
        <>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.2fr_2fr]">
            <Stat label="GCash Balance" value={pesoCents(stats.balance)} tone="dark" hint="Starting balance + Cash In − Cash Out + GCash product payments" className="flex flex-col justify-center lg:[&_p:nth-child(2)]:text-[40px]" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Stat label="Today's Cash In" value={pesoCents(stats.todayCashIn)} />
              <Stat label="Today's Cash Out" value={pesoCents(stats.todayCashOut)} />
              <Stat label="Today's Service Fees" value={pesoCents(stats.todayFees)} tone="accent" />
              <Stat label="This Month's Fees" value={pesoCents(stats.monthFees)} tone="accent" />
            </div>
          </div>
        </>
      ) : null}

      <div className={cn("grid gap-6 lg:grid-cols-[420px_1fr]", stats && "mt-6")}>
        <GcashForm />

        <Card className="min-w-0">
          <CardHeader title="Recent GCash Transactions" description={isOwner ? "Latest service transactions" : "Today"} />
          {recent.length === 0 ? (
            <EmptyState icon={<Smartphone />} title="No GCash transactions yet" />
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", t.type === "CASH_IN" ? "bg-accent-50 text-accent-700" : "bg-slate-100 text-slate-600")}>
                    {t.type === "CASH_IN" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{t.type === "CASH_IN" ? "Cash In" : "Cash Out"}</p>
                    <p className="truncate text-xs text-slate-500">
                      {manilaDateKey(new Date(t.createdAt)) === todayKey ? formatTime(t.createdAt) : `${formatShortDate(t.createdAt)} · ${formatTime(t.createdAt)}`}
                      {t.customerReference ? ` · ${t.customerReference}` : ""} · {t.createdBy}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="num text-[15px] font-semibold">{pesoCents(t.amount)}</p>
                    <p className="num text-xs font-medium text-accent-700">Fee {pesoCents(t.serviceFee)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}

function GcashForm() {
  const [type, setType] = useState<"CASH_IN" | "CASH_OUT">("CASH_IN");
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recorded, setRecorded] = useState<{ type: "CASH_IN" | "CASH_OUT"; amount: number; fee: number } | null>(null);
  const [pending, start] = useTransition();
  const requestId = useRef("");

  const amountCents = toCents(amount);
  const feeCents = fee.trim() === "" ? 0 : toCents(fee);
  const valid = amount.trim() !== "" && !Number.isNaN(amountCents) && amountCents > 0 && !Number.isNaN(feeCents) && feeCents >= 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || pending) return;
    setError(null);
    if (!requestId.current) requestId.current = newRequestId();
    start(async () => {
      let r: Awaited<ReturnType<typeof recordGcash>>;
      try {
        r = await recordGcash({ clientRequestId: requestId.current, type, amount, serviceFee: fee || "0", customerReference: reference });
      } catch {
        setError("Connection problem. Press Record Transaction again — it will not be saved twice.");
        return;
      }
      if (!r.ok) {
        requestId.current = "";
        return setError(r.error);
      }
      requestId.current = "";
      setRecorded({ type, amount: amountCents, fee: feeCents });
      setAmount("");
      setFee("");
      setReference("");
    });
  }

  if (recorded) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-accent-50 text-accent-600">
          <Check className="size-7" strokeWidth={2.5} />
        </div>
        <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-700">Transaction Recorded</p>
        <p className="mt-2 text-sm text-slate-500">{recorded.type === "CASH_IN" ? "GCash Cash In" : "GCash Cash Out"}</p>
        <p className="num mt-1 text-[32px] font-semibold tracking-[-0.03em]">{pesoCents(recorded.amount)}</p>
        <p className="num mt-1 text-sm text-slate-600">Service fee {pesoCents(recorded.fee)}</p>
        <p className="num mt-0.5 text-xs text-slate-500">
          GCash balance {recorded.type === "CASH_IN" ? "+" : "−"}
          {pesoCents(recorded.amount)}
        </p>
        <Button size="lg" variant="primary" className="mt-6 w-full" onClick={() => setRecorded(null)}>
          Record Another
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <span className="mb-2 block text-[13px] font-medium text-slate-600">Transaction Type</span>
          <div className="grid grid-cols-2 gap-2" role="radiogroup">
            {(
              [
                { v: "CASH_IN", label: "Cash In", hint: "GCash balance goes up", icon: ArrowDownLeft },
                { v: "CASH_OUT", label: "Cash Out", hint: "GCash balance goes down", icon: ArrowUpRight },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                role="radio"
                aria-checked={type === o.v}
                onClick={() => setType(o.v)}
                className={cn(
                  "rounded-2xl border-2 p-4 text-left transition",
                  type === o.v ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white hover:border-slate-300",
                )}
              >
                <o.icon className={cn("size-5", type === o.v ? "text-accent-500" : "text-slate-400")} />
                <p className="mt-2 text-[15px] font-semibold">{o.label}</p>
                <p className={cn("mt-0.5 text-xs", type === o.v ? "text-slate-400" : "text-slate-500")}>{o.hint}</p>
              </button>
            ))}
          </div>
        </div>

        <Field label="Amount">
          <MoneyInput value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" inputSize="lg" />
        </Field>
        <Field label="Service Fee" hint="Store income. It does not change the GCash balance.">
          <MoneyInput value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0.00" />
        </Field>
        <Field label="Customer Reference / Note">
          <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Name, number or GCash ref no. (optional)" />
        </Field>

        {valid ? (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-[13px] text-slate-600">
            {type === "CASH_IN" ? (
              <>Customer pays <b className="num text-ink-900">{pesoCents(amountCents + feeCents)}</b> cash ({pesoCents(amountCents)} + {pesoCents(feeCents)} fee).</>
            ) : (
              <>Give customer <b className="num text-ink-900">{pesoCents(amountCents)}</b> cash. Fee <b className="num text-ink-900">{pesoCents(feeCents)}</b>.</>
            )}
          </div>
        ) : null}

        <FormError message={error} />
        <Button type="submit" size="xl" variant="accent" className="w-full" disabled={!valid} loading={pending}>
          Record Transaction
        </Button>
        <p className="text-center text-xs text-slate-400">Date &amp; time are recorded automatically.</p>
      </form>
    </Card>
  );
}
