"use client";

import { useRef, useState } from "react";
import { AnimatePresence, m, useMotionValue, useSpring, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import { materials, type Material } from "@/content/materials";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CropMarks } from "@/components/brand/PrintMarks";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** How the surface changes the same ink — honest, relative differences only. */
const inkOnSurface: Record<Material["texture"], string> = {
  natural: "saturate(0.78) contrast(0.92) brightness(1.02)",
  smooth: "saturate(1.02) contrast(1.02)",
  matte: "saturate(0.92) contrast(0.97)",
  gloss: "saturate(1.12) contrast(1.06)",
  linen: "saturate(0.88) contrast(0.96)",
  tooth: "saturate(0.9) contrast(0.98)",
  heavy: "saturate(0.96)",
  pearl: "saturate(1) contrast(1.02)",
};

function SurfaceLayer({ texture, glossX }: { texture: Material["texture"]; glossX: MotionValue<string> }) {
  switch (texture) {
    case "natural":
      return <div className="paper-grain absolute inset-0 opacity-90 mix-blend-multiply [background-size:120px]" />;
    case "tooth":
      return <div className="paper-grain absolute inset-0 opacity-70 mix-blend-multiply [background-size:90px]" />;
    case "linen":
      return (
        <div
          className="absolute inset-0 opacity-60 mix-blend-multiply"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.035) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.035) 0 1px, transparent 1px 3px)",
          }}
        />
      );
    case "gloss":
      return <m.div className="absolute inset-0 mix-blend-screen" style={{ backgroundImage: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.75) 45%, transparent 60%)", backgroundSize: "250% 100%", backgroundPositionX: glossX }} />;
    case "pearl":
      return <m.div className="absolute inset-0 opacity-40 mix-blend-soft-light" style={{ backgroundImage: "linear-gradient(115deg, #ffd6f0, #d6f0ff, #fff6c9, #e2d6ff, #ffd6f0)", backgroundSize: "250% 100%", backgroundPositionX: glossX }} />;
    case "matte":
      return <div className="paper-grain absolute inset-0 opacity-30 mix-blend-multiply" />;
    default:
      return null;
  }
}

function Sample({ material }: { material: Material }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [5, -5]), { stiffness: 120, damping: 16 });
  const ry = useSpring(useTransform(px, [0, 1], [-7, 7]), { stiffness: 120, damping: 16 });
  const glossX = useTransform(px, [0, 1], ["90%", "10%"]);

  function onMove(e: React.PointerEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }

  const heavy = material.texture === "heavy" || material.id === "premium";

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={() => { px.set(0.5); py.set(0.5); }} className="relative flex h-full items-center justify-center [perspective:1200px]">
      <m.div style={{ rotateX: rx, rotateY: ry }} className="relative aspect-[3/4] w-[62%] max-w-[340px] [transform-style:preserve-3d]">
        <CropMarks size={14} gap={5} className="text-ink/30" />
        {/* thickness */}
        {heavy && <div className="absolute inset-0 translate-x-[3px] translate-y-[4px] bg-[#e7e4dc]" style={{ transform: "translateZ(-4px)" }} />}
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={material.id}
            className="absolute inset-0 overflow-hidden shadow-[0_40px_60px_-30px_rgba(0,0,0,0.45),0_2px_4px_rgba(0,0,0,0.08)]"
            style={{ background: material.tone }}
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -20, rotate: 2 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" style={{ filter: inkOnSurface[material.texture] }} aria-hidden>
              <g style={{ mixBlendMode: "multiply" }}>
                <polygon points="30,40 190,30 140,200" fill="#0898D8" />
                <polygon points="110,34 270,80 170,220" fill="#E80888" />
                <polygon points="50,140 250,136 150,250" fill="#F8E808" />
              </g>
              <rect x="30" y="286" width="180" height="16" fill="#111" />
              <rect x="30" y="308" width="120" height="16" fill="#111" />
              <g fill="#111" opacity="0.4"><rect x="30" y="346" width="200" height="3" /><rect x="30" y="355" width="170" height="3" /><rect x="30" y="364" width="120" height="3" /></g>
            </svg>
            <SurfaceLayer texture={material.texture} glossX={glossX} />
          </m.div>
        </AnimatePresence>
      </m.div>
    </div>
  );
}

