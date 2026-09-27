import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = siteConfig.seo.defaultTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const spectrum = ["#0898D8", "#085888", "#582888", "#E80888", "#E87818", "#F8E808", "#089848"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#F7F7F5", color: "#111111", padding: 72, position: "relative" }}>
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 12 }}>
          {spectrum.map((c) => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#6b6b66" }}>{siteConfig.brandWordmark} · Print production · Philippines</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 56, fontSize: 104, fontWeight: 700, lineHeight: 0.92, letterSpacing: -4, textTransform: "uppercase" }}>
          <span>Print that makes</span>
          <span>your brand look</span>
          <span>serious.</span>
        </div>
        <div style={{ display: "flex", marginTop: "auto", alignItems: "center", justifyContent: "space-between", fontSize: 24, color: "#6b6b66" }}>
          <span>{siteConfig.tagline}</span>
          <div style={{ display: "flex", gap: 10 }}>
            {["#00A3E0", "#E5007E", "#FFE500", "#1A1A1A"].map((c) => (
              <div key={c} style={{ width: 28, height: 28, background: c }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
