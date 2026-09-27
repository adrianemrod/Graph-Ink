import Link from "next/link";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { CMYKPatches } from "@/components/brand/PrintMarks";

/** Consistent inner-page header: breadcrumb, eyebrow, big title, lead. */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs = [],
  children,
  aside,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  crumbs?: { label: string; href: string }[];
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44">
      <div className="grid-lines pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_90%)] [--grid-size:64px]" aria-hidden />
      <div className="container-gi relative">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="spec flex flex-wrap items-center gap-2 text-smoke">
              <li><Link href="/" className="link-draw hover:text-ink">Home</Link></li>
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-2">
                  <span aria-hidden>/</span>
                  {i === crumbs.length - 1 ? <span aria-current="page" className="text-ink">{c.label}</span> : <Link href={c.href} className="link-draw hover:text-ink">{c.label}</Link>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className={aside ? "lg:col-span-7" : "lg:col-span-10"}>
            <div className="flex flex-wrap items-center gap-5">
              <Eyebrow>{eyebrow}</Eyebrow>
              <CMYKPatches labels={false} />
            </div>
            <h1 className={`mt-8 font-semibold ${aside ? "text-[clamp(2.4rem,1rem+4.2vw,5rem)]" : "text-[clamp(2.6rem,1rem+5.4vw,6.25rem)]"} uppercase leading-[0.92] tracking-[-0.05em] text-balance`}>{title}</h1>
            {lead && <p className="mt-8 max-w-2xl text-lg leading-relaxed text-smoke md:text-xl">{lead}</p>}
            {children}
          </div>
          {aside && <div className="lg:col-span-5">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
