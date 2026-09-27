import { cn } from "@/lib/cn";

/** Registration target — the crosshair printers use to align plates. */
export function RegistrationMark({ size = 18, className, strokeWidth = 1 }: { size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <path d="M12 0v24M0 12h24" />
    </svg>
  );
}

/**
 * Crop marks: short lines extending each trim edge outward, offset by a gap —
 * exactly how they appear on a press sheet. Parent must be `relative`.
 */
export function CropMarks({ className, size = 16, gap = 5 }: { className?: string; size?: number; gap?: number }) {
  const corners = [
    { key: "tl", style: { top: -size, left: -size }, d: `M${size} 0V${size - gap}M0 ${size}H${size - gap}` },
    { key: "tr", style: { top: -size, right: -size }, d: `M0 0V${size - gap}M${gap} ${size}H${size}` },
    { key: "bl", style: { bottom: -size, left: -size }, d: `M${size} ${gap}V${size}M0 0H${size - gap}` },
    { key: "br", style: { bottom: -size, right: -size }, d: `M0 ${gap}V${size}M${gap} 0H${size}` },
  ];
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0 text-ink/35", className)}>
      {corners.map((c) => (
        <svg key={c.key} width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute overflow-visible" style={c.style} fill="none" stroke="currentColor" strokeWidth={1}>
          <path d={c.d} />
        </svg>
      ))}
    </span>
  );
}

/**
 * Colour control strip — the segmented bar printed on the edge of press
 * sheets. Used as the site's signature spectrum line.
 */
export function ColorStrip({ className, animated = false, thin = false }: { className?: string; animated?: boolean; thin?: boolean }) {
  return <span aria-hidden className={cn("block w-full", thin ? "h-[2px]" : "h-1", animated ? "spectrum-flow" : "spectrum-bar", className)} />;
}

/** Tiny CMYK patches with labels — used as a print-sheet detail. */
export function CMYKPatches({ className, labels = true }: { className?: string; labels?: boolean }) {
  const inks = [
    ["C", "bg-process-c"],
    ["M", "bg-process-m"],
    ["Y", "bg-process-y"],
    ["K", "bg-process-k"],
  ] as const;
  return (
    <span aria-hidden className={cn("inline-flex items-center gap-1", className)}>
      {inks.map(([k, bg]) => (
        <span key={k} className="inline-flex items-center gap-1">
          <span className={cn("block size-2.5", bg)} />
          {labels && <span className="spec opacity-60">{k}</span>}
        </span>
      ))}
    </span>
  );
}
