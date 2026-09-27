import Link from "next/link";
import type { ServiceCategory } from "@/content/services";
import { PrintArtwork, accentHex } from "@/components/print/PrintArtwork";
import { CropMarks } from "@/components/brand/PrintMarks";
import { ArrowRight } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

export function ServiceCard({ service, className, large = false }: { service: ServiceCategory; className?: string; large?: boolean }) {
  return (
    <Link href={`/services/${service.slug}`} className={cn("group relative flex flex-col bg-paper p-5 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(17,17,17,0.35)] sm:p-7", className)}>
      <div className="flex items-center justify-between">
        <span className="spec text-smoke">{service.index} / Service</span>
        <span className="block size-2.5 transition-transform duration-500 group-hover:rotate-45" style={{ background: accentHex[service.accent] }} aria-hidden />
      </div>
      <div className={cn("relative mt-6 bg-paper-soft", large ? "aspect-[16/11]" : "aspect-[4/3]")}>
        <CropMarks className="opacity-0 transition-opacity duration-500 group-hover:opacity-100" size={12} gap={4} />
        <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-press)] group-hover:-translate-y-1.5 group-hover:rotate-[-1deg] group-hover:scale-[1.02]">
          <PrintArtwork kind={service.art} accent={service.accent} className="h-full w-full" />
        </div>
      </div>
      <h3 className="mt-7 text-title font-semibold uppercase">{service.name}</h3>
      <p className="mt-3 text-smoke">{service.summary}</p>
      <p className="mt-5 border-t border-line pt-4 text-sm"><span className="spec mr-2 text-smoke">For</span>{service.useCase}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em]">
        View service
        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
      </span>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 ease-[var(--ease-press)] group-hover:scale-x-100" style={{ background: accentHex[service.accent] }} />
    </Link>
  );
}
