import { useId } from "react";
import type { Accent } from "@/content/services";

/**
 * Procedural, editorial print compositions. These are abstract illustrations
 * of printed objects — used in place of stock photography until real GraphInk
 * production photography exists. They never depict real client work.
 */

export type ArtworkKind =
  | "business-card"
  | "flyer"
  | "brochure"
  | "company-profile"
  | "folder"
  | "booklet"
  | "magazine"
  | "catalog"
  | "menu"
  | "poster"
  | "invitation"
  | "certificate"
  | "school"
  | "corporate"
  | "collateral"
  | "sticker"
  | "label"
  | "packaging"
  | "custom";

export const accentHex: Record<Accent, string> = {
  cyan: "#0898D8",
  blue: "#085888",
  magenta: "#E80888",
  pink: "#A81868",
  yellow: "#F8E808",
  orange: "#E87818",
  green: "#089848",
  purple: "#582888",
};

const partner: Record<Accent, Accent> = {
  cyan: "magenta",
  blue: "yellow",
  magenta: "yellow",
  pink: "cyan",
  yellow: "cyan",
  orange: "purple",
  green: "cyan",
  purple: "orange",
};

type Box = { x: number; y: number; w: number; h: number };

function Facets({ x, y, w, h, a, b, flip = false }: Box & { a: string; b: string; flip?: boolean }) {
  // A faceted, prism-like cluster — four planes meeting off-centre.
  const px = x + w * (flip ? 0.38 : 0.62);
  const py = y + h * 0.44;
  return (
    <g style={{ mixBlendMode: "multiply" }}>
      <polygon points={`${x},${y} ${x + w},${y} ${px},${py}`} fill={a} />
      <polygon points={`${x + w},${y} ${x + w},${y + h} ${px},${py}`} fill={b} opacity={0.92} />
      <polygon points={`${x},${y + h} ${x + w},${y + h} ${px},${py}`} fill="#111" opacity={0.88} />
      <polygon points={`${x},${y} ${x},${y + h} ${px},${py}`} fill={a} opacity={0.55} />
    </g>
  );
}

function Lines({ x, y, w, n, gap = 7, weight = 2.4, tone = "#111", fade = 0.18, last = 0.6 }: { x: number; y: number; w: number; n: number; gap?: number; weight?: number; tone?: string; fade?: number; last?: number }) {
  return (
    <g fill={tone} opacity={fade}>
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={x} y={y + i * gap} width={i === n - 1 ? w * last : w} height={weight} rx={0.6} />
      ))}
    </g>
  );
}

function Head({ x, y, w, size = 9, tone = "#111", rows = 2 }: { x: number; y: number; w: number; size?: number; tone?: string; rows?: number }) {
  return (
    <g fill={tone}>
      {Array.from({ length: rows }).map((_, i) => (
        <rect key={i} x={x} y={y + i * (size + 3)} width={i === rows - 1 ? w * 0.62 : w} height={size} rx={0.5} />
      ))}
    </g>
  );
}

function Sheet({ x, y, w, h, r = 0, fill = "#fff", shadow, children }: Box & { r?: number; fill?: string; shadow: string; children?: React.ReactNode }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g transform={r ? `rotate(${r} ${cx} ${cy})` : undefined}>
      <rect x={x} y={y} width={w} height={h} fill={fill} filter={`url(#${shadow})`} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#111" strokeOpacity={0.06} strokeWidth={0.6} />
      {children}
    </g>
  );
}

function Halftone({ x, y, w, h, color, id, step = 5 }: Box & { color: string; id: string; step?: number }) {
  return (
    <>
      <defs>
        <pattern id={id} width={step} height={step} patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
          <circle cx={step / 2} cy={step / 2} r={step * 0.28} fill={color} />
        </pattern>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
    </>
  );
}

