"use client";

import { m } from "framer-motion";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/**
 * Four planes that start separated — like colour separations — and slide
 * into a single faceted form when scrolled into view. Inspired by, but never
 * a reproduction of, the GraphInk prism.
 */
export function FacetGlyph({ colors, variant = 0, size = 96, className }: { colors: [string, string, string]; variant?: number; size?: number; className?: string }) {
  const apex = [
    [60, 44],
    [40, 52],
    [52, 64],
    [66, 58],
    [44, 40],
  ][variant % 5];
  const [px, py] = apex;
  const faces = [
    { pts: `0,0 100,0 ${px},${py}`, fill: colors[0], from: { x: 0, y: -18 } },
    { pts: `100,0 100,100 ${px},${py}`, fill: colors[1], from: { x: 18, y: 0 } },
    { pts: `0,100 100,100 ${px},${py}`, fill: "#111111", from: { x: 0, y: 18 } },
    { pts: `0,0 0,100 ${px},${py}`, fill: colors[2], from: { x: -18, y: 0 } },
  ];
  return (
    <m.svg
      viewBox="-20 -20 140 140"
      width={size}
      height={size}
      className={className}
      aria-hidden
      initial="apart"
      whileInView="together"
      whileHover="apart"
      viewport={{ once: false, amount: 0.8 }}
    >
      {faces.map((f, i) => (
        <m.polygon
          key={i}
          points={f.pts}
          fill={f.fill}
          style={{ mixBlendMode: "multiply" }}
          variants={{
            apart: { x: f.from.x, y: f.from.y, opacity: 0.85 },
            together: { x: 0, y: 0, opacity: 1 },
          }}
          transition={{ duration: 0.7, delay: i * 0.05, ease: EASE }}
        />
      ))}
    </m.svg>
  );
}
