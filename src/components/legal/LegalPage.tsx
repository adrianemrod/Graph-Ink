import { PageHero } from "@/components/page/PageHero";
import { siteConfig } from "@/config/site";

export function LegalPage({ title, path, sections }: { title: string; path: string; sections: { h: string; p: string[] }[] }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} lead={`Last updated ${new Date(siteConfig.legal.lastUpdated).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}.`} crumbs={[{ label: title, href: path }]} />
      <section className="pb-24 md:pb-36">
        <div className="container-gi grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="mb-12 border-l-4 border-gi-yellow bg-paper p-5 text-sm text-smoke">
              This is a starting template written in plain language. Have it reviewed against the Philippine Data Privacy Act of 2012 (RA 10173) and your actual business practices before relying on it.
            </p>
            <div className="space-y-12">
              {sections.map((s, i) => (
                <section key={s.h}>
                  <h2 className="flex items-baseline gap-4 text-2xl font-semibold tracking-[-0.02em]">
                    <span className="spec text-mute">{String(i + 1).padStart(2, "0")}</span>
                    {s.h}
                  </h2>
                  {s.p.map((p) => (
                    <p key={p} className="mt-4 max-w-2xl leading-relaxed text-smoke">{p}</p>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
