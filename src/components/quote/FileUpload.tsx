"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { siteConfig } from "@/config/site";
import { validateFiles } from "@/lib/quote/schema";
import { Close, FileIcon, Upload } from "@/components/ui/Icons";
import { FieldError } from "./fields";
import { cn } from "@/lib/cn";

const fmt = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

export function FileUpload({ files, onChange, error }: { files: File[]; onChange: (f: File[]) => void; error?: string }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { acceptedExtensions, maxFileSizeMB, maxFiles, maxTotalSizeMB } = siteConfig.quote;
  const accept = acceptedExtensions.map((e) => `.${e}`).join(",");

  function add(list: FileList | null) {
    if (!list?.length) return;
    const incoming = Array.from(list).filter((f) => !files.some((x) => x.name === f.name && x.size === f.size));
    const next = [...files, ...incoming];
    const problem = validateFiles(next);
    if (problem) {
      setLocalError(problem);
      return;
    }
    setLocalError(null);
    onChange(next);
  }

  const shown = localError ?? error;

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        className={cn(
          "relative flex flex-col items-center justify-center border border-dashed px-6 py-12 text-center transition-colors",
          drag ? "border-ink bg-paper" : "border-ink/25 bg-paper/60 hover:border-ink/50",
          shown && "border-gi-magenta",
        )}
      >
        <span className={cn("flex size-14 items-center justify-center border border-ink/15 bg-paper transition-transform duration-300", drag && "-translate-y-1")}>
          <Upload size={24} />
        </span>
        <p className="mt-5 font-semibold">
          Drag files here, or{" "}
          <button type="button" onClick={() => input.current?.click()} className="underline decoration-gi-cyan decoration-2 underline-offset-4 hover:decoration-ink">
            browse
          </button>
        </p>
        <p id={`${id}-hint`} className="spec mt-3 text-smoke">
          {acceptedExtensions.filter((e) => e !== "jpeg").map((e) => e.toUpperCase()).join(" · ")} — up to {maxFileSizeMB} MB each, {maxFiles} files, {maxTotalSizeMB} MB total
        </p>
        <input
          ref={input}
          id={id}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          aria-label="Upload artwork files"
          aria-describedby={`${id}-hint`}
          onChange={(e) => { add(e.target.files); e.target.value = ""; }}
        />
      </div>
      <FieldError id={`${id}-error`} message={shown ?? undefined} />

      <ul className="mt-4 space-y-2" aria-live="polite">
        <AnimatePresence initial={false}>
          {files.map((f) => (
            <m.li
              key={f.name + f.size}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 border border-ink/10 bg-paper px-4 py-3"
            >
              <FileIcon size={18} className="shrink-0 text-smoke" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{f.name}</span>
              <span className="spec text-mute">{fmt(f.size)}</span>
              <button type="button" onClick={() => onChange(files.filter((x) => x !== f))} aria-label={`Remove ${f.name}`} className="-mr-2 flex size-9 items-center justify-center text-smoke hover:text-ink">
                <Close size={16} />
              </button>
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
