import { standards } from "@/content/brand";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Check } from "@/components/ui/Icons";

export function Standards() {
  return (
    <section className="py-24 md:py-36" aria-labelledby="standards-title">
      <div className="container-gi grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeading
              index="10"
              eyebrow="Our standards"
              title={<span id="standards-title">When the details matter, print them properly.</span>}
              lead="We're a new name, so we'd rather show you how we work than tell you who we've worked with. These are the standards every order follows."
            />
          </div>
        </div>
        <RevealGroup as="ul" className="border-t border-ink/15 lg:col-span-7">
          {standards.map((s, i) => (
            <RevealItem as="li" key={s.title} className="group grid grid-cols-[3rem_1fr_auto] items-start gap-4 border-b border-ink/15 py-7">
              <span className="spec pt-1.5 text-mute">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.02em] md:text-2xl">{s.title}</h3>
                <p className="mt-2 text-smoke">{s.body}</p>
              </div>
              <span className="mt-1 flex size-8 items-center justify-center border border-ink/15 text-ink transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                <Check size={16} />
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
