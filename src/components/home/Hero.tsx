"use client";

import { ButtonLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { CMYKPatches } from "@/components/brand/PrintMarks";
import { PressVisual } from "./PressVisual";
import { track } from "@/lib/analytics";

const d = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

/** A word printed slightly out of register that snaps into alignment. */
function Registered({ children }: { children: string }) {
  const ghosts = [
    { color: "#00A3E0", rx: "-0.06em", ry: "0.03em", delay: 0.75 },
    { color: "#E5007E", rx: "0.05em", ry: "-0.04em", delay: 0.8 },
    { color: "#FFE500", rx: "-0.03em", ry: "-0.05em", delay: 0.85 },
  ];
  return (
    <span className="relative inline-block">
      {ghosts.map((g, i) => (
        <span
          key={i}
          aria-hidden
          className="gi-reg absolute inset-0 select-none"
          style={{ color: g.color, mixBlendMode: "multiply", "--rx": g.rx, "--ry": g.ry, "--d": `${g.delay}s` } as React.CSSProperties}
        >
          {children}
        </span>
      ))}
      <span className="relative">{children}</span>
    </span>
  );
}

export function Hero() {
  const lines = ["Print that", "makes your", "brand look"];
  return (
    <section className="relative overflow-hidden pb-16 pt-28 md:pb-24 md:pt-36 lg:pt-40" aria-labelledby="hero-title">
      <div className="grid-lines pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)] [--grid-size:64px]" aria-hidden />
      <div className="container-gi relative grid items-end gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="gi-fade-up flex flex-wrap items-center gap-x-5 gap-y-2" style={d(0.05)}>
            <p className="eyebrow text-smoke">Print production · Philippines</p>
            <CMYKPatches />
          </div>

          <h1 id="hero-title" className="mt-8 text-[clamp(3rem,1rem+6.2vw,7rem)] font-semibold uppercase leading-[0.9] tracking-[-0.05em]">
            {lines.map((l, i) => (
              <span key={l} className="block overflow-hidden pb-[0.04em]">
                <span className="gi-rise block" style={d(0.1 + i * 0.07)}>{l}</span>
              </span>
            ))}
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="gi-rise block" style={d(0.31)}>
                <Registered>Serious.</Registered>
              </span>
            </span>
          </h1>

          <div className="gi-fade-up" style={d(0.5)}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-smoke md:text-xl">
              Premium print production for businesses, brands, organizations, and ideas that deserve to be seen.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Magnetic className="block sm:inline-block">
                <ButtonLink href="/quote" size="lg" arrow className="w-full sm:w-auto" onClick={() => track("quote_started", { source: "hero" })}>
                  Get a quote
                </ButtonLink>
              </Magnetic>
              <ButtonLink href="/services" size="lg" variant="secondary">
                Explore services
              </ButtonLink>
            </div>
            <p className="mt-10 flex max-w-md items-start gap-3 border-t border-ink/10 pt-5 text-sm text-smoke">
              <span aria-hidden className="mt-1.5 block size-1.5 shrink-0 bg-gi-magenta" />
              Built for brands, businesses, organizations, and projects that care about the final print.
            </p>
          </div>
        </div>

        <div className="gi-fade-up lg:col-span-5" style={d(0.2)}>
          <PressVisual />
        </div>
      </div>
    </section>
  );
}