export function MaterialShowcase() {
  const [activeId, setActiveId] = useState(materials[2].id);
  const active = materials.find((mm) => mm.id === activeId) ?? materials[0];

  function onKey(e: React.KeyboardEvent, i: number) {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = materials[(i + dir + materials.length) % materials.length];
    setActiveId(next.id);
    document.getElementById(`mat-tab-${next.id}`)?.focus();
  }

  return (
    <section className="relative overflow-hidden bg-paper-warm py-24 md:py-36" aria-labelledby="materials-title">
      <div className="container-gi">
        <SectionHeading
          index="05"
          eyebrow="Paper & material"
          title={<span id="materials-title">Your brand should feel as good as it looks.</span>}
          lead="The same artwork reads differently on every stock. Explore how surface changes the way a piece looks and feels — then let us help you choose."
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="relative h-[420px] bg-paper-soft sm:h-[520px] lg:col-span-7 lg:h-[600px]">
            <div className="grid-lines absolute inset-0 [--grid-size:40px]" aria-hidden />
            <Sample material={active} />
            <p className="spec absolute bottom-4 left-4 text-mute">Illustrative sample · {active.name}</p>
          </div>

          <div className="flex flex-col lg:col-span-5">
            <div role="tabpanel" id={`mat-panel-${active.id}`} aria-labelledby={`mat-tab-${active.id}`} className="flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <m.div key={active.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }}>
                  <p className="spec text-smoke">{active.finish}</p>
                  <h3 className="mt-3 text-[clamp(2.25rem,1.5rem+2.5vw,3.75rem)] font-semibold uppercase leading-none tracking-[-0.04em]">{active.name}</h3>
                  <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
                    <div className="grid grid-cols-[7.5rem_1fr] gap-4 py-4">
                      <dt className="spec pt-1 text-smoke">How it feels</dt>
                      <dd>{active.feels}</dd>
                    </div>
                    <div className="grid grid-cols-[7.5rem_1fr] gap-4 py-4">
                      <dt className="spec pt-1 text-smoke">How it looks</dt>
                      <dd>{active.looks}</dd>
                    </div>
                    <div className="grid grid-cols-[7.5rem_1fr] gap-4 py-4">
                      <dt className="spec pt-1 text-smoke">Best used for</dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {active.bestFor.map((b) => (
                          <span key={b} className="border border-ink/15 bg-paper/60 px-2 py-0.5 text-sm">{b}</span>
                        ))}
                      </dd>
                    </div>
                    <div className="grid grid-cols-[7.5rem_1fr] gap-4 py-4">
                      <dt className="spec pt-1 text-smoke">Weight</dt>
                      <dd className="text-smoke">{active.weight || "Options confirmed at quotation"}</dd>
                    </div>
                  </dl>
                </m.div>
              </AnimatePresence>
            </div>

            <div role="tablist" aria-label="Paper types" className="mt-8 grid grid-cols-4 gap-2">
              {materials.map((mat, i) => {
                const selected = mat.id === active.id;
                return (
                  <button
                    key={mat.id}
                    id={`mat-tab-${mat.id}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls={`mat-panel-${mat.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveId(mat.id)}
                    onMouseEnter={() => setActiveId(mat.id)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={cn(
                      "group relative flex aspect-[3/4] flex-col justify-end overflow-hidden p-2 text-left transition-all duration-300 ease-[var(--ease-press)]",
                      selected ? "-translate-y-1.5 shadow-[0_16px_30px_-16px_rgba(0,0,0,0.45)] ring-1 ring-ink" : "shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:-translate-y-1",
                    )}
                    style={{ background: mat.tone }}
                  >
                    <span aria-hidden className={cn("absolute inset-0", mat.texture === "linen" ? "opacity-60" : "paper-grain opacity-50")} style={mat.texture === "linen" ? { backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0 1px, transparent 1px 3px)" } : undefined} />
                    {mat.texture === "gloss" && <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/80 to-white/0" />}
                    {mat.texture === "pearl" && <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#ffd6f0]/50 via-[#d6f0ff]/50 to-[#fff6c9]/50" />}
                    <span className="relative text-[0.6875rem] font-semibold uppercase leading-tight tracking-[0.04em] sm:text-xs">{mat.name}</span>
                    {selected && <m.span layoutId="mat-indicator" className="spectrum-bar absolute inset-x-0 top-0 h-[3px]" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ButtonLink href="/quote" arrow>Ask for a paper recommendation</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
