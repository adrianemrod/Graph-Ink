"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

type Toast = { id: number; title: string; description?: string; tone: "success" | "error" };
const ToastContext = createContext<(t: Omit<Toast, "id" | "tone"> & { tone?: Toast["tone"] }) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id" | "tone"> & { tone?: Toast["tone"] }) => {
    const id = Date.now() + Math.random();
    setToasts((all) => [...all, { id, tone: "success", ...t }]);
    setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="no-print pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto flex min-w-[260px] max-w-sm animate-pop-in items-start gap-3 rounded-2xl bg-ink-900 px-4 py-3 text-white shadow-lift">
            {t.tone === "success" ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent-500" /> : <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-400" />}
            <div>
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description ? <p className="mt-0.5 text-[13px] text-slate-300">{t.description}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
