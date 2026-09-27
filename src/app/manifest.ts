import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.brandName,
    short_name: "GraphInk",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F7F7F5",
    theme_color: "#111111",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
