"use client";

import { useRef } from "react";
import { m, useScroll, useSpring } from "framer-motion";
import { processSteps } from "@/content/process";
import { cn } from "@/lib/cn";

const dots = ["#0898D8", "#E80888", "#F8E808", "#111111", "#E87818", "#089848"];

/** Six steps with a progress line that fills as the section scrolls past. */
export function ProcessSteps({ detailed = false, tone = "light" }: { detailed?: boolean; tone?: "light" | "dark" }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const scale = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const dark = tone === "dark";

  return (
    <ol ref={ref} className="relative grid gap-0 md:grid-cols-3 xl:grid-cols-6">
      {/* track + fill: vertical on mobile, horizontal from md */}
      <span aria-hidden className={cn("absolute bottom-0 left-[7px] top-0 w-px md:hidden", dark ? "bg-paper/15" : "bg-ink/10")} />
      <m.span aria-hidden className="spectrum-bar absolute left-[6px] top-0 h-full w-[3px] origin-top md:hidden" style={{ scaleY: scale }} />
      <span aria-hidden className={cn("absolute inset-x-0 top-[7px] hidden h-px xl:block", dark ? "bg-paper/15" : "bg-ink/10")} />
      <m.span aria-hidden className="spectrum-bar absolute inset-x-0 top-[6px] hidden h-[3px] origin-left xl:block" style={{ scaleX: scale }} />

      {processSteps.map((s, i) => (
        <li key={s.n} className="relative pb-10 pl-10 md:pl-0 md:pr-8 md:pt-0 xl:pt-10">
          <span aria-hidden className={cn("absolute left-0 top-0.5 block size-[15px] border-2 md:relative md:mb-6 xl:absolute xl:mb-0", dark ? "border-ink" : "border-paper-soft")} style={{ background: dots[i] === "#111111" && dark ? "#F7F7F5" : dots[i] }} />
          <p className={cn("spec", dark ? "text-paper/50" : "text-smoke")}>Step {s.n}</p>
          <h3 className={cn("mt-3 text-xl font-semibold uppercase leading-tight tracking-[-0.02em]", dark && "text-paper")}>{s.title}</h3>
          <p className={cn("mt-3 text-sm leading-relaxed", dark ? "text-paper/65" : "text-smoke")}>{s.body}</p>
          {detailed && <p className={cn("mt-3 text-sm leading-relaxed", dark ? "text-paper/45" : "text-mute")}>{s.detail}</p>}
        </li>
      ))}
    </ol>
  );
}
