import "server-only";
import fs from "node:fs";
import path from "node:path";
import { siteConfig } from "@/config/site";

export type BrandLogo = { src: string; width: number; height: number; alt: string } | null;

const EXTENSIONS = ["svg", "png", "webp", "jpeg", "jpg"] as const;

/** Reads intrinsic dimensions from the file header so the logo renders without layout shift. */
function readDimensions(buf: Buffer, ext: string): { width: number; height: number } | null {
  try {
    if (ext === "png" && buf.toString("ascii", 1, 4) === "PNG") {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (ext === "webp" && buf.toString("ascii", 8, 12) === "WEBP") {
      const chunk = buf.toString("ascii", 12, 16);
      if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (chunk === "VP8L") {
        const b = buf.readUInt32LE(21);
        return { width: 1 + (b & 0x3fff), height: 1 + ((b >> 14) & 0x3fff) };
      }
    }
    if (ext === "jpeg" || ext === "jpg") {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) return null;
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        i += 2 + len;
      }
    }
    if (ext === "svg") {
      const text = buf.toString("utf8");
      const vb = text.match(/viewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
      if (vb) return { width: parseFloat(vb[1]), height: parseFloat(vb[2]) };
      const w = text.match(/\swidth=["']([\d.]+)/);
      const h = text.match(/\sheight=["']([\d.]+)/);
      if (w && h) return { width: parseFloat(w[1]), height: parseFloat(h[1]) };
    }
  } catch {
    return null;
  }
  return null;
}

let cached: BrandLogo | undefined;

/**
 * Locates the official logo in /public/brand. Returns null when the owner has
 * not supplied it yet — components then fall back to the brand name in text.
 * The logo is never redrawn or approximated.
 */
export function getBrandLogo(): BrandLogo {
  if (cached !== undefined && process.env.NODE_ENV === "production") return cached;
  const publicDir = path.join(process.cwd(), "public");
  for (const ext of EXTENSIONS) {
    const rel = `${siteConfig.logo.basePath}.${ext}`;
    const file = path.join(publicDir, rel);
    if (fs.existsSync(file)) {
      const dims = readDimensions(fs.readFileSync(file), ext) ?? { width: 400, height: 120 };
      cached = { src: rel, ...dims, alt: siteConfig.logo.alt };
      return cached;
    }
  }
  cached = null;
  return cached;
}
