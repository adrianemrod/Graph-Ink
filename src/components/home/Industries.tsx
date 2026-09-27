import { industries, type Industry } from "@/content/industries";
import { accentHex } from "@/components/print/PrintArtwork";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

/** Minimal editorial glyphs — thin rules plus one accent plane. */
function Glyph({ kind, accent }: { kind: Industry["glyph"]; accent: string }) {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.2 };
  const plane = { fill: accent, style: { mixBlendMode: "multiply" as const } };
  const g: Record<Industry["glyph"], React.ReactNode> = {
    grid: (<><rect x="8" y="8" width="48" height="48" {...s} /><path d="M24 8v48M40 8v48M8 24h48M8 40h48" {...s} /><rect x="24" y="24" width="16" height="16" {...plane} /></>),
    stack: (<><rect x="14" y="10" width="36" height="44" {...s} /><rect x="10" y="14" width="36" height="44" {...s} /><polygon points="10,14 46,14 28,34" {...plane} /></>),
    plate: (<><rect x="12" y="6" width="40" height="52" {...s} /><path d="M20 20h24M20 28h18M20 36h24M20 44h14" {...s} /><rect x="40" y="40" width="8" height="8" {...plane} /></>),
    key: (<><path d="M8 50V26l24-16 24 16v24z" {...s} /><rect x="26" y="34" width="12" height="16" {...plane} /></>),
    book: (<><path d="M8 14h20c3 0 4 2 4 4v34c0-2-1-4-4-4H8zM56 14H36c-3 0-4 2-4 4v34c0-2 1-4 4-4h20z" {...s} /><polygon points="36,14 56,14 56,30" {...plane} /></>),
    cross: (<><rect x="10" y="10" width="44" height="44" {...s} /><path d="M26 18h12v8h8v12h-8v8H26v-8h-8V26h8z" {...plane} /></>),
    tag: (<><path d="M8 32 32 8h24v24L32 56z" {...s} /><circle cx="44" cy="20" r="4" {...plane} /></>),
    ticket: (<><path d="M6 18h52v10a4 4 0 0 0 0 8v10H6V36a4 4 0 0 0 0-8z" {...s} /><path d="M22 18v28" {...s} strokeDasharray="2 3" /><rect x="30" y="26" width="18" height="12" {...plane} /></>),
    palette: (<><circle cx="24" cy="28" r="14" {...s} /><circle cx="40" cy="28" r="14" {...s} /><circle cx="32" cy="42" r="14" {...plane} /></>),
    flag: (<><path d="M14 58V6" {...s} /><path d="M14 8h36l-8 12 8 12H14" {...s} /><polygon points="14,8 50,8 42,20 14,20" {...plane} /></>),
    spark: (<><path d="M32 6v52M6 32h52M14 14l36 36M50 14 14 50" {...s} /><polygon points="32,20 44,32 32,44 20,32" {...plane} /></>),
    brief: (<><rect x="8" y="18" width="48" height="36" {...s} /><path d="M24 18v-6h16v6M8 32h48" {...s} /><rect x="28" y="28" width="8" height="8" {...plane} /></>),
  };
  return (
    <svg viewBox="0 0 64 64" width={56} height={56} aria-hidden className="text-ink transition-colors duration-300 group-hover:text-paper">
      {g[kind]}
    </svg>
  );
}

export function Industries() {
  return (
    <section className="py-24 md:py-36" aria-labelledby="industries-title">
      <div className="container-gi">
        <SectionHeading
          index="07"
          eyebrow="Who we serve"
          title={<span id="industries-title">Built for teams that need print done properly.</span>}
          lead="From a founder's first business cards to a corporate team's full kit — the same attention to specification, material and consistency."
        />
        <RevealGroup as="ul" className="mt-16 grid grid-cols-1 gap-px bg-line min-[480px]:grid-cols-2 lg:grid-cols-4" stagger={0.04}>
          {industries.map((ind, i) => (
            <RevealItem as="li" key={ind.id} className="group relative flex min-h-[15rem] flex-col overflow-hidden bg-paper-soft p-6 transition-colors duration-500 hover:bg-ink sm:min-h-[17rem]">
              <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-[var(--ease-press)] group-hover:scale-y-100" style={{ background: `linear-gradient(to top, ${accentHex[ind.accent]}22, transparent 60%)` }} />
              <div className="relative flex items-start justify-between">
                <Glyph kind={ind.glyph} accent={accentHex[ind.accent]} />
                <span className="spec text-mute group-hover:text-paper/50">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="relative mt-auto pt-8">
                <h3 className="text-xl font-semibold uppercase tracking-[-0.02em] transition-colors group-hover:text-paper">{ind.name}</h3>
                <p className="mt-2 text-sm text-smoke transition-colors group-hover:text-paper/70">{ind.line}</p>
                <p className="spec mt-4 text-mute transition-colors group-hover:text-paper/60">{ind.prints.join(" · ")}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
