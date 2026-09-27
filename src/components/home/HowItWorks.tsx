import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProcessSteps } from "./ProcessSteps";
import { ButtonLink } from "@/components/ui/Button";

export function HowItWorks() {
  return (
    <section className="bg-paper py-24 md:py-36" aria-labelledby="how-title">
      <div className="container-gi">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading index="09" eyebrow="How it works" title={<span id="how-title">Six steps. No guesswork.</span>} lead="A clear path from your first message to a finished order — with your approval before anything goes to press." />
          <ButtonLink href="/contact" variant="secondary" arrow className="shrink-0">Talk to GraphInk</ButtonLink>
        </div>
        <div className="mt-20">
          <ProcessSteps />
        </div>
      </div>
    </section>
  );
}
