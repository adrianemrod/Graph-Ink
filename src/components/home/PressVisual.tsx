"use client";

import { useEffect, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { RegistrationMark, CropMarks } from "@/components/brand/PrintMarks";
import { cn } from "@/lib/cn";

/**
 * Hero visual: a white sheet feeds onto the press bed, then the four process
 * plates are laid down one at a time (C → M → Y → K). Plates blend with
 * `multiply`, so overlaps produce real subtractive mixes — seven colors from
 * four inks, echoing the GraphInk spectrum.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;
const FEED = 0.9; // seconds before first plate
const PASS = 0.62; // seconds per plate

const plates = [
  { key: "C", name: "Cyan", color: "#00A3E0", from: { x: -7, y: 3 } },
  { key: "M", name: "Magenta", color: "#E5007E", from: { x: 6, y: -4 } },
  { key: "Y", name: "Yellow", color: "#FFE500", from: { x: -4, y: -6 } },
  { key: "K", name: "Black", color: "#1A1A1A", from: { x: 5, y: 5 } },
] as const;

function PlateArt({ plate, color }: { plate: (typeof plates)[number]["key"]; color: string }) {
  switch (plate) {
    case "C":
      return (
        <g fill={color}>
          <polygon points="36,56 196,36 146,214" />
          <rect x="36" y="336" width="128" height="5" />
          <rect x="228" y="296" width="36" height="36" opacity="0.35" />
        </g>
      );
    case "M":
      return (
        <g fill={color}>
          <polygon points="118,40 266,92 168,236" />
          <rect x="228" y="296" width="36" height="36" />
          <rect x="36" y="336" width="64" height="5" />
        </g>
      );
    case "Y":
      return (
        <g fill={color}>
          <polygon points="52,150 254,142 150,262" />
          <rect x="228" y="296" width="36" height="36" opacity="0.8" />
          <rect x="84" y="336" width="80" height="5" />
        </g>
      );
    case "K":
    default:
      return (
        <g fill={color}>
          <rect x="36" y="276" width="176" height="14" />
          <rect x="36" y="296" width="118" height="14" />
          <g opacity="0.55">
            <rect x="36" y="352" width="150" height="2.4" />
            <rect x="36" y="359" width="150" height="2.4" />
            <rect x="36" y="366" width="96" height="2.4" />
          </g>
          <rect x="228" y="352" width="36" height="2.4" opacity="0.55" />
          <polygon points="150,112 196,176 150,214 118,168" opacity="0.9" />
          <rect x="36" y="20" width="18" height="2" />
          <rect x="246" y="20" width="18" height="2" />
        </g>
      );
  }
}

export function PressVisual({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  // -2 idle · -1 feeding · 0–3 laying plate i · 4 finished
  const [phase, setPhase] = useState(-2);

  useEffect(() => {
    if (reduce) return;
    // On a first visit the loader is still clearing — start a beat later.
    const lead = run === 0 && !document.documentElement.classList.contains("gi-seen") ? 0.7 : 0.05;
    const at = (t: number, p: number) => setTimeout(() => setPhase(p), t * 1000);
    const timers = [at(lead, -1), ...plates.map((_, i) => at(lead + FEED + PASS * i, i)), at(lead + FEED + PASS * plates.length, 4)];
    return () => timers.forEach(clearTimeout);
  }, [run, reduce]);

  const stage = reduce ? 4 : phase;
  const done = stage >= 4;

  function rerun() {
    setPhase(-2);
    setRun((r) => r + 1);
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative aspect-[4/4.3] overflow-hidden rounded-sm bg-charcoal text-paper sm:aspect-[4/4.6] lg:aspect-[4/5]">
        <div className="grid-lines absolute inset-0 [--grid-color:rgba(255,255,255,0.04)] [--grid-size:32px]" aria-hidden />

        {/* Bed labels */}
        <div className="absolute inset-x-4 top-4 flex items-center justify-between text-paper/40 sm:inset-x-5 sm:top-5">
          <span className="spec">GI · Sheet 01</span>
          <span className="spec">4/0 Process</span>
        </div>
        <RegistrationMark size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-paper/25 sm:left-5" />
        <RegistrationMark size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-paper/25 sm:right-5" />

        {/* The sheet */}
        <div className="absolute inset-0 flex items-center justify-center p-[13%]">
          <m.div
            className="relative aspect-[3/4] h-full max-h-full"
            initial={reduce ? false : { x: "-140%", rotate: -4, opacity: 0.6 }}
            animate={stage >= -1 ? { x: 0, rotate: 0, opacity: 1 } : { x: "-140%", rotate: -4, opacity: 0.6 }}
            transition={{ duration: stage >= -1 ? 0.8 : 0, ease: [0.65, 0, 0.35, 1] }}
          >
            <CropMarks className="text-paper/45" size={14} gap={5} />
            <div className="paper-grain absolute inset-0 isolate overflow-hidden bg-paper shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
              {plates.map((p, i) => {
                const on = stage >= i;
                return (
                  <m.svg
                    key={p.key}
                    viewBox="0 0 300 400"
                    className="absolute inset-0 h-full w-full"
                    style={{ mixBlendMode: "multiply" }}
                    aria-hidden
                    initial={reduce ? false : { clipPath: "inset(0 0 100% 0)", x: p.from.x, y: p.from.y }}
                    animate={on ? { clipPath: "inset(0 0 0% 0)", x: [p.from.x, p.from.x, 0], y: [p.from.y, p.from.y, 0] } : { clipPath: "inset(0 0 100% 0)", x: p.from.x, y: p.from.y }}
                    transition={
                      on
                        ? {
                            clipPath: { duration: PASS * 0.8, ease: [0.45, 0, 0.2, 1] },
                            x: { duration: PASS * 1.1, times: [0, 0.6, 1], ease: EASE },
                            y: { duration: PASS * 1.1, times: [0, 0.6, 1], ease: EASE },
                          }
                        : { duration: 0 }
                    }
                  >
                    <PlateArt plate={p.key} color={p.color} />
                  </m.svg>
                );
              })}
              {/* Ink roller line that sweeps with each pass */}
              {!reduce && stage >= 0 && stage < 4 && (
                <m.span
                  key={`roller-${run}-${stage}`}
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ background: plates[stage].color, boxShadow: `0 0 12px ${plates[stage].color}` }}
                  initial={{ top: "0%", opacity: 0 }}
                  animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: PASS * 0.8, ease: [0.45, 0, 0.2, 1], opacity: { times: [0, 0.1, 0.85, 1], duration: PASS * 0.8 } }}
                />
              )}
              {/* Finishing sheen */}
              {done && !reduce && (
                <m.span
                  key={`sheen-${run}`}
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  initial={{ x: "0%" }}
                  animate={{ x: "400%" }}
                  transition={{ duration: 1.1, ease: "easeInOut", delay: 0.15 }}
                />
              )}
            </div>
          </m.div>
        </div>

        {/* Pass indicator */}
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
          <ol className="flex items-center gap-1.5" aria-label="Print passes">
            {plates.map((p, i) => {
              const active = stage >= i;
              return (
                <li key={p.key} className="flex flex-col items-center gap-1.5">
                  <span className={cn("block h-1 w-7 transition-opacity duration-300 sm:w-9", active ? "opacity-100" : "opacity-20")} style={{ background: p.key === "K" ? "#F7F7F5" : p.color }} />
                  <span className={cn("spec transition-opacity duration-300", active ? "opacity-80" : "opacity-30")}>{p.key}</span>
                </li>
              );
            })}
          </ol>
          <div className="flex items-center gap-3">
            <p className="spec text-right text-paper/60" aria-live="polite">
              {done ? "Finished full-color print" : stage < 0 ? "Feeding sheet" : `Pass ${stage + 1} · ${plates[stage].name}`}
            </p>
            <button
              type="button"
              onClick={rerun}
              className="spec inline-flex h-7 items-center border border-paper/20 px-2 text-paper/70 transition-colors hover:border-paper/60 hover:text-paper disabled:opacity-0"
              disabled={!done || !!reduce}
              aria-label="Run the print animation again"
            >
              Rerun
            </button>
          </div>
        </div>
      </div>
      <p className="spec mt-3 text-smoke">Four inks. Seven colors. One sheet in register.</p>
    </div>
  );
}
