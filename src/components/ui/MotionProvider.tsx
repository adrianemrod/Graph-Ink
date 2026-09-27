"use client";

import { useEffect } from "react";
import { LazyMotion, MotionConfig } from "framer-motion";

const loadFeatures = () => import("./motion-features").then((m) => m.default);

/** Loads animation features lazily and honours prefers-reduced-motion site-wide. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Once the first-visit loader has cleared, later navigations skip its delay.
    const t = setTimeout(() => document.documentElement.classList.add("gi-seen"), 1100);
    return () => clearTimeout(t);
  }, []);
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
