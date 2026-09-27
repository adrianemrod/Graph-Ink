import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { serviceCategories } from "@/content/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: [string, number][] = [
    ["/", 1],
    ["/services", 0.9],
    ["/quote", 0.9],
    ["/portfolio", 0.7],
    ["/process", 0.7],
    ["/about", 0.6],
    ["/faq", 0.6],
    ["/contact", 0.7],
    ["/privacy", 0.2],
    ["/terms", 0.2],
    ...serviceCategories.map((s) => [`/services/${s.slug}`, 0.8] as [string, number]),
  ];
  return routes.map(([path, priority]) => ({ url: `${siteConfig.url}${path === "/" ? "" : path}`, lastModified: now, changeFrequency: "monthly", priority }));
}
