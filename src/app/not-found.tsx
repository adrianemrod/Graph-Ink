import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { CropMarks, RegistrationMark } from "@/components/brand/PrintMarks";

export default function NotFound() {
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden pb-20 pt-32">
      <div className="grid-lines pointer-events-none absolute inset-0 [--grid-size:64px]" aria-hidden />
      <div className="container-gi relative grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="spec text-smoke">Error 404 · Missing sheet</p>
          <h1 className="mt-6 text-[clamp(2.6rem,1rem+5.6vw,6.5rem)] font-semibold uppercase leading-[0.92] tracking-[-0.05em]">This page didn&apos;t make it to press.</h1>
          <p className="mt-6 max-w-lg text-lg text-smoke">Let&apos;s get you back to the main sheet.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/" arrow>Back to GraphInk</ButtonLink>
            <ButtonLink href="/quote" variant="secondary">Request a quote</ButtonLink>
          </div>
          <nav aria-label="Popular pages" className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {[["Services", "/services"], ["Work", "/portfolio"], ["Process", "/process"], ["FAQ", "/faq"], ["Contact", "/contact"]].map(([l, h]) => (
              <Link key={h} href={h} className="link-draw text-smoke hover:text-ink">{l}</Link>
            ))}
          </nav>
        </div>
        <div className="lg:col-span-5" aria-hidden>
          <div className="relative mx-auto aspect-[3/4] w-3/4 max-w-xs">
            <CropMarks size={16} gap={6} />
            <div className="absolute inset-0 border border-dashed border-ink/25 bg-paper/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[7rem] font-semibold leading-none tracking-[-0.06em] text-ink/10">404</span>
            </div>
            <RegistrationMark size={18} className="absolute -left-10 top-1/2 text-ink/30" />
            <RegistrationMark size={18} className="absolute -right-10 top-1/2 text-ink/30" />
          </div>
        </div>
      </div>
    </section>
  );
}
