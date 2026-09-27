import Link from "next/link";
import { availableProducts, getCategory, type Product } from "@/content/services";
import { accentHex } from "@/components/print/PrintArtwork";
import { ArrowUpRight } from "@/components/ui/Icons";

/** Editorial index of everything GraphInk prints. Each row starts a quote. */
export function ProductIndex({ items = availableProducts, showCategory = true }: { items?: Product[]; showCategory?: boolean }) {
  return (
    <ul className="grid border-t border-line md:grid-cols-2 md:gap-x-10 xl:grid-cols-3">
      {items.map((p, i) => (
        <li key={p.id} className="border-b border-line">
          <Link href={`/quote?product=${p.id}`} className="group relative flex items-start gap-4 py-5 pr-8 transition-colors">
            <span className="spec w-6 pt-1.5 text-mute">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1">
              <span className="flex items-center gap-3">
                <span aria-hidden className="block h-3 w-0 transition-[width] duration-300 ease-[var(--ease-press)] group-hover:w-3" style={{ background: accentHex[p.accent] }} />
                <span className="text-lg font-semibold tracking-[-0.02em]">{p.name}</span>
              </span>
              <span className="mt-1 block text-sm text-smoke">{p.description}</span>
              {showCategory && <span className="spec mt-2 block text-mute">{getCategory(p.category)?.shortName} · {p.useCase}</span>}
            </span>
            <ArrowUpRight size={18} className="absolute right-0 top-6 text-mute transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
            <span className="sr-only">— request a quote</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
