"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, m, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { journeyStages } from "@/content/process";
import { JourneyScene } from "./JourneyScenes";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { CropMarks } from "@/components/brand/PrintMarks";
import { cn } from "@/lib/cn";

const stageColors = ["#F7F7F5", "#0898D8", "#E80888", "#F8E808", "#E87818", "#089848"];
const EASE = [0.2, 0.8, 0.2, 1] as const;

/**
 * Signature section. Scrolling through the pinned stage advances the job
 * from brief to delivery. Each stage can also be selected directly.
 */
export function PrintJourney() {
  const ref = useRef<HTMLElement>(null);
  const uid = useId().replace(/:/g, "");
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const n = journeyStages.length;

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(v * n * 0.999)));
    if (i !== active) setActive(i);
  });

  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (span * (i + 0.5)) / n, behavior: "smooth" });
  }

  const stage = journeyStages[active];

  return (
    <section ref={ref} data-nav="dark" className="relative bg-ink text-paper" style={{ height: `${n * 75}svh` }} aria-labelledby="journey-title">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <div className="grid-lines pointer-events-none absolute inset-0 [--grid-color:rgba(255,255,255,0.035)] [--grid-size:56px]" aria-hidden />
        <div className="container-gi relative grid flex-1 grid-rows-[auto_1fr_auto] gap-5 pb-24 pt-20 md:pb-6 md:pt-24 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-10 lg:py-0">
          {/* Left: heading + stages */}
          <div className="lg:col-span-5">
            <Eyebrow index="02" tone="light">The GraphInk workflow</Eyebrow>
            <h2 id="journey-title" className="mt-4 text-[clamp(1.9rem,1rem+3.4vw,4.25rem)] font-semibold uppercase leading-[0.95] tracking-[-0.04em] lg:mt-6">
              From idea to finished print.
            </h2>

            <ol className="mt-10 hidden border-t border-paper/10 lg:block">
              {journeyStages.map((s, i) => (
                <li key={s.key} className="border-b border-paper/10">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === active ? "step" : undefined}
                    className={cn("group flex w-full items-center gap-5 py-3.5 text-left transition-colors", i === active ? "text-paper" : "text-paper/35 hover:text-paper/70")}
                  >
                    <span className="spec w-6">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-xl font-semibold uppercase tracking-[-0.02em]">{s.label}</span>
                    <span className="ml-auto block h-2 w-2 transition-transform duration-300" style={{ background: stageColors[i], transform: i === active ? "scale(1)" : "scale(0)" }} />
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Right: scene */}
          <div className="relative min-h-0 lg:col-span-7 lg:h-[64vh]">
            <div className="relative h-full min-h-[220px] w-full">
              <CropMarks className="text-paper/25" size={18} gap={6} />
              <div className="absolute inset-0 overflow-hidden bg-charcoal/60">
                <AnimatePresence mode="popLayout" initial={false}>
                  <m.div
                    key={active}
                    className="absolute inset-0 p-4 sm:p-8"
                    initial={{ opacity: 0, x: 60, rotate: 1.2 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    exit={{ opacity: 0, x: -60, rotate: -1.2 }}
                    transition={{ duration: 0.55, ease: EASE }}
                  >
                    <JourneyScene index={active} uid={uid} />
                  </m.div>
                </AnimatePresence>
              </div>
              <div className="absolute left-3 top-3 flex items-center gap-2 sm:left-4 sm:top-4">
                <span className="block size-2" style={{ background: stageColors[active] }} />
                <span className="spec text-paper/60">Stage {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
              </div>
              <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
                <span className="spec text-paper/40">Sheet becomes → {stage.product}</span>
              </div>
            </div>
          </div>

          {/* Caption + progress */}
          <div className="lg:absolute lg:inset-x-0 lg:bottom-8">
            <div className="lg:container-gi lg:grid lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7 lg:col-start-6">
                <div className="flex items-end justify-between gap-6">
                  <div className="min-h-[4.5rem]" aria-live="polite">
                    <p className="text-lg font-semibold uppercase tracking-[-0.01em] lg:hidden">
                      <span className="spec mr-2 text-paper/50">{String(active + 1).padStart(2, "0")}</span>
                      {stage.label}
                    </p>
                    <p className="text-base font-semibold text-paper md:text-lg">{stage.title}</p>
                    <p className="mt-1 max-w-md text-sm text-paper/60 md:text-base">{stage.body}</p>
                  </div>
                </div>
                <div className="mt-4 h-[3px] w-full bg-paper/10">
                  <m.div className="spectrum-bar h-full origin-left" style={{ scaleX: progress }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
