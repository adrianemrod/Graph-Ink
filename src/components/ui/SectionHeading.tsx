import { cn } from "@/lib/cn";

export function Eyebrow({ index, children, className, tone = "dark" }: { index?: string; children: React.ReactNode; className?: string; tone?: "dark" | "light" }) {
  return (
    <p className={cn("eyebrow flex items-center gap-3", tone === "dark" ? "text-smoke" : "text-paper/60", className)}>
      {index && <span className={tone === "dark" ? "text-ink" : "text-paper"}>{index}</span>}
      <span aria-hidden className={cn("h-px w-8", tone === "dark" ? "bg-ink/30" : "bg-paper/30")} />
      <span>{children}</span>
    </p>
  );
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  lead,
  tone = "dark",
  align = "left",
  className,
  as: Tag = "h2",
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <header className={cn("max-w-4xl", align === "center" && "mx-auto text-center [&_p.eyebrow]:justify-center", className)}>
      <Eyebrow index={index} tone={tone}>{eyebrow}</Eyebrow>
      <Tag className={cn("mt-6 text-headline font-semibold uppercase text-balance", tone === "light" && "text-paper")}>{title}</Tag>
      {lead && <p className={cn("mt-6 max-w-2xl text-lg leading-relaxed text-pretty", tone === "dark" ? "text-smoke" : "text-paper/70", align === "center" && "mx-auto")}>{lead}</p>}
    </header>
  );
}
