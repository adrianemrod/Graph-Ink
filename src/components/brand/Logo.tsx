import Image from "next/image";
import { siteConfig } from "@/config/site";
import type { BrandLogo } from "@/lib/brand";
import { cn } from "@/lib/cn";

/**
 * Renders the official GraphInk Media logo exactly as supplied — no redraw,
 * recolor, crop or distortion (width is derived from its intrinsic ratio).
 * On dark surfaces it sits on a white "paper tile" so a JPEG's own background
 * stays intact. If the file hasn't been added yet, the brand name is shown as
 * plain text: we never substitute an invented mark.
 */
export function Logo({
  logo,
  height = 36,
  surface = "light",
  priority = false,
  className,
}: {
  logo: BrandLogo;
  height?: number;
  surface?: "light" | "dark";
  priority?: boolean;
  className?: string;
}) {
  if (!logo) {
    return (
      <span
        className={cn(
          "inline-flex items-baseline gap-[0.35em] font-sans font-semibold uppercase leading-none tracking-[-0.02em]",
          surface === "dark" ? "text-paper" : "text-ink",
          className,
        )}
        style={{ fontSize: Math.round(height * 0.5) }}
      >
        <span>GraphInk</span>
        <span className="font-normal opacity-60">Media</span>
      </span>
    );
  }

  const width = Math.round((logo.width / logo.height) * height);
  const img = (
    <Image
      src={logo.src}
      alt={logo.alt || siteConfig.logo.alt}
      width={width}
      height={height}
      priority={priority}
      quality={90}
      className="block h-auto max-w-none"
      style={{ width, height }}
      unoptimized={logo.src.endsWith(".svg")}
    />
  );

  if (surface === "dark") {
    return <span className={cn("inline-block rounded-xs bg-paper p-2", className)}>{img}</span>;
  }
  return <span className={cn("inline-block", className)}>{img}</span>;
}
