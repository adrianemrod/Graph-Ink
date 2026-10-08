"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

export function ReceiptActions({ autoPrint }: { autoPrint: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (autoPrint) setTimeout(() => window.print(), 250);
  }, [autoPrint]);
  return (
    <div className="no-print mx-auto mb-5 flex w-[300px] justify-between">
      <button
        onClick={() => (window.history.length > 1 ? router.back() : window.close())}
        className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-white"
      >
        <ArrowLeft className="size-4" /> Back
      </button>
      <button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-semibold text-white shadow-soft">
        <Printer className="size-4" /> Print
      </button>
    </div>
  );
}