export function PrintArtwork({
  kind,
  accent = "cyan",
  className,
  title,
}: {
  kind: ArtworkKind;
  accent?: Accent;
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const sh = `sh${uid}`;
  const ht = `ht${uid}`;
  const A = accentHex[accent];
  const B = accentHex[partner[accent]];

  let body: React.ReactNode;
  switch (kind) {
    case "business-card":
      body = (
        <>
          <Sheet x={96} y={120} w={170} h={98} r={-8} shadow={sh} fill="#161616">
            <Facets x={112} y={138} w={34} h={34} a={A} b={B} />
            <rect x={112} y={190} width={70} height={5} fill="#fff" opacity={0.85} />
            <rect x={112} y={199} width={44} height={3} fill="#fff" opacity={0.35} />
          </Sheet>
          <Sheet x={150} y={82} w={170} h={98} r={6} shadow={sh}>
            <Head x={166} y={100} w={80} size={7} />
            <Lines x={166} y={140} w={70} n={3} gap={6} weight={2} />
            <rect x={150} y={172} width={170} height={8} fill={A} />
            <rect x={286} y={96} width={20} height={20} fill={B} style={{ mixBlendMode: "multiply" }} />
          </Sheet>
        </>
      );
      break;

    case "flyer":
      body = (
        <Sheet x={128} y={36} w={150} h={212} r={-3} shadow={sh}>
          <rect x={128} y={36} width={150} height={112} fill={A} />
          <Halftone x={128} y={36} w={150} h={112} color="#111" id={ht} step={6} />
          <Facets x={188} y={62} w={64} h={64} a={B} b="#fff" />
          <Head x={142} y={160} w={110} size={11} />
          <Lines x={142} y={196} w={120} n={4} />
          <rect x={142} y={228} width={46} height={10} fill="#111" />
        </Sheet>
      );
      break;

    case "brochure":
      body = (
        <g>
          <Sheet x={70} y={62} w={88} h={176} r={0} shadow={sh} fill="#f3f3f1">
            <Lines x={80} y={82} w={66} n={9} gap={8} />
          </Sheet>
          <polygon points="158,62 246,56 246,244 158,238" fill="#fff" filter={`url(#${sh})`} />
          <polygon points="158,62 246,56 246,138 158,140" fill={A} />
          <g style={{ mixBlendMode: "multiply" }}>
            <polygon points="178,80 230,76 204,124" fill={B} />
          </g>
          <Head x={170} y={156} w={64} size={8} />
          <Lines x={170} y={190} w={62} n={4} />
          <polygon points="246,56 334,62 334,238 246,244" fill="#fafaf8" filter={`url(#${sh})`} />
          <rect x={256} y={80} width={66} height={60} fill="#111" />
          <Facets x={268} y={90} w={42} h={40} a={A} b={B} flip />
          <Lines x={256} y={156} w={66} n={6} gap={8} />
          <line x1={158} y1={62} x2={158} y2={238} stroke="#111" strokeOpacity={0.12} />
          <line x1={246} y1={56} x2={246} y2={244} stroke="#111" strokeOpacity={0.12} />
        </g>
      );
      break;

    case "company-profile":
    case "catalog":
      body = (
        <>
          <Sheet x={150} y={46} w={146} h={198} r={4} shadow={sh} fill="#f1f0ec">
            <Lines x={166} y={70} w={110} n={14} gap={10} />
          </Sheet>
          <Sheet x={104} y={52} w={146} h={198} r={-4} shadow={sh} fill={kind === "catalog" ? "#fff" : "#141414"}>
            {kind === "catalog" ? (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <rect key={i} x={118 + (i % 2) * 62} y={70 + Math.floor(i / 2) * 62} width={56} height={54} fill={i === 1 ? A : i === 2 ? B : "#ececea"} style={{ mixBlendMode: "multiply" }} />
                ))}
                <Head x={118} y={204} w={96} size={8} />
              </>
            ) : (
              <>
                <Facets x={120} y={78} w={70} h={70} a={A} b={B} />
                <rect x={120} y={196} width={100} height={9} fill="#fff" />
                <rect x={120} y={210} width={62} height={4} fill="#fff" opacity={0.4} />
                <rect x={104} y={240} width={146} height={10} fill={A} />
              </>
            )}
          </Sheet>
        </>
      );
      break;

    case "folder":
      body = (
        <>
          <Sheet x={176} y={58} w={128} h={176} r={5} shadow={sh}>
            <Head x={190} y={76} w={70} size={6} />
            <Lines x={190} y={104} w={96} n={10} gap={9} />
          </Sheet>
          <Sheet x={96} y={50} w={150} h={200} r={-3} shadow={sh} fill="#181818">
            <Facets x={116} y={74} w={48} h={48} a={A} b={B} />
            <rect x={116} y={138} width={92} height={8} fill="#fff" />
            <polygon points="96,190 246,176 246,250 96,250" fill="#232323" />
            <polygon points="96,190 246,176 246,180 96,194" fill={A} />
          </Sheet>
        </>
      );
      break;

    case "booklet":
    case "magazine":
      body = (
        <>
          <Sheet x={196} y={62} w={118} h={168} r={3} shadow={sh}>
            <Lines x={208} y={80} w={94} n={12} gap={10} />
          </Sheet>
          <Sheet x={88} y={48} w={126} h={184} r={-5} shadow={sh}>
            {kind === "magazine" ? (
              <>
                <rect x={88} y={48} width={126} height={184} fill="#111" />
                <Halftone x={88} y={48} w={126} h={184} color={A} id={ht} step={5} />
                <rect x={100} y={60} width={80} height={16} fill="#fff" />
                <Facets x={120} y={112} w={70} h={80} a={A} b={B} />
                <rect x={100} y={210} width={58} height={4} fill="#fff" opacity={0.6} />
              </>
            ) : (
              <>
                <rect x={88} y={48} width={126} height={70} fill={A} />
                <Head x={100} y={130} w={90} size={9} />
                <Lines x={100} y={166} w={100} n={6} gap={8} />
              </>
            )}
          </Sheet>
          <rect x={86} y={48} width={4} height={184} fill="#111" opacity={0.18} transform="rotate(-5 151 140)" />
        </>
      );
      break;

    case "menu":
      body = (
        <>
          <Sheet x={100} y={40} w={134} h={216} r={-4} shadow={sh} fill="#f6f3ec">
            <rect x={116} y={58} width={34} height={34} fill={A} />
            <Head x={116} y={104} w={86} size={8} rows={1} />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <rect x={116} y={128 + i * 22} width={62} height={3} fill="#111" opacity={0.7} />
                <rect x={116} y={134 + i * 22} width={80} height={2} fill="#111" opacity={0.18} />
                <rect x={206} y={128 + i * 22} width={14} height={3} fill={A} />
              </g>
            ))}
          </Sheet>
          <Sheet x={214} y={96} w={96} h={140} r={7} shadow={sh} fill="#141414">
            <Facets x={232} y={116} w={40} h={40} a={A} b={B} />
            <Lines x={232} y={170} w={60} n={5} tone="#fff" fade={0.35} />
          </Sheet>
        </>
      );
      break;

    case "poster":
      body = (
        <>
          <Sheet x={196} y={50} w={130} h={184} r={4} shadow={sh} fill="#111">
            <Facets x={218} y={78} w={86} h={86} a={B} b={A} />
            <rect x={210} y={196} width={80} height={10} fill="#fff" />
          </Sheet>
          <Sheet x={82} y={30} w={148} h={220} r={-3} shadow={sh}>
            <rect x={82} y={30} width={148} height={220} fill={A} />
            <circle cx={156} cy={122} r={52} fill={B} style={{ mixBlendMode: "multiply" }} />
            <circle cx={176} cy={140} r={52} fill="#111" opacity={0.85} style={{ mixBlendMode: "multiply" }} />
            <rect x={96} y={206} width={96} height={14} fill="#fff" />
            <rect x={96} y={226} width={58} height={5} fill="#fff" opacity={0.7} />
          </Sheet>
        </>
      );
      break;

    case "invitation":
      body = (
        <>
          <Sheet x={96} y={92} w={200} h={134} r={-6} shadow={sh} fill="#1a1a1a">
            <polygon points="96,92 296,92 196,166" fill="#232323" />
            <polygon points="96,92 296,92 196,166" fill="none" stroke={A} strokeWidth={1} opacity={0.8} />
          </Sheet>
          <Sheet x={140} y={48} w={124} h={170} r={4} shadow={sh} fill="#f7f4ee">
            <rect x={150} y={58} width={104} height={150} fill="none" stroke={A} strokeWidth={0.8} />
            <Facets x={186} y={74} w={32} h={32} a={A} b={B} />
            <Head x={164} y={124} w={76} size={7} />
            <Lines x={170} y={158} w={64} n={4} gap={7} />
          </Sheet>
        </>
      );
      break;

    case "certificate":
      body = (
        <Sheet x={70} y={62} w={260} h={180} r={-2} shadow={sh} fill="#fbfaf6">
          <rect x={82} y={74} width={236} height={156} fill="none" stroke="#111" strokeOpacity={0.5} strokeWidth={0.8} />
          <rect x={86} y={78} width={228} height={148} fill="none" stroke={A} strokeWidth={0.6} />
          <Head x={140} y={96} w={120} size={9} rows={1} />
          <rect x={120} y={130} width={160} height={14} fill="#111" />
          <Lines x={128} y={156} w={144} n={2} gap={7} />
          <circle cx={284} cy={200} r={16} fill={A} />
          <polygon points="276,212 272,236 284,228 296,236 292,212" fill={B} style={{ mixBlendMode: "multiply" }} />
          <rect x={112} y={204} width={70} height={1.2} fill="#111" opacity={0.5} />
        </Sheet>
      );
      break;

    case "school":
      body = (
        <>
          {[0, 1, 2].map((i) => (
            <Sheet key={i} x={96 + i * 16} y={50 + i * 10} w={140} h={190} r={-6 + i * 4} shadow={sh}>
              {i === 2 && (
                <>
                  <rect x={128} y={70} width={140} height={34} fill={A} />
                  <rect x={140} y={82} width={60} height={9} fill="#111" />
                  <Lines x={140} y={120} w={112} n={9} gap={10} />
                  <rect x={140} y={214} width={30} height={10} fill={B} style={{ mixBlendMode: "multiply" }} />
                </>
              )}
            </Sheet>
          ))}
        </>
      );
      break;

    case "corporate":
      body = (
        <>
          <Sheet x={84} y={34} w={150} h={212} r={-4} shadow={sh}>
            <Facets x={100} y={52} w={22} h={22} a={A} b={B} />
            <Lines x={100} y={96} w={116} n={12} gap={9} />
            <rect x={84} y={238} width={150} height={8} fill={A} />
          </Sheet>
          <Sheet x={196} y={148} w={140} h={80} r={5} shadow={sh} fill="#f4f3ef">
            <Facets x={210} y={160} w={16} h={16} a={A} b={B} />
            <Lines x={264} y={186} w={56} n={3} gap={6} />
          </Sheet>
          <Sheet x={214} y={60} w={100} h={58} r={-8} shadow={sh} fill="#141414">
            <rect x={226} y={96} width={44} height={4} fill="#fff" />
            <rect x={286} y={70} width={16} height={16} fill={A} />
          </Sheet>
        </>
      );
      break;

    case "collateral":
      body = (
        <>
          <Sheet x={80} y={70} w={110} h={156} r={-8} shadow={sh}>
            <rect x={80} y={70} width={110} height={70} fill={B} />
            <Lines x={92} y={156} w={84} n={6} gap={8} />
          </Sheet>
          <Sheet x={156} y={48} w={110} h={156} r={2} shadow={sh} fill="#111">
            <Facets x={176} y={70} w={70} h={70} a={A} b={B} />
            <rect x={170} y={160} width={70} height={8} fill="#fff" />
          </Sheet>
          <Sheet x={236} y={120} w={88} h={120} r={9} shadow={sh}>
            <rect x={248} y={132} width={64} height={40} fill={A} />
            <Lines x={248} y={184} w={60} n={4} />
          </Sheet>
        </>
      );
      break;

    case "sticker":
      body = (
        <>
          <g filter={`url(#${sh})`}>
            <circle cx={160} cy={140} r={62} fill="#fff" />
            <circle cx={160} cy={140} r={54} fill={A} />
            <Facets x={132} y={112} w={56} h={56} a={B} b="#fff" />
          </g>
          <g filter={`url(#${sh})`} transform="rotate(12 262 170)">
            <rect x={214} y={128} width={96} height={84} rx={14} fill="#fff" />
            <rect x={222} y={136} width={80} height={68} rx={9} fill="#111" />
            <rect x={234} y={176} width={50} height={7} fill="#fff" />
            <rect x={234} y={150} width={18} height={18} fill={B} />
          </g>
          <path d="M120 210 q 20 -8 40 0" stroke="#111" strokeOpacity={0.15} fill="none" strokeDasharray="3 3" />
        </>
      );
      break;

    case "label":
      body = (
        <>
          <g filter={`url(#${sh})`}>
            <rect x={132} y={40} width={124} height={226} rx={30} fill="#1d1d1d" />
            <rect x={150} y={40} width={88} height={30} fill="#2a2a2a" />
          </g>
          <rect x={140} y={112} width={108} height={104} fill="#fbfaf6" />
          <rect x={140} y={112} width={108} height={20} fill={A} />
          <Facets x={176} y={140} w={36} h={36} a={A} b={B} />
          <Lines x={156} y={186} w={76} n={3} gap={7} />
          <g filter={`url(#${sh})`} transform="rotate(-10 300 200)">
            <rect x={266} y={168} width={70} height={56} rx={6} fill="#fff" />
            <rect x={266} y={168} width={70} height={14} rx={3} fill={B} />
          </g>
        </>
      );
      break;

    case "packaging":
      body = (
        <g filter={`url(#${sh})`}>
          <polygon points="200,58 300,98 200,138 100,98" fill="#f4f3ef" />
          <polygon points="100,98 200,138 200,256 100,216" fill="#fff" />
          <polygon points="200,138 300,98 300,216 200,256" fill="#141414" />
          <polygon points="100,138 200,178 200,196 100,156" fill={A} />
          <g style={{ mixBlendMode: "multiply" }}>
            <polygon points="124,120 170,140 146,176" fill={B} />
          </g>
          <polygon points="224,150 276,130 276,190 224,210" fill="none" stroke={A} strokeWidth={1.2} />
          <polygon points="236,160 264,149 250,186" fill={A} />
          <line x1={200} y1={138} x2={200} y2={256} stroke="#000" strokeOpacity={0.2} />
        </g>
      );
      break;

    case "custom":
    default:
      body = (
        <>
          <Sheet x={96} y={70} w={120} h={160} r={-10} shadow={sh}>
            <Facets x={116} y={96} w={80} h={80} a={A} b={B} />
          </Sheet>
          <g filter={`url(#${sh})`} transform="rotate(8 262 150)">
            <path d="M210 90 h86 l20 20 v100 h-106 z" fill="#fff" />
            <path d="M296 90 v20 h20" fill="#eee" />
            <rect x={224} y={122} width={70} height={8} fill="#111" />
            <Lines x={224} y={140} w={76} n={6} />
          </g>
          <circle cx={120} cy={236} r={10} fill="none" stroke="#111" strokeOpacity={0.3} strokeDasharray="2 3" />
        </>
      );
  }

  return (
    <svg viewBox="0 0 400 300" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <filter id={sh} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#000" floodOpacity="0.16" />
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#000" floodOpacity="0.18" />
        </filter>
      </defs>
      {body}
    </svg>
  );
}
