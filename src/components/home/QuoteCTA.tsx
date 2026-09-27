import { contactLinks } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { RegistrationMark } from "@/components/brand/PrintMarks";
import { Reveal } from "@/components/ui/Reveal";

export function QuoteCTA({ title = "Ready to put it on paper?", lead = "Tell us what you're printing, how many you need, and when you need it." }: { title?: string; lead?: string }) {
  const links = contactLinks();
  const message = links.messenger?.href ?? "/contact";
  return (
    <section data-nav="dark" className="relative overflow-hidden bg-ink py-24 text-paper md:py-40" aria-labelledby="cta-title">
      <div className="grid-lines pointer-events-none absolute inset-0 [--grid-color:rgba(255,255,255,0.035)] [--grid-size:64px]" aria-hidden />
      {/* Spectrum sweep */}
      <div aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 opacity-40">
        <div className="spectrum-flow h-full w-full" />
      </div>
      <div className="container-gi relative">
        <div className="flex items-center justify-between text-paper/30">
          <RegistrationMark size={18} />
          <span className="spec">Ready for press</span>
          <RegistrationMark size={18} />
        </div>
        <Reveal className="mx-auto mt-16 max-w-5xl text-center">
          <h2 id="cta-title" className="text-[clamp(2.6rem,1rem+6.5vw,7.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.05em] text-balance">{title}</h2>
          <p className="mx-auto mt-8 max-w-xl text-lg text-paper/65">{lead}</p>
          <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
            <Magnetic className="block sm:inline-block">
              <ButtonLink href="/quote" variant="light" size="lg" arrow className="w-full sm:w-auto">Request a quote</ButtonLink>
            </Magnetic>
            <ButtonLink href={message} variant="outline-light" size="lg">Message GraphInk</ButtonLink>
          </div>
        </Reveal>
        <div className="mt-20 h-1 w-full">
          <div className="spectrum-flow h-full w-full" />
        </div>
      </div>
    </section>
  );
}
