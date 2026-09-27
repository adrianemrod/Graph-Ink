import { pillars } from "@/content/brand";
import { accentHex } from "@/components/print/PrintArtwork";
import { FacetGlyph } from "@/components/brand/FacetGlyph";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import type { Accent } from "@/content/services";

const trio = (a: Accent): [string, string, string] => {
  const map: Record<string, [string, string, string]> = {
    cyan: ["#0898D8", "#085888", "#0898D8"],
    magenta: ["#E80888", "#A81868", "#E87818"],
    yellow: ["#F8E808", "#E87818", "#F8E808"],
    green: ["#089848", "#0898D8", "#F8E808"],
    purple: ["#582888", "#E80888", "#0898D8"],
  };
  return map[a] ?? [accentHex[a], accentHex[a], accentHex[a]];
};

export function Difference() {
  return (
    <section className="relative bg-paper py-24 md:py-36" aria-labelledby="difference-title">
      <div className="container-gi">
        <SectionHeading
          index="04"
          eyebrow="The GraphInk difference"
          title={<span id="difference-title">Good design deserves good print.</span>}
          lead="A strong file can still become a weak print. We focus on the part that happens after the design is approved — so what arrives looks like what you intended."
        />
        <RevealGroup as="ol" className="mt-20 grid border-t border-line sm:grid-cols-2 lg:grid-cols-5">
          {pillars.map((p, i) => (
            <RevealItem as="li" key={p.title} className="group relative border-b border-line py-10 sm:px-6 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0 lg:[&:nth-child(odd)]:border-r lg:first:pl-0">
              <div className="flex items-start justify-between">
                <FacetGlyph colors={trio(p.accent)} variant={i} size={88} />
                <span className="spec text-mute">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-10 text-2xl font-semibold uppercase tracking-[-0.03em]">{p.title}</h3>
              <p className="mt-3 text-smoke">{p.body}</p>
              <span aria-hidden className="absolute bottom-0 left-0 h-[3px] w-0 transition-[width] duration-500 ease-[var(--ease-press)] group-hover:w-full" style={{ background: accentHex[p.accent] }} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
