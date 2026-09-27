import type { BrandLogo } from "@/lib/brand";
import { Logo } from "@/components/brand/Logo";
import { RegistrationMark } from "@/components/brand/PrintMarks";

/**
 * First-visit loader (~0.95s, pure CSS). Registration marks appear, the four
 * process plates slide into register, then the logo lands. Skipped on repeat
 * visits in the same session and for reduced-motion users. It never waits on
 * JavaScript or network — content is already rendered underneath.
 */
export function PageLoader({ logo }: { logo: BrandLogo }) {
  const plates = [
    { c: "bg-process-c", dx: "-18px", dy: "0px" },
    { c: "bg-process-m", dx: "18px", dy: "0px" },
    { c: "bg-process-y", dx: "0px", dy: "-18px" },
    { c: "bg-process-k", dx: "0px", dy: "18px" },
  ];
  return (
    <div className="gi-loader" aria-hidden>
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative flex items-center gap-8 text-ink/50">
          <RegistrationMark size={20} className="gi-loader__mark" />
          <div className="flex gap-1">
            {plates.map((p, i) => (
              <span key={i} className={`gi-loader__plate block h-8 w-2 ${p.c}`} style={{ "--dx": p.dx, "--dy": p.dy, animationDelay: `${i * 0.06}s`, mixBlendMode: "multiply" } as React.CSSProperties} />
            ))}
          </div>
          <RegistrationMark size={20} className="gi-loader__mark" />
        </div>
        <div className="gi-loader__brand">
          <Logo logo={logo} height={44} />
        </div>
      </div>
    </div>
  );
}

/** Inline script: mark the session as seen so the loader is skipped afterwards. */
export const loaderScript = `try{if(sessionStorage.getItem('gi-seen')){document.documentElement.classList.add('gi-seen')}else{sessionStorage.setItem('gi-seen','1')}}catch(e){}`;
