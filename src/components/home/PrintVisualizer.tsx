"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CropMarks } from "@/components/brand/PrintMarks";

/**
 * Digital file vs. finished print. Purely visual storytelling: screens mix
 * light (RGB), print mixes ink (CMYK) on a physical surface. No colour-
 * matching claims are made.
 */

function Artwork({ mode }: { mode: "screen" | "print" }) {
  const screen = mode === "screen";
  const cyan = screen ? "#00B7FF" : "#0898D8";
  const magenta = screen ? "#FF1AA3" : "#E80888";
  const yellow = screen ? "#FFF200" : "#F5E10A";
  const id = `ht-${mode}`;
  return (
    <svg viewBox="0 0 400 500" className="h-full w-full" aria-hidden>
      <defs>
        <pattern id={id} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(22)">
          <circle cx="2" cy="2" r="0.9" fill="#000" opacity="0.18" />
        </pattern>
      </defs>
      <rect width="400" height="500" fill={screen ? "#FFFFFF" : "#FAF9F5"} />
      <g style={{ mixBlendMode: "multiply" }}>
        <polygon points="40,50 250,34 180,270" fill={cyan} />
        <polygon points="140,40 360,104 226,290" fill={magenta} />
        <polygon points="60,186 340,176 200,330" fill={yellow} />
      </g>
      {!screen && <rect width="400" height="340" fill={`url(#${id})`} />}
      <text x="40" y="392" fontFamily="var(--font-inter-tight), sans-serif" fontWeight="700" fontSize="40" letterSpacing="-1.6" fill="#111">PRINT WITH</text>
      <text x="40" y="432" fontFamily="var(--font-inter-tight), sans-serif" fontWeight="700" fontSize="40" letterSpacing="-1.6" fill="#111">INTENTION.</text>
      <g fill="#111" opacity="0.45"><rect x="40" y="454" width="200" height="3" /><rect x="40" y="462" width="150" height="3" /></g>
      <rect x="320" y="444" width="40" height="20" fill={magenta} />
    </svg>
  );
}

export function PrintVisualizer() {
  const [pos, setPos] = useState(50);

  return (
    <section className="bg-paper py-24 md:py-36" aria-labelledby="visualizer-title">
      <div className="container-gi">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-4">
            <SectionHeading
              index="06"
              eyebrow="Screen to sheet"
              title={<span id="visualizer-title">From digital idea to physical impact.</span>}
              lead="A screen glows. Paper reflects. Drag across to see what changes when a file becomes an object — texture, edges, depth and the way ink sits on a surface."
            />
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-6 text-sm">
              <div>
                <dt className="spec text-smoke">Digital file</dt>
                <dd className="mt-2">Light-based RGB color, backlit, perfectly flat.</dd>
              </div>
              <div>
                <dt className="spec text-smoke">Finished print</dt>
                <dd className="mt-2">Ink on stock. Paper, finish and preparation shape the result.</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-8">
            <div className="relative mx-auto aspect-[4/3.4] w-full select-none overflow-hidden bg-paper-warm sm:aspect-[16/11]">
              {/* PRINT (base layer) */}
              <div className="absolute inset-0 flex items-center justify-center bg-[#e9e6df]">
                <div className="absolute inset-0 paper-grain opacity-60" aria-hidden />
                <div className="relative h-[82%] rotate-[-2.5deg] shadow-[0_40px_60px_-25px_rgba(0,0,0,0.45),0_1px_3px_rgba(0,0,0,0.12)]" style={{ aspectRatio: "4/5" }}>
                  <Artwork mode="print" />
                  <div className="paper-grain pointer-events-none absolute inset-0 opacity-90 mix-blend-multiply" aria-hidden />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" aria-hidden />
                </div>
                {/* Loupe */}
                <div className="absolute bottom-[8%] right-[6%] hidden size-28 overflow-hidden rounded-full border-4 border-paper shadow-xl sm:block" aria-hidden>
                  <div className="absolute inset-0 bg-[#FAF9F5]" />
                  <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#0898D8 1.6px, transparent 2px), radial-gradient(#E80888 1.6px, transparent 2px), radial-gradient(#F5E10A 1.8px, transparent 2.2px)", backgroundSize: "9px 9px, 9px 9px, 9px 9px", backgroundPosition: "0 0, 3px 4px, 6px 2px", mixBlendMode: "multiply" }} />
                  <span className="spec absolute inset-x-0 bottom-3 text-center text-[0.5rem] text-ink/60">Ink dots</span>
                </div>
                <span className="spec absolute bottom-4 right-4 bg-paper px-2 py-1 sm:hidden">Finished print</span>
              </div>

              {/* SCREEN (top layer, clipped) */}
              <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
                <div className="absolute inset-0 flex flex-col bg-[#1c1c1e]">
                  <div className="flex h-8 items-center gap-1.5 border-b border-white/10 px-3">
                    <span className="size-2.5 rounded-full bg-white/20" />
                    <span className="size-2.5 rounded-full bg-white/20" />
                    <span className="size-2.5 rounded-full bg-white/20" />
                    <span className="spec ml-3 text-white/40">poster_final_v3.pdf · RGB · 100%</span>
                  </div>
                  <div className="relative flex flex-1 items-center justify-center" style={{ backgroundImage: "linear-gradient(45deg,#252527 25%,transparent 25%,transparent 75%,#252527 75%),linear-gradient(45deg,#252527 25%,transparent 25%,transparent 75%,#252527 75%)", backgroundSize: "16px 16px", backgroundPosition: "0 0, 8px 8px" }}>
                    <div className="relative h-[80%]" style={{ aspectRatio: "4/5" }}>
                      <CropMarks className="text-white/40" size={12} gap={4} />
                      <div className="absolute inset-0 shadow-[0_0_40px_rgba(0,183,255,0.18)]">
                        <Artwork mode="screen" />
                      </div>
                      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.12) 1px, transparent 1px)", backgroundSize: "6px 6px" }} aria-hidden />
                    </div>
                  </div>
                </div>
                <span className="spec absolute bottom-4 left-4 bg-ink px-2 py-1 text-paper">Digital file</span>
              </div>

              {/* Handle */}
              <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }} aria-hidden>
                <div className="absolute inset-y-0 -left-px w-0.5 bg-paper shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" />
                <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper shadow-lg">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.6"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" /></svg>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={pos}
                onChange={(e) => setPos(Number(e.target.value))}
                aria-label="Compare digital file and finished print"
                aria-valuetext={`${pos}% digital file`}
                className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
              />
            </div>
            <p className="spec mt-4 text-mute">Illustration only. Final results depend on artwork, stock, finishing and file preparation.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
